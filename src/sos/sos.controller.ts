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
import { CreateSosReqDto } from './dto/createSosReq.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { GetSosDetailResDto } from './dto/getSosDetailRes.dto';
import { ValidateUserGuard } from '../auth/guard/validateUser.guard';
import { GetSosListResDto } from './dto/getSosListRes.dto';
import {
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
import { UpdateSosReqDto } from './dto/updateSosReq.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SortEnum } from '../entity/enum/sort.enum';
import { SosService } from './sos.service';

@Controller('sos')
@ApiTags('Contents - SOS')
@ApiInternalServerErrorResponse({
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
@ApiInternalServerErrorResponse({
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Get()
  @ApiOperation({
    summary: 'sos 게시글 목록 조회',
    description: 'sos 게시글 목록 조회',
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
  @ApiOkResponse({ type: GetSosListResDto })
  async getSosList(
    @Query('page') page = 1,
    @Query('sort') sort = SortEnum.CREATED_AT,
    @Query('search') search = '',
    @Query('take') take = 10,
  ): Promise<GetSosListResDto> {
    if (!Object.values(SortEnum).includes(sort)) {
      sort = SortEnum.CREATED_AT;
    }
    const [sosList, totalCount] = await this.sosService.getSosList(
      page,
      sort,
      search,
      take,
    );
    const totalPage = Math.ceil(totalCount / take);

    return {
      sosList: sosList.map((c: any) => {
        c.authorNickname = c.user.nickname;
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
    summary: 'sos 게시글 상세 조회',
    description: 'sos 게시글 상세 조회',
  })
  @ApiParam({
    name: 'id',
    description: 'sos 게시글 id',
    example: 1,
  })
  @ApiOkResponse({ type: GetSosDetailResDto })
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
  async getSosDetail(
    @Param('id') id: number,
    @Req() req,
  ): Promise<GetSosDetailResDto> {
    const sos = await this.sosService.getSosDetail(id);

    let liked = false;
    if (req.user) {
      liked = await this.sosService.isLiked(req.user, sos.id);
    }

    return {
      id: sos.id,
      title: sos.title,
      content: sos.content,
      images: sos['images'],
      views: sos.views,
      likes: sos.likes,
      liked: liked,
      authorId: sos.user.id,
      authorNickname: sos.user.nickname,
      authorProfileImage: sos.user.profileImage?.url || sos.user.nickname,
      createdAt: sos.createdAt,
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'sos 게시글 생성',
    description: 'sos 게시글 생성',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse()
  async createSos(
    @UploadedFiles() images,
    @Body() dto: CreateSosReqDto,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    const newSos = await this.sosService.createSos(
      req.user,
      dto.title,
      dto.content,
    );

    await this.sosService.saveSosImages(newSos, images);

    // return res.status(302).redirect(`sos/${newSos.id}`);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'sos 게시글 수정',
    description: 'sos 게시글 수정',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    description: 'sos 게시글 id',
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
  async updateSos(
    @Param('id') id: number,
    @UploadedFiles() images,
    @Body() dto: UpdateSosReqDto,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    dto.uploadedImages = JSON.parse(dto.uploadedImages ?? '[]');

    const sos = await this.sosService.getSos(id);
    await this.sosService.isAuthor(req.user, sos);
    await this.sosService.updateSos(sos, dto);
    await this.sosService.saveSosImages(sos, images);

    // return res.status(302).redirect(`${sos.id}`);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'sos 게시글 삭제',
    description: 'sos 게시글 삭제',
  })
  @ApiOkResponse()
  @ApiParam({
    name: 'id',
    description: 'sos 게시글 id',
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
  async deleteSos(
    @Param('id') id: number,
    @Req() req,
    // @Res({ passthrough: true }) res,
  ) {
    const sos = await this.sosService.getSos(id);
    await this.sosService.isAuthor(req.user, sos);
    const s3KeyList = await this.sosService.deleteSos(sos);
    await this.sosService.deleteSosImages(s3KeyList);

    // return res.status(302).redirect('/sos');
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'sos 게시글 추천 토글',
    description: 'sos 게시글 추천 토글',
  })
  @ApiParam({
    name: 'id',
    description: 'sos 게시글 id',
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
    const sos = await this.sosService.getSos(id);
    const liked = await this.sosService.toggleSosLike(req.user, sos);

    if (liked) {
      return res.status(HttpStatus.CREATED).send();
    } else {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
  }
}
