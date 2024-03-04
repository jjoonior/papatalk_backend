import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('duplication-check')
  async duplicationCheck(
    @Query('id') id: string,
    @Query('nickname') nickname: string,
  ) {
    if (!!id) {
      await this.authService.duplicationCheckId(id);
    }
    if (!!nickname) {
      await this.authService.duplicationCheckNickname(nickname);
    }
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res) {
    return await this.authService.signup(
      res,
      dto.id,
      dto.nickname,
      dto.password,
      dto.termsAgreed,
      dto.privacyPolicyAgreed,
    );
  }
}
