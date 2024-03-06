import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CommunityEntity } from './community.entity';

@Entity('comment')
export class CommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => CommunityEntity, (community) => community.comments)
  @JoinColumn()
  community: CommunityEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
