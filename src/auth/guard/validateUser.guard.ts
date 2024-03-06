import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../entity/user.entity';

@Injectable()
export class ValidateUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const accessToken = req.cookies['accessToken'];
    if (accessToken) {
      const payload = this.authService.verifyToken(accessToken);
      const user: UserEntity = await this.authService.getUserByPayload(payload);
      if (user) {
        req.user = user;
      }
    }
    return true;
  }
}
