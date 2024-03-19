import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../entity/user.entity';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const accessToken = this.extractTokenFromHeader(req);
    if (!accessToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const payload = this.authService.verifyToken(accessToken);
    const user: UserEntity = await this.authService.getUserByPayload(payload);
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    req.user = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, accessToken, refreshToken] =
      request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? accessToken.split(',')[0] : undefined;
  }
}
