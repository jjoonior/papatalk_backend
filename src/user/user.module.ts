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
import { BabyController } from './baby/baby.controller';
import { BabyService } from './baby/baby.service';
import { BabyEntity } from '../entity/baby.entity';
import { GrowthRecordEntity } from '../entity/growthRecord.entity';
import { SosEntity } from '../entity/sos.entity';
import { UserActivityController } from './activity/userActivity.controller';
import { UserActivityService } from './activity/userActivity.service';

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
      BabyEntity,
      GrowthRecordEntity,
      SosEntity,
    ]),
    AuthModule,
    UtilsModule,
  ],
  controllers: [UserProfileController, UserActivityController, BabyController],
  providers: [UserProfileService, UserActivityService, BabyService],
})
export class UserModule {}
