import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { ProfileImageEntity } from '../../entity/profileImage.entity';
import { AwsS3Service } from '../../utils/awsS3.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileImageEntity)
    private readonly ProfileImageRepository: Repository<ProfileImageEntity>,
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

  async changePassword(user: UserEntity, originPassword, newPassword) {
    const checkPassword = await bcrypt.compare(originPassword, user.password);
    if (!checkPassword) {
      throw new UnauthorizedException('비밀번호를 확인해 주세요.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
  }
}
