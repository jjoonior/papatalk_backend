import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityEntity } from './community.entity';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
import { CommentLikeEntity } from './commentLike.entity';
import { ProfileImageEntity } from './profileImage.entity';
import { BabyEntity } from './baby.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  nickname: string;

  @Column({
    type: 'boolean',
    name: 'terms_agreed',
  })
  termsAgreed: boolean;

  @Column({
    type: 'boolean',
    name: 'privacy_policy_agreed',
  })
  privacyPolicyAgreed: boolean;

  @OneToMany(() => CommunityEntity, (community) => community.user)
  communities: CommunityEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @OneToMany(() => CommentLikeEntity, (commentLike) => commentLike.user)
  commentLikes: CommentLikeEntity[];

  @OneToOne(() => ProfileImageEntity, (profileImage) => profileImage.user)
  @JoinColumn()
  profileImage: ProfileImageEntity;

  @ManyToMany(() => BabyEntity, (baby) => baby.users)
  @JoinTable()
  babies: BabyEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
