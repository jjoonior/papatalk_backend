import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guard/auth.guard';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserActivityService } from './userActivity.service';
import { GetUserActivityListResDto } from './dto/getUserActivityListRes.dto';

@Controller('users/activity')
@UseGuards(AuthGuard)
@ApiTags('User - Activity')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Get('contents')
  @ApiOperation({
    summary: '유저가 작성한 게시글 목록 조회',
    description: '유저가 작성한 게시글 목록 조회',
  })
  @ApiQuery({
    name: 'contentsType',
    description: 'community / sos ',
    example: 'all / community / sos',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: '페이지',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiOkResponse({ type: GetUserActivityListResDto })
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
  @ApiOperation({
    summary: '유저가 작성한 댓글의 게시글 목록 조회',
    description: '유저가 작성한 댓글의 게시글 목록 조회',
  })
  @ApiQuery({
    name: 'contentsType',
    description: 'community / sos ',
    example: 'all / community / sos',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: '페이지',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiOkResponse({ type: GetUserActivityListResDto })
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
