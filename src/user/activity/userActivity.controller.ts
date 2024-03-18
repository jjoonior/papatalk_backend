import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UserActivityService } from './userActivity.service';
import { GetUserActivityListResDto } from './dto/getUserActivityListRes.dto';

@Controller('users/activity')
@UseGuards(AuthGuard)
@ApiTags('User - Activity')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Get('contents')
  async getContentsList(
    @Query('contentsType') contentsType = 'all',
    @Query('page') page = 1,
    @Query('take') take = 10,
    @Req() req,
  ): Promise<GetUserActivityListResDto> {
    const contentsList = await this.userActivityService.getContentsList(
      req.user,
      contentsType,
      page,
      take,
    );
    const totalCount = contentsList[0]?.totalCount || 0;
    const totalPage = Math.ceil(totalCount / take);

    return {
      contentsList: contentsList.map((c) => {
        delete c.totalCount;
        return c;
      }),
      totalCount,
      totalPage,
      currentPage: page,
    };
  }

  @Get('comments')
  async getCommentList(
    @Query('contentsType') contentsType = 'all',
    @Query('page') page = 1,
    @Query('take') take = 10,
    @Req() req,
  ): Promise<GetUserActivityListResDto> {
    const contentsList = await this.userActivityService.getCommentList(
      req.user,
      contentsType,
      page,
      take,
    );
    const totalCount = contentsList[0]?.totalCount || 0;
    const totalPage = Math.ceil(totalCount / take);

    return {
      contentsList: contentsList.map((c) => {
        delete c.totalCount;
        return c;
      }),
      totalCount,
      totalPage,
      currentPage: page,
    };
  }
}
