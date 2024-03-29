import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SexEnum } from './enum/sex.enum';

@Entity('growthStatistics')
export class GrowthStatisticsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sex: SexEnum;

  @Column()
  month: number;

  @Column()
  percentile: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  height: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  weight: number;

  @Column({
    nullable: true,
  })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
