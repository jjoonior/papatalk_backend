import { Injectable } from '@nestjs/common';
import { CommunityEntity } from '../entity/community.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { CommentEntity } from '../entity/comment.entity';
import { LikeEntity } from '../entity/like.entity';
import { ContentsTypeEnum } from '../entity/contentsType.enum';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
  ) {}

  async getCommentList(contentsId: number, page, sort, take) {
    const skip = (page - 1) * take;

    return await this.commentRepository.findAndCount({
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          nickname: true,
        },
      },
      skip,
      take,
      where: { contentsType: ContentsTypeEnum.COMMUNITY, contentsId },
      order: { createdAt: 'desc' },
      relations: { user: true },
    });
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
