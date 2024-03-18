import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { CommentEntity } from '../entity/comment.entity';
import { ContentsTypeEnum } from '../entity/enum/contentsType.enum';
import { CommentLikeEntity } from '../entity/commentLike.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(CommentLikeEntity)
    private readonly commentLikeRepository: Repository<CommentLikeEntity>,
  ) {}

  async getCommentList(
    contentsType: ContentsTypeEnum,
    contentsId: number,
    page: number,
    sort: string,
    take: number,
  ) {
    const skip = (page - 1) * take;

    // todo sort 적용
    return await this.commentRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .loadRelationCountAndMap('c.likes', 'c.commentLikes')
      .where('c.contentsType = :contentsType', {
        contentsType,
      })
      .andWhere('c.contentsId = :contentsId', {
        contentsId,
      })
      .orderBy('c.createdAt', 'DESC')
      .offset(skip)
      .limit(take)
      .getManyAndCount();
  }

  async isLiked(user: UserEntity, commentIdList) {
    const likedCommentList = await this.commentLikeRepository.find({
      select: {
        comment: { id: true },
      },
      where: {
        user: { id: user.id },
        comment: { id: In(commentIdList) },
      },
      relations: { comment: true },
    });

    return likedCommentList.map((c) => c.comment.id);
  }

  async createComment(
    contentsType: ContentsTypeEnum,
    contentsId: number,
    content: string,
    user: UserEntity,
  ) {
    return await this.commentRepository
      .create({
        content,
        contentsType,
        contentsId,
        user,
      })
      .save();
  }

  async updateComment(
    contentsType: ContentsTypeEnum,
    contentsId: number,
    id: number,
    content: string,
  ) {
    const comment = await this.commentRepository.findOneBy({
      contentsType,
      contentsId,
      id,
    });

    comment.content = content;
    await comment.save();

    return comment;
  }

  async deleteComment(
    contentsType: ContentsTypeEnum,
    contentsId: number,
    id: number,
  ) {
    return await this.commentRepository.delete({
      contentsType,
      contentsId,
      id,
    });
  }

  async toggleCommentLike(user: UserEntity, id: number) {
    const liked = await this.commentLikeRepository.findOneBy({
      user: { id: user.id },
      comment: { id },
    });

    if (liked) {
      await this.commentLikeRepository.remove(liked);
      return false;
    } else {
      await this.commentLikeRepository
        .create({
          user,
          comment: { id },
        })
        .save();
      return true;
    }
  }
}
