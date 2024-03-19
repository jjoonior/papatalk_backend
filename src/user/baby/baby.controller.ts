import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guard/auth.guard';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BabyService } from './baby.service';
import { GetBabyInfoResDto } from './dto/getBabyInfoRes.dto';
import { GetGrowthRecordListResDto } from './dto/getGrowthRecordListRes.dto';
import { SaveGrowthRecordReqDto } from './dto/saveGrowthRecordReq.dto';

@Controller('users/baby')
@UseGuards(AuthGuard)
@ApiTags('User - Baby')
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
export class BabyController {
  constructor(private readonly babyService: BabyService) {}

  @Get('info')
  @ApiOperation({
    summary: '아기 정보 조회',
    description: '아기 정보 조회',
  })
  @ApiOkResponse({ type: GetBabyInfoResDto })
  @ApiNotFoundResponse({
    description: '',
    schema: {
      example: {
        message: '저장된 아기 정보가 없습니다.',
        error: 'NotFound',
        statusCode: 404,
      },
    },
  })
  async getBabyInfo(@Req() req): Promise<GetBabyInfoResDto> {
    const baby = await this.babyService.getBabyInfo(req.user);
    if (!baby) {
      throw new NotFoundException('저장된 아기 정보가 없습니다.');
    }

    return {
      sex: baby?.sex,
      birth: baby?.birth,
      height: baby?.height,
      weight: baby.weight,
    };
  }

  @Post('info')
  @ApiOperation({
    summary: '아기 정보(성장 기록) 저장',
    description: '아기 정보(성장 기록) 저장',
  })
  @ApiCreatedResponse()
  async saveGrowthRecord(@Req() req, @Body() dto: SaveGrowthRecordReqDto) {
    await this.babyService.saveGrowthRecord(
      req.user,
      dto.sex,
      dto.birth,
      dto.height,
      dto.weight,
    );
  }

  @Get('record')
  @ApiOperation({
    summary: '아기 성장 기록 조회',
    description: '아기 성장 기록 조회',
  })
  @ApiOkResponse({ type: [GetGrowthRecordListResDto] })
  @ApiNotFoundResponse({
    description: '',
    schema: {
      example: {
        message: '저장된 아기 정보가 없습니다.',
        error: 'NotFound',
        statusCode: 404,
      },
    },
  })
  async getRecordList(@Req() req): Promise<GetGrowthRecordListResDto[]> {
    const baby = await this.babyService.getBabyInfo(req.user);
    if (!baby) {
      throw new NotFoundException('저장된 아기 정보가 없습니다.');
    }

    return await this.babyService.getRecordList(baby);
  }
}
