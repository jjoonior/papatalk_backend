import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'login_id',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  loginId: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
