import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager,
  ) {}

  async duplicationCheckEmail(email: string) {
    if (!!(await this.userEntityRepository.findOneBy({ email }))) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }
  }

  async duplicationCheckNickname(nickname: string) {
    if (!!(await this.userEntityRepository.findOneBy({ nickname }))) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }
  }

  async signup(
    res,
    email: string,
    nickname: string,
    password: string,
    termsAgreed: boolean,
    privacyPolicyAgreed: boolean,
  ) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.duplicationCheckEmail(email);
    await this.duplicationCheckNickname(nickname);

    if (!termsAgreed || !privacyPolicyAgreed) {
      throw new BadRequestException(
        '회원가입을 완료하려면 이용약관과 개인정보취급방침에 모두 동의해야 합니다.',
      );
    }

    const newUserObject = await this.userEntityRepository.create({
      email,
      nickname,
      password: hashedPassword,
      termsAgreed,
      privacyPolicyAgreed,
    });
    const newUser = await this.userEntityRepository.save(newUserObject);

    const token = await this.signToken(res, newUser);
    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      // userId: newUser.id,
      nickname: newUser.nickname,
      profileImage: newUser.nickname,
    };
  }

  async login(res, email: string, password: string) {
    const user = await this.userEntityRepository.findOne({
      where: { email },
      relations: { profileImage: true },
    });
    if (!user) {
      throw new UnauthorizedException('로그인에 실패했습니다.');
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      throw new UnauthorizedException('로그인에 실패했습니다.');
    }

    const token = await this.signToken(res, user);
    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      // userId: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage?.url || user.nickname,
    };
  }

  async signToken(res, user) {
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        nickname: user.nickname,
        type: 'access',
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRE),
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
        nickname: user.nickname,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRE),
      },
    );

    await this.storeToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async storeToken(id: string, refreshToken: string) {
    const token = { refreshToken };
    const key = `token:${id}`;
    await this.cacheManager.set(key, token, {
      ttl: Number(process.env.JWT_REFRESH_EXPIRE),
    });
  }

  async getToken(id: string) {
    const key = `token:${id}`;
    const token = await this.cacheManager.get(key);
    if (token) {
      return {
        refreshToken: token['refreshToken'],
      };
    } else {
      return null;
    }
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async reissueToken(req, res) {
    const [type, accessToken, refreshToken] =
      req.headers.authorization?.split(' ') ?? [];

    if (type != 'Bearer' || !refreshToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const payload = this.verifyToken(refreshToken);
    if (payload.type != 'refresh') {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const storedToken = await this.getToken(payload.id);
    if (storedToken.refreshToken !== refreshToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const user = await this.userEntityRepository.findOne({
      where: { id: payload.id },
      relations: { profileImage: true },
    });

    const token = await this.signToken(res, payload);
    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      // userId: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage?.url || user.nickname,
    };
  }

  async getUserByPayload(payload): Promise<UserEntity> {
    return await this.userEntityRepository.findOne({
      where: { id: payload.id },
      relations: { profileImage: true },
    });
  }

  async createResetPasswordLink(email) {
    const user = await this.userEntityRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('메일 주소를 다시 확인해주세요.');
    }

    const token = crypto.randomUUID();
    const key = `resetPasswordLink:email:${email}:token:${token}`;
    await this.cacheManager.set(key, 'NOT_RESET', {
      ttl: Number(process.env.RESET_PASSWORD_LINK_TTL),
    });

    return `${process.env.APP_DOMAIN}/auth/reset-password?email=${email}&token=${token}`;
  }

  async getResetPassword(email, token) {
    const user = await this.userEntityRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('메일 주소를 다시 확인해주세요.');
    }

    const key = `resetPasswordLink:email:${email}:token:${token}`;
    let resetPassword = await this.cacheManager.get(key);
    const ttl = await this.cacheManager.store.ttl(key);

    if (resetPassword) {
      if (resetPassword === 'NOT_RESET') {
        // 임시 비밀번호 생성
        resetPassword = await this.generateRandomPassword(10);

        // 유저 비밀번호 저장
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(resetPassword, salt);
        user.password = hashedPassword;
        await user.save();

        // 임시 비밀번호 메모리에 저장 (남은 TTL 적용)
        await this.cacheManager.set(key, resetPassword, { ttl });
      }
      return resetPassword;
    } else {
      throw new BadRequestException('잘못된 접근입니다.');
    }
  }

  async generateRandomPassword(length) {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|:;<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
}
