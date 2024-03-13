import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityEntity } from '../entity/community.entity';
import { UserEntity } from '../entity/user.entity';
import { CommentEntity } from '../entity/comment.entity';
import { CategoryEntity } from '../entity/category.entity';
import { AuthModule } from '../auth/auth.module';
import { CommentLikeEntity } from '../entity/commentLike.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityEntity,
      UserEntity,
      CommentEntity,
      CategoryEntity,
      CommentLikeEntity,
    ]),
    AuthModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
