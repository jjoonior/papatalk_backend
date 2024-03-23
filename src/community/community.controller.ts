import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityReqDto } from './dto/createCommunityReq.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { GetCommunityDetailResDto } from './dto/getCommunityDetailRes.dto';
import { ValidateUserGuard } from '../auth/guard/validateUser.guard';
import { GetCommunityListResDto } from './dto/getCommunityListRes.dto';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateCommunityReqDto } from './dto/updateCommunityReq.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SortEnum } from '../entity/enum/sort.enum';

@Controller('community')
@ApiTags('Contents - Community')
@ApiInternalServerErrorResponse({
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('category')
  @ApiOperation({
    summary: '커뮤니티 카테고리 목록 조회',
    description: '커뮤니티 카테고리 목록 조회',
  })
  @ApiOkResponse({
    schema: {
      example: ['자유게시판', '육아'],
    },
  })
  async getCategoryList() {
    const categoryList = await this.communityService.getCategoryList();
    return categoryList.map((category) => category.category);
  }

  @Get()
  @ApiOperation({
    summary: '커뮤니티 게시글 목록 조회',
    description: '커뮤니티 게시글 목록 조회',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    description: '정렬 (최신순/추천순)',
    example: 'createdAt',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'search',
    description: '검색어',
    example: '예시_검색어',
    required: false,
    type: String,
  })
  @ApiOkResponse({ type: GetCommunityListResDto })
  async getCommunityList(
    @Query('page') page = 1,
    @Query('sort') sort = SortEnum.CREATED_AT,
    @Query('search') search = '',
    @Query('take') take = 10,
  ): Promise<GetCommunityListResDto> {
    if (!Object.values(SortEnum).includes(sort)) {
      sort = SortEnum.CREATED_AT;
    }
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
  @ApiOperation({
    summary: '커뮤니티 게시글 상세 조회',
    description: '커뮤니티 게시글 상세 조회',
  })
  @ApiParam({
    name: 'id',
    description: '커뮤니티 게시글 id',
    example: 1,
  })
  @ApiOkResponse({ type: GetCommunityDetailResDto })
  @ApiNotFoundResponse({
    description: '',
    schema: {
      example: {
        message: '존재하지 않는 글입니다.',
        error: 'NotFound',
        statusCode: 404,
      },
    },
  })
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
      images: community['images'],
      views: community.views,
      likes: community.likes,
      liked: liked,
      authorId: community.user.id,
      authorNickname: community.user.nickname,
      authorProfileImage:
        community.user.profileImage?.url || community.user.nickname,
      createdAt: community.createdAt,
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 게시글 생성',
    description: '커뮤니티 게시글 생성',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse()
  @ApiBadRequestResponse({
    description: '',
    schema: {
      example: {
        message: '존재하지 않는 카테고리입니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async createCommunity(
    @UploadedFiles() images,
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

    await this.communityService.saveCommunityImages(newCommunity, images);

    // return res.status(302).redirect(`community/${newCommunity.id}`);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 게시글 수정',
    description: '커뮤니티 게시글 수정',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    description: '커뮤니티 게시글 id',
    example: 1,
  })
  @ApiBadRequestResponse({
    description: '',
    schema: {
      example: {
        message: '존재하지 않는 카테고리입니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '',
    schema: {
      example: {
        message: '권한이 없습니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiNotFoundResponse({
    description: '',
    schema: {
      example: {
        message: '존재하지 않는 글입니다.',
        error: 'NotFound',
        statusCode: 404,
      },
    },
  })
  async updateCommunity(
    @Param('id') id: number,
    @UploadedFiles() images,
    @Body() dto: UpdateCommunityReqDto,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    dto.uploadedImages = JSON.parse(dto.uploadedImages ?? '[]');

    const community = await this.communityService.getCommunity(id);
    await this.communityService.isAuthor(req.user, community);
    await this.communityService.updateCommunity(community, dto);
    await this.communityService.saveCommunityImages(community, images);

    // return res.status(302).redirect(`${community.id}`);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 게시글 삭제',
    description: '커뮤니티 게시글 삭제',
  })
  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    description: '커뮤니티 게시글 id',
    example: 1,
  })
  @ApiUnauthorizedResponse({
    description: '',
    schema: {
      example: {
        message: '권한이 없습니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiNotFoundResponse({
    description: '',
    schema: {
      example: {
        message: '존재하지 않는 글입니다.',
        error: 'NotFound',
        statusCode: 404,
      },
    },
  })
  async deleteCommunity(
    @Param('id') id: number,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    const community = await this.communityService.getCommunity(id);
    await this.communityService.isAuthor(req.user, community);
    const s3KeyList = await this.communityService.deleteCommunity(community);
    await this.communityService.deleteCommunityImages(s3KeyList);

    // return res.status(302).redirect('/community');
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 게시글 추천 토글',
    description: '커뮤니티 게시글 추천 토글',
  })
  @ApiParam({
    name: 'id',
    description: '커뮤니티 게시글 id',
    example: 1,
    type: Number,
  })
  @ApiCreatedResponse({ description: '추천 true' })
  @ApiNoContentResponse({ description: '추천 false' })
  @ApiUnauthorizedResponse({
    description: '',
    schema: {
      example: {
        message: '권한이 없습니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiNotFoundResponse({
    description: '',
    schema: {
      example: {
        message: '존재하지 않는 글입니다.',
        error: 'NotFound',
        statusCode: 404,
      },
    },
  })
  async toggleCommentLike(@Param('id') id: number, @Req() req, @Res() res) {
    const community = await this.communityService.getCommunity(id);
    const liked = await this.communityService.toggleCommunityLike(
      req.user,
      community,
    );

    if (liked) {
      return res.status(HttpStatus.CREATED).send();
    } else {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
  }
}
