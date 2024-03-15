import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { ProfileImageEntity } from '../entity/profileImage.entity';
import { AwsS3Service } from '../utils/awsS3.service';
import * as crypto from 'crypto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileImageEntity)
    private readonly ProfileImageRepository: Repository<ProfileImageEntity>, // @InjectRepository(UserEntity) // private readonly userEntityRepository: Repository<UserEntity>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async duplicationCheckNickname(user: UserEntity, nickname: string) {
    if (user.nickname == nickname) {
      return;
    }

    if (!!(await this.userRepository.findOneBy({ nickname }))) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }
  }

  async updateUserProfile(user: UserEntity, profileImage, nickname) {
    if (!!nickname) {
      await this.duplicationCheckNickname(user, nickname);
      user.nickname = nickname;
      await user.save();
    }

    if (!!profileImage) {
      const key = user.profileImage?.key || crypto.randomUUID();
      const { url } = await this.awsS3Service.uploadFile(key, profileImage);

      if (user.profileImage) {
        user.profileImage.url = url;
        await user.profileImage.save();
      } else {
        const newProfileImageEntity = await this.ProfileImageRepository.create({
          key,
          url,
        }).save();
        user.profileImage = newProfileImageEntity;
        await user.save();
      }
    }
  }
}
