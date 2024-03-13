import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';

@Entity('commentLike')
export class CommentLikeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.commentLikes)
  @JoinColumn()
  comment: CommentEntity;

  @ManyToOne(() => UserEntity, (user) => user.commentLikes)
  @JoinColumn()
  user: UserEntity;
}
