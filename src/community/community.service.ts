import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { Like, Repository } from 'typeorm';
import { CommunityEntity } from '../entity/community.entity';
import { CommentEntity } from '../entity/comment.entity';
import { CategoryEntity } from '../entity/category.entity';
import { LikeEntity } from '../entity/like.entity';
import { ContentsTypeEnum } from '../entity/enum/contentsType.enum';
import { ContentsImageEntity } from '../entity/contentsImage.entity';
import { AwsS3Service } from '../utils/awsS3.service';
import { SortEnum } from '../entity/enum/sort.enum';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    @InjectRepository(ContentsImageEntity)
    private readonly contentsImageRepository: Repository<ContentsImageEntity>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async getCommunityList(
    page: number,
    sort: SortEnum,
    search: string,
    take: number,
  ) {
    const skip = (page - 1) * take;
    switch (sort) {
      case SortEnum.CREATED_AT:
        return await this.communityRepository.findAndCount({
          select: {
            id: true,
            title: true,
            views: true,
            likes: true,
            createdAt: true,
            user: {
              nickname: true,
            },
            category: {
              category: true,
            },
          },
          skip,
          take,
          where: { title: Like(`%${search}%`) },
          order: { createdAt: 'desc' },
          relations: { user: true, category: true },
        });
      case SortEnum.LIKES:
        return await this.communityRepository.findAndCount({
          select: {
            id: true,
            title: true,
            views: true,
            likes: true,
            createdAt: true,
            user: {
              nickname: true,
            },
            category: {
              category: true,
            },
          },
          skip,
          take,
          where: { title: Like(`%${search}%`) },
          order: { likes: 'desc' },
          relations: { user: true, category: true },
        });
    }
  }

  async getCommunityDetail(id: number) {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: { user: { profileImage: true }, category: true },
    });

    const images = await this.contentsImageRepository.findBy({
      contentsType: ContentsTypeEnum.COMMUNITY,
      contentsId: community.id,
    });

    community['images'] = images.map((image) => image.url);

    if (!community) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    community.views++;
    await community.save();

    return community;
  }

  async isLiked(user: UserEntity, id: number) {
    const liked = await this.likeRepository.findOne({
      where: {
        contentsType: ContentsTypeEnum.COMMUNITY,
        contentsId: id,
        user: { id: user.id },
      },
    });

    return !!liked;
  }

  async createCommunity(
    user: UserEntity,
    title: string,
    content: string,
    category: string,
  ) {
    const categoryEntity = await this.categoryRepository.findOneBy({
      category,
    });
    if (!categoryEntity) {
      throw new BadRequestException('존재하지 않는 카테고리입니다.');
    }

    return await this.communityRepository
      .create({
        user,
        title,
        content,
        category: categoryEntity,
      })
      .save();
  }

  async saveCommunityImages(community: CommunityEntity, images) {
    const contentsImageList: ContentsImageEntity[] = [];

    //todo 확장자 체크
    const s3ResultList = await Promise.all(
      images.map((image) => this.awsS3Service.uploadFile(image)),
    );

    s3ResultList.forEach((r) => {
      const contentsImage = new ContentsImageEntity();
      contentsImage.key = r.key;
      contentsImage.url = r.url;
      contentsImage.contentsType = ContentsTypeEnum.COMMUNITY;
      contentsImage.contentsId = community.id;

      contentsImageList.push(contentsImage);
    });

    return await this.contentsImageRepository.insert(contentsImageList);
  }

  async getCommunity(id: number) {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!community) {
      throw new NotFoundException('존재하지 않는 글입니다.');
    }

    return community;
  }

  async isAuthor(user: UserEntity, community: CommunityEntity) {
    if (user.id != community.user.id) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
  }

  async updateCommunity(community: CommunityEntity, dto) {
    const categoryEntity = await this.categoryRepository.findOneBy({
      category: dto.category,
    });
    if (!categoryEntity) {
      throw new BadRequestException('존재하지 않는 카테고리입니다.');
    }

    community.title = dto.title;
    community.content = dto.content;
    community.category = categoryEntity;

    await community.save();
  }

  async deleteCommunity(community: CommunityEntity) {
    const images = await this.contentsImageRepository.findBy({
      contentsType: ContentsTypeEnum.COMMUNITY,
      contentsId: community.id,
    });

    const s3KeyList = images.map((image: ContentsImageEntity) => image.key);

    await this.contentsImageRepository.remove(images);
    await this.communityRepository.remove(community);

    return s3KeyList;
  }

  async deleteCommunityImages(keys: string[]) {
    return await Promise.all(
      keys.map((key) => this.awsS3Service.deleteFile(key)),
    );
  }

  async toggleCommunityLike(user: UserEntity, community: CommunityEntity) {
    const liked = await this.likeRepository.findOneBy({
      contentsType: ContentsTypeEnum.COMMUNITY,
      contentsId: community.id,
      user: { id: user.id },
    });

    if (liked) {
      community.likes--;
      await community.save();
      await this.likeRepository.remove(liked);
      return false;
    } else {
      community.likes++;
      await community.save();
      await this.likeRepository
        .create({
          contentsType: ContentsTypeEnum.COMMUNITY,
          contentsId: community.id,
          user,
        })
        .save();
      return true;
    }
  }
}
