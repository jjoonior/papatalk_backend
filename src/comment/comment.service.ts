import { Injectable } from '@nestjs/common';
import { CommunityEntity } from '../entity/community.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { CommentEntity } from '../entity/comment.entity';
import { ContentsTypeEnum } from '../entity/contentsType.enum';
import { CommentLikeEntity } from '../entity/commentLike.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(CommentLikeEntity)
    private readonly CommentLikeRepository: Repository<CommentLikeEntity>,
  ) {}

  async getCommentList(
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
        contentsType: ContentsTypeEnum.COMMUNITY,
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
    const likedCommentList = await this.CommentLikeRepository.find({
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

  async createComment(contentsId: number, content: string, user: UserEntity) {
    return await this.commentRepository
      .create({
        content,
        contentsType: ContentsTypeEnum.COMMUNITY,
        contentsId,
        user,
      })
      .save();
  }

  async updateComment(contentsId: number, id: number, content: string) {
    const comment = await this.commentRepository.findOneBy({
      contentsType: ContentsTypeEnum.COMMUNITY,
      contentsId,
      id,
    });

    comment.content = content;
    await comment.save();

    return comment;
  }

  async deleteComment(contentsId: number, id: number) {
    // await this.commentRepository.remove(community);
    return await this.commentRepository.delete({
      contentsType: ContentsTypeEnum.COMMUNITY,
      contentsId,
      id,
    });
  }
}
