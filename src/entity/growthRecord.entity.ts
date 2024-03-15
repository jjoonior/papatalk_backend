import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BabyEntity } from './baby.entity';

@Entity('growthRecord')
export class GrowthRecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BabyEntity, (baby) => baby.growthRecords)
  baby: BabyEntity;

  @Column()
  month: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  height: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  weight: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
