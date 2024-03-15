import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entity/user.entity';
import { BabyEntity } from '../../entity/baby.entity';
import { GrowthRecordEntity } from '../../entity/growthRecord.entity';

@Injectable()
export class BabyService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(BabyEntity)
    private readonly babyRepository: Repository<BabyEntity>,
    @InjectRepository(GrowthRecordEntity)
    private readonly growthRecordRepository: Repository<GrowthRecordEntity>,
  ) {}

  async getBabyInfo(user: UserEntity) {
    return await this.babyRepository.findOne({
      where: {
        users: { id: user.id },
      },
    });
  }

  async saveBabyInfo(user: UserEntity, sex, birth, height, weight) {
    return await this.babyRepository
      .create({
        sex,
        birth,
        height,
        weight,
        users: [user],
      })
      .save();
  }

  async saveGrowthRecord(user: UserEntity, sex, birth, height, weight) {
    let baby = await this.getBabyInfo(user);
    if (!baby) {
      baby = await this.saveBabyInfo(user, sex, birth, height, weight);
    }

    baby.sex = sex;
    baby.birth = birth;
    baby.height = height;
    baby.weight = weight;
    await baby.save();

    const todayYear = new Date().getFullYear();
    const todayMonth = new Date().getMonth();
    const todayDay = new Date().getDay();
    const birthYear = new Date(birth).getFullYear();
    const birthMonth = new Date(birth).getMonth();
    const birthDay = new Date(birth).getDay();

    let month = (todayYear - birthYear) * 12 + (todayMonth - birthMonth);
    if (todayDay < birthDay) {
      month--;
    }

    await this.growthRecordRepository
      .create({
        baby,
        month,
        height,
        weight,
      })
      .save();
  }
}
