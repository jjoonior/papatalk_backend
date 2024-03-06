import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityReqDto } from './dto/createCommunityReq.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { GetCommunityDetailResDto } from './dto/getCommunityDetailRes.dto';
import { ValidateUserGuard } from '../auth/guard/validateUser.guard';
import { GetCommunityListResDto } from './dto/getCommunityListRes.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  async getCommunityList(
    @Query('page') page = 1,
    @Query('sort') sort = 'createdAt',
    @Query('search') search = '',
    @Query('take') take = 10,
  ): Promise<GetCommunityListResDto> {
    const [communityList, totalCount] =
      await this.communityService.getCommunityList(page, sort, search, take);
    const totalPage = Math.ceil(totalCount / take);

    return {
      communityList: communityList.map((c: any) => {
        c.authorNickname = c.user.nickname;
        c.category = c.category.category;
        delete c.user;

        return c;
      }),
      totalCount,
      totalPage,
      currentPage: page,
    };
  }

  @Get(':id')
  @UseGuards(ValidateUserGuard)
  async getCommunityDetail(
    @Param('id') id: number,
    @Req() req,
  ): Promise<GetCommunityDetailResDto> {
    const community = await this.communityService.getCommunityDetail(id);

    let liked = false;
    if (req.user) {
      liked = await this.communityService.isLiked(req.user, community.id);
    }

    return {
      id: community.id,
      title: community.title,
      content: community.content,
      category: community.category.category,
      views: community.views,
      likes: community.likes,
      liked: liked,
      authorId: community.user.id,
      authorNickname: community.user.nickname,
      createdAt: community.createdAt,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async createCommunity(
    @Body() dto: CreateCommunityReqDto,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    const newCommunity = await this.communityService.createCommunity(
      req.user,
      dto.title,
      dto.content,
      dto.category,
    );

    // return res.status(302).redirect(`community/${newCommunity.id}`);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateCommunity(
    @Param('id') id: number,
    @Body() dto,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    const community = await this.communityService.getCommunity(id);
    await this.communityService.isAuthor(req.user, community);
    await this.communityService.updateCommunity(community, dto);

    // return res.status(302).redirect(`${community.id}`);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteCommunity(
    @Param('id') id: number,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    const community = await this.communityService.getCommunity(id);
    await this.communityService.isAuthor(req.user, community);
    await this.communityService.deleteCommunity(community);

    // return res.status(302).redirect('/community');
  }
}
