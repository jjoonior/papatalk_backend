import { Module } from '@nestjs/common';
import { SosController } from './sos.controller';
import { SosService } from './sos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityEntity } from '../entity/community.entity';
import { UserEntity } from '../entity/user.entity';
import { CommentEntity } from '../entity/comment.entity';
import { LikeEntity } from '../entity/like.entity';
import { ContentsImageEntity } from '../entity/contentsImage.entity';
import { AuthModule } from '../auth/auth.module';
import { UtilsModule } from '../utils/utils.module';
import { SosEntity } from '../entity/sos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityEntity,
      UserEntity,
      CommentEntity,
      LikeEntity,
      ContentsImageEntity,
      SosEntity,
    ]),
    AuthModule,
    UtilsModule,
  ],
  controllers: [SosController],
  providers: [SosService],
})
export class SosModule {}
