import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TokenResDto } from './dto/tokenRes.dto';
import { EmailService } from '../email/email.service';

@Controller('auth')
@ApiTags('Auth')
@ApiInternalServerErrorResponse({
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Get('duplication-check')
  @ApiOperation({
    summary: '회원가입 중복 체크',
    description: '이메일 또는 닉네임의 중복 유무를 확인한다.',
  })
  @ApiOkResponse()
  @ApiQuery({
    name: 'email',
    description: '이메일',
    example: 'example@example.com',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'nickname',
    description: '닉네임',
    example: '아무개',
    required: false,
    type: String,
  })
  @ApiConflictResponse({
    description: '입력한 이메일/닉네임이 이미 존재하는 경우',
    schema: {
      example: {
        message: '이미 존재하는 이메일입니다.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async duplicationCheck(
    @Query('email') email: string,
    @Query('nickname') nickname: string,
  ) {
    if (!!email) {
      await this.authService.duplicationCheckEmail(email);
    }
    if (!!nickname) {
      await this.authService.duplicationCheckNickname(nickname);
    }
  }

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
    description: '회원가입',
  })
  @ApiCreatedResponse({
    type: TokenResDto,
  })
  @ApiBadRequestResponse({
    description: '약관에 모두 동의하지 않은 경우',
    schema: {
      example: {
        message:
          '회원가입을 완료하려면 이용약관과 개인정보취급방침에 모두 동의해야 합니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiConflictResponse({
    description: '입력한 이메일/닉네임이 이미 존재하는 경우',
    schema: {
      example: {
        message: '이미 존재하는 이메일입니다.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res,
  ): Promise<TokenResDto> {
    return await this.authService.signup(
      res,
      dto.email,
      dto.nickname,
      dto.password,
      dto.termsAgreed,
      dto.privacyPolicyAgreed,
    );
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '로그인',
  })
  @ApiOkResponse({
    description: '등록된 아기 정보가 있는 경우',
    type: TokenResDto,
  })
  @ApiResponse({
    status: 209,
    description: '등록된 아기 정보가 없을 경우',
    type: TokenResDto,
  })
  @ApiUnauthorizedResponse({
    description: '이메일이 존재하지 않거나 비밀번호를 틀린 경우',
    schema: {
      example: {
        message: '로그인에 실패했습니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async login(@Body() dto: LoginDto, @Res() res): Promise<TokenResDto> {
    const [result, baby] = await this.authService.login(
      res,
      dto.email,
      dto.password,
    );
    return res.status(baby ? HttpStatus.OK : 209).json(result);
  }

  @Get('refresh')
  @ApiOperation({
    summary: '토큰 재발급',
    description: 'refreshToken 확인 후 accessToken과 refreshToken 모두 재발급',
  })
  @ApiOkResponse({
    type: TokenResDto,
  })
  @ApiUnauthorizedResponse({
    description: '리프레시 토큰이 없거나 유효하지 않은 경우',
    schema: {
      example: {
        message: '유효하지 않은 토큰입니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<TokenResDto> {
    return await this.authService.reissueToken(req, res);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: '임시 비밀번호 발급 이메일 요청',
    description: '임시 비밀번호 발급 이메일 요청',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        email: 'example@example.com',
      },
    },
  })
  @ApiCreatedResponse()
  @ApiBadRequestResponse({
    description: '존재하지 않는 이메일(유저)',
    schema: {
      example: {
        message: '메일 주소를 다시 확인해주세요.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async sendEmailResetPasswordLink(@Body() dto: { email: string }) {
    const resetLink = await this.authService.createResetPasswordLink(dto.email);
    await this.emailService.sendEmailResetPasswordLink(dto.email, resetLink);
  }

  @Get('reset-password')
  @ApiOperation({
    summary: '임시 비밀번호 발급 및 확인 링크',
    description: '임시 비밀번호 발급 및 확인 링크',
  })
  @ApiQuery({
    name: 'email',
    description: '이메일',
    example: 'example@example.com',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'token',
    description: '검증 토큰',
    example: 'aaaaa-12111-aaaa',
    required: true,
    type: String,
  })
  @ApiOkResponse({
    schema: {
      example: {
        password: 'qwer1234',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '존재하지 않는 이메일(유저)',
    schema: {
      example: {
        message: '메일 주소를 다시 확인해주세요.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiBadRequestResponse({
    description: '링크 유효시간(30분) 이후에 요청 시',
    schema: {
      example: {
        message: '잘못된 접근입니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async getResetPassword(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    const password = await this.authService.getResetPassword(email, token);
    return { password };
  }
}
