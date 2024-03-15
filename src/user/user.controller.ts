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
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserInfoReqDto } from './dto/updateUserInfoReq.dto';
import { GetUserInfoResDto } from './dto/getUserInfoRes.dto';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: '유저 프로필 조회',
    description: '유저 프로필 조회',
  })
  @ApiOkResponse({ type: GetUserInfoResDto })
  async getUserInfo(@Req() req) {
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
    await this.userService.duplicationCheckNickname(req.user, nickname);
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
  async updateUserInfo(
    @UploadedFile() profileImage,
    @Body() dto: UpdateUserInfoReqDto,
    @Req() req,
  ) {
    if (!profileImage && !dto.nickname) {
      throw new BadRequestException('변경할 데이터를 입력해 주세요.');
    }
    await this.userService.updateUserInfo(req.user, profileImage, dto.nickname);
  }
}
