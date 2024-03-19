import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserProfileService } from './userProfile.service';
import { AuthGuard } from '../../auth/guard/auth.guard';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserProfileReqDto } from './dto/updateUserProfileReq.dto';
import { GetUserProfileResDto } from './dto/getUserProfileRes.dto';

@Controller('users/profile')
@UseGuards(AuthGuard)
@ApiTags('User - Profile')
@ApiInternalServerErrorResponse({
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
@ApiUnauthorizedResponse({
  description: '토큰이 없거나 유효하지 않은 경우',
  schema: {
    example: {
      message: '유효하지 않은 토큰입니다.',
      error: 'Unauthorized',
      statusCode: 401,
    },
  },
})
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({
    summary: '유저 프로필 조회',
    description: '유저 프로필 조회',
  })
  @ApiOkResponse({ type: GetUserProfileResDto })
  async getUserProfile(@Req() req) {
    const { user } = req;
    return {
      // id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage?.url || user.nickname,
    };
  }

  @Get('duplication-check')
  @ApiOperation({
    summary: '닉네임 변경 중복 체크',
    description: '닉네임의 중복 유무를 확인한다.',
  })
  @ApiOkResponse()
  @ApiQuery({
    name: 'nickname',
    description: '닉네임',
    example: '아무개',
    required: false,
    type: String,
  })
  @ApiBadRequestResponse({
    description: '빈 입력',
    schema: {
      example: {
        message: '닉네임을 입력해주세요.',
        error: 'BadRequest',
        statusCode: 400,
      },
    },
  })
  @ApiConflictResponse({
    description: '입력한 닉네임이 이미 존재하는 경우',
    schema: {
      example: {
        message: '이미 존재하는 닉네임입니다.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async duplicationCheckNickname(
    @Query('nickname') nickname: string,
    @Req() req,
  ) {
    if (!nickname) {
      throw new BadRequestException('닉네임을 입력해주세요.');
    }
    await this.userProfileService.duplicationCheckNickname(req.user, nickname);
  }

  @Put()
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiOperation({
    summary: '유저 프로필 수정',
    description: '유저 프로필 이미지 / 닉네임 수정',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse()
  @ApiBadRequestResponse({
    description: '입력값이 없을 경우',
    schema: {
      example: {
        message: '변경할 데이터를 입력해 주세요.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiConflictResponse({
    description: '입력한 닉네임이 이미 존재하는 경우',
    schema: {
      example: {
        message: '이미 존재하는 닉네임입니다.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async updateUserProfile(
    @UploadedFile() profileImage,
    @Body() dto: UpdateUserProfileReqDto,
    @Req() req,
  ) {
    if (!profileImage && !dto.nickname) {
      throw new BadRequestException('변경할 데이터를 입력해 주세요.');
    }
    await this.userProfileService.updateUserProfile(
      req.user,
      profileImage,
      dto.nickname,
    );
  }
}
