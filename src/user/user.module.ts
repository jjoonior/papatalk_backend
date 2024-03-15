import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
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
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
