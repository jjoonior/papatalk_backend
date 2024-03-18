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
import { ApiTags } from '@nestjs/swagger';
import { BabyService } from './baby.service';

@Controller('users/baby')
@UseGuards(AuthGuard)
@ApiTags('User - Baby')
export class BabyController {
  constructor(private readonly babyService: BabyService) {}

  @Get('info')
  async getBabyInfo(@Req() req) {
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
  async saveGrowthRecord(@Req() req, @Body() dto) {
    await this.babyService.saveGrowthRecord(
      req.user,
      dto.sex,
      dto.birth,
      dto.height,
      dto.weight,
    );
  }

  @Get('record')
  async getRecordList(@Req() req) {
    const baby = await this.babyService.getBabyInfo(req.user);
    if (!baby) {
      throw new NotFoundException('저장된 아기 정보가 없습니다.');
    }

    return await this.babyService.getRecordList(baby);
  }
}
