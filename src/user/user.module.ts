import { Module } from '@nestjs/common';
import { UserProfileController } from './profile/userProfile.controller';
import { UserProfileService } from './profile/userProfile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityEntity } from '../entity/community.entity';
import { UserEntity } from '../entity/user.entity';
import { CommentEntity } from '../entity/comment.entity';
import { CategoryEntity } from '../entity/category.entity';
import { LikeEntity } from '../entity/like.entity';
import { ContentsImageEntity } from '../entity/contentsImage.entity';
import { AuthModule } from '../auth/auth.module';
import { UtilsModule } from '../utils/utils.module';
import { ProfileImageEntity } from '../entity/profileImage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ProfileImageEntity,
      CommunityEntity,
      CommentEntity,
      CategoryEntity,
      LikeEntity,
      ContentsImageEntity,
    ]),
    AuthModule,
    UtilsModule,
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserModule {}
