import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { Like, Repository } from 'typeorm';
import { CommentEntity } from '../entity/comment.entity';
import { LikeEntity } from '../entity/like.entity';
import { ContentsTypeEnum } from '../entity/enum/contentsType.enum';
import { ContentsImageEntity } from '../entity/contentsImage.entity';
import { AwsS3Service } from '../utils/awsS3.service';
import { SosSortEnum } from '../entity/enum/sort.enum';
import crypto from 'crypto';
import { SosEntity } from '../entity/sos.entity';

@Injectable()
export class SosService {
  constructor(
    @InjectRepository(SosEntity)
    private readonly sosRepository: Repository<SosEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    @InjectRepository(ContentsImageEntity)
    private readonly contentsImageRepository: Repository<ContentsImageEntity>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async getSosList(
    page: number,
    sort: SosSortEnum,
    search: string,
    take: number,
  ) {
    const skip = (page - 1) * take;

    return await this.sosRepository.query(`
        select s.id,
               s.title,
               s.content,
               s.views,
               s.likes,
               s.created_at                              as createdAt,
--                u.nickname                                as authorNickname,
               case when cnt is null then 0 else cnt end as commentsCount,
               count(*)                                     over() as totalCount
        from sos s
--                  left join user u on u.id = s.userId
                 left join (select contentsType, contentsId, count(*) as cnt
                            from comment
                            where contentsType = '${ContentsTypeEnum.SOS}'
                            group by contentsType, contentsId) cmt on cmt.contentsId = s.id
        where s.title like '%${search}%'
        order by ${sort} desc
            limit ${take}
        offset ${skip}
    `);
  }

  async getSosDetail(id: number) {
    const sos = await this.sosRepository.findOne({
      where: { id },
      relations: { user: { profileImage: true } },
    });

    const images = await this.contentsImageRepository.findBy({
      contentsType: ContentsTypeEnum.SOS,
      contentsId: sos.id,
    });

    sos['images'] = images.map((image) => image.url);

    if (!sos) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    sos.views++;
    await sos.save();

    return sos;
  }

  async isLiked(user: UserEntity, id: number) {
    const liked = await this.likeRepository.findOne({
      where: {
        contentsType: ContentsTypeEnum.SOS,
        contentsId: id,
        user: { id: user.id },
      },
    });

    return !!liked;
  }

  async createSos(user: UserEntity, title: string, content: string) {
    return await this.sosRepository
      .create({
        user,
        title,
        content,
      })
      .save();
  }

  async saveSosImages(sos: SosEntity, images) {
    const contentsImageList: ContentsImageEntity[] = [];

    //todo 확장자 체크
    const s3ResultList = await Promise.all(
      images.map((image) => {
        const key = crypto.randomUUID();
        return this.awsS3Service.uploadFile(key, image);
      }),
    );

    s3ResultList.forEach((r) => {
      const contentsImage = new ContentsImageEntity();
      contentsImage.key = r.key;
      contentsImage.url = r.url;
      contentsImage.contentsType = ContentsTypeEnum.SOS;
      contentsImage.contentsId = sos.id;

      contentsImageList.push(contentsImage);
    });

    return await this.contentsImageRepository.insert(contentsImageList);
  }

  async getSos(id: number) {
    const sos = await this.sosRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!sos) {
      throw new NotFoundException('존재하지 않는 글입니다.');
    }

    return sos;
  }

  async isAuthor(user: UserEntity, sos: SosEntity) {
    if (user.id != sos.user.id) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
  }

  async updateSos(sos: SosEntity, dto) {
    sos.title = dto.title;
    sos.content = dto.content;

    const uploadedImages = await this.contentsImageRepository.findBy({
      contentsType: ContentsTypeEnum.COMMUNITY,
      contentsId: sos.id,
    });
    const deletedImages = uploadedImages.filter(
      (image) => !dto.uploadedImages.includes(image.url),
    );

    await this.contentsImageRepository.remove(deletedImages);

    await sos.save();
  }

  async deleteSos(sos: SosEntity) {
    const images = await this.contentsImageRepository.findBy({
      contentsType: ContentsTypeEnum.SOS,
      contentsId: sos.id,
    });

    const s3KeyList = images.map((image: ContentsImageEntity) => image.key);

    await this.contentsImageRepository.remove(images);
    await this.sosRepository.remove(sos);

    return s3KeyList;
  }

  async deleteSosImages(keys: string[]) {
    return await Promise.all(
      keys.map((key) => this.awsS3Service.deleteFile(key)),
    );
  }

  async toggleSosLike(user: UserEntity, sos: SosEntity) {
    const liked = await this.likeRepository.findOneBy({
      contentsType: ContentsTypeEnum.SOS,
      contentsId: sos.id,
      user: { id: user.id },
    });

    if (liked) {
      sos.likes--;
      await sos.save();
      await this.likeRepository.remove(liked);
      return false;
    } else {
      sos.likes++;
      await sos.save();
      await this.likeRepository
        .create({
          contentsType: ContentsTypeEnum.SOS,
          contentsId: sos.id,
          user,
        })
        .save();
      return true;
    }
  }
}
