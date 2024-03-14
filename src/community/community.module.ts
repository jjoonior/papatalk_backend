import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { CommunityEntity } from '../entity/community.entity';
import { CommentEntity } from '../entity/comment.entity';
import { AuthModule } from '../auth/auth.module';
import { CategoryEntity } from '../entity/category.entity';
import { LikeEntity } from '../entity/like.entity';
import { UtilsModule } from '../utils/utils.module';
import { ContentsImageEntity } from '../entity/contentsImage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityEntity,
      UserEntity,
      CommentEntity,
      CategoryEntity,
      LikeEntity,
      ContentsImageEntity,
    ]),
    AuthModule,
    UtilsModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
