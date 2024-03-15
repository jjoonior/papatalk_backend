import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ContentsTypeEnum } from './enum/contentsType.enum';

@Entity('like')
export class LikeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ContentsTypeEnum,
  })
  contentsType: string;

  @Column()
  contentsId: number;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  @JoinColumn()
  user: UserEntity;
}
