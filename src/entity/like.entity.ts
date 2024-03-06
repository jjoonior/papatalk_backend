import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('like')
export class LikeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contentsType: string;

  @Column()
  contentsId: number;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  @JoinColumn()
  user: UserEntity;
}
