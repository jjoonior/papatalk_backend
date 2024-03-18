import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../../entity/community.entity';
import { CommentEntity } from '../../entity/comment.entity';
import { ContentsTypeEnum } from '../../entity/enum/contentsType.enum';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async getContentsList(
    user: UserEntity,
    contentsType,
    page: number,
    take: number,
  ) {
    const skip = (page - 1) * take;

    const communityQuery = `
        select '${ContentsTypeEnum.COMMUNITY}' as contentsType,
               c.id                            as contentsId,
               title,
               u.nickname                      as authorNickname,
               c.created_at,
               views,
               likes
        from community c
                 join user u on c.userId = u.id
        where userId = ${user.id}`;

    const sosQuery = `
        select '${ContentsTypeEnum.SOS}' as contentsType,
               s.id                      as contentsId,
               title,
               u.nickname                as authorNickname,
               s.created_at,
               views,
               likes
        from sos s
                 join user u on s.userId = u.id
        where userId = ${user.id}`;

    let q = '';
    switch (contentsType) {
      case ContentsTypeEnum.COMMUNITY:
        q = communityQuery;
        break;
      case ContentsTypeEnum.SOS:
        q = sosQuery;
        break;
      default:
        q = `${communityQuery} union ${sosQuery}`;
    }

    return await this.commentRepository.query(`
        select *, count(*) over() as totalCount
        from (${q}) a
        order by a.created_at
            limit ${take}
        offset ${skip}
    `);
  }

  async getCommentList(
    user: UserEntity,
    contentsType,
    page: number,
    take: number,
  ) {
    const skip = (page - 1) * take;

    const communityQuery = `
        select '${ContentsTypeEnum.COMMUNITY}' as contentsType,
               c.id                            as contentsId,
               title,
               u.nickname                      as authorNickname,
               c.created_at,
               views,
               likes
        from community c
                 join user u on c.userId = u.id
        where c.id in (select contentsId
                       from comment
                       where userId = ${user.id}
                         and contentsType = '${ContentsTypeEnum.COMMUNITY}')`;

    const sosQuery = `
        select '${ContentsTypeEnum.SOS}' as contentsType,
               s.id                      as contentsId,
               title,
               u.nickname                as authorNickname,
               s.created_at,
               views,
               likes
        from sos s
                 join user u on s.userId = u.id
        where s.id in (select contentsId
                       from comment
                       where userId = ${user.id}
                         and contentsType = '${ContentsTypeEnum.SOS}')`;

    let q = '';
    switch (contentsType) {
      case ContentsTypeEnum.COMMUNITY:
        q = communityQuery;
        break;
      case ContentsTypeEnum.SOS:
        q = sosQuery;
        break;
      default:
        q = `${communityQuery} union ${sosQuery}`;
    }

    return await this.commentRepository.query(`
        select *, count(*) over() as totalCount
        from (${q}) a
        order by a.created_at
            limit ${take}
        offset ${skip}
    `);
  }
}
