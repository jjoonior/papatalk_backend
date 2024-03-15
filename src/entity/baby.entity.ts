import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SexEnum } from './enum/sex.enum';
import { UserEntity } from './user.entity';
import { GrowthRecordEntity } from './growthRecord.entity';

@Entity('baby')
export class BabyEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sex: SexEnum;

  @Column({ type: 'date' })
  birth: Date;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  height: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  weight: number;

  @ManyToMany(() => UserEntity, (user) => user.babies)
  users: UserEntity[];

  @OneToMany(() => GrowthRecordEntity, (growthRecord) => growthRecord.baby)
  growthRecords: GrowthRecordEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
