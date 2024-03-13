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
import { ContentsTypeEnum } from '../entity/contentsType.enum';

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
  ) {}

  async getCommunityList(
    page: number,
    sort: string,
    search: string,
    take: number,
  ) {
    const skip = (page - 1) * take;

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
  }

  async getCommunityDetail(id: number) {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: { user: true, category: true },
    });

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
    await this.communityRepository.remove(community);
  }
}
