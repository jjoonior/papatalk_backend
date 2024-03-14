import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ContentsTypeEnum } from './contentsType.enum';
import { CommentLikeEntity } from './commentLike.entity';

@Entity('comment')
export class CommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: ContentsTypeEnum,
  })
  contentsType: string;

  @Column()
  contentsId: number;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => CommentLikeEntity, (commentLike) => commentLike.comment)
  commentLikes: CommentLikeEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
