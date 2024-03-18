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
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import {
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
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateCommentReqDto } from './dto/createCommentReq.dto';
import { ValidateUserGuard } from '../auth/guard/validateUser.guard';
import { UpdateCommentReqDto } from './dto/updateCommentReq.dto';
import { GetCommentListResDto } from './dto/getCommentListRes.dto';
import { SortEnum } from '../entity/enum/sort.enum';
import { ContentsTypeEnum } from '../entity/enum/contentsType.enum';

@Controller('/:contentsType/:contentsId/comments')
@ApiTags('Comment')
@ApiInternalServerErrorResponse({
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
    },
  },
})
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @UseGuards(ValidateUserGuard)
  @ApiOperation({
    summary: '게시글 댓글 목록 조회',
    description: '게시글 댓글 목록 조회',
  })
  @ApiParam({
    name: 'contentsType',
    description: '게시글 종류',
    example: ContentsTypeEnum.COMMUNITY,
    enum: ContentsTypeEnum,
  })
  @ApiParam({
    name: 'contentsId',
    description: '게시글 id',
    example: 1,
    type: Number,
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
  @ApiOkResponse({ type: GetCommentListResDto })
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
  async getCommentList(
    @Param('contentsType') contentsType: ContentsTypeEnum,
    @Param('contentsId') contentsId: number,
    @Query('page') page = 1,
    @Query('sort') sort = SortEnum.CREATED_AT,
    @Query('take') take = 10,
    @Req() req,
  ): Promise<GetCommentListResDto> {
    if (!Object.values(SortEnum).includes(sort)) {
      sort = SortEnum.CREATED_AT;
    }
    const [commentList, totalCount] = await this.commentService.getCommentList(
      contentsType,
      contentsId,
      page,
      sort,
      take,
    );

    const commentIdList = commentList.map((c) => c.id);

    let likedCommentIdList;
    if (req.user) {
      likedCommentIdList = await this.commentService.isLiked(
        req.user,
        commentIdList,
      );
    }

    const totalPage = Math.ceil(totalCount / take);

    return {
      commentList: commentList.map((c: any) => {
        c.liked = false;
        c.authorId = c.user.id;
        c.authorNickname = c.user.nickname;
        delete c.user;
        delete c.contentsType;
        delete c.contentsId;

        if (req.user) {
          if (likedCommentIdList.includes(c.id)) {
            c.liked = true;
          }
        }

        return c;
      }),
      totalCount,
      totalPage,
      currentPage: page,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '댓글 생성',
    description: '댓글 생성',
  })
  @ApiCreatedResponse()
  @ApiParam({
    name: 'contentsType',
    description: '게시글 종류',
    example: ContentsTypeEnum.COMMUNITY,
    enum: ContentsTypeEnum,
  })
  @ApiParam({
    name: 'contentsId',
    description: '게시글 id',
    example: 1,
    type: Number,
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
  async createComment(
    @Param('contentsType') contentsType: ContentsTypeEnum,
    @Param('contentsId') contentsId: number,
    @Body() dto: CreateCommentReqDto,
    @Req() req,
  ) {
    await this.commentService.createComment(
      contentsType,
      contentsId,
      dto.content,
      req.user,
    );
  }

  @Put(':commentId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '댓글 수정',
    description: '댓글 수정',
  })
  @ApiOkResponse()
  @ApiParam({
    name: 'contentsType',
    description: '게시글 종류',
    example: ContentsTypeEnum.COMMUNITY,
    enum: ContentsTypeEnum,
  })
  @ApiParam({
    name: 'contentsId',
    description: '게시글 id',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글 id',
    example: 1,
    type: Number,
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
  async updateComment(
    @Param('contentsType') contentsType: ContentsTypeEnum,
    @Param('contentsId') contentsId: number,
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentReqDto,
  ) {
    await this.commentService.updateComment(
      contentsType,
      contentsId,
      commentId,
      dto.content,
    );
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글 삭제',
  })
  @ApiOkResponse()
  @ApiParam({
    name: 'contentsType',
    description: '게시글 종류',
    example: ContentsTypeEnum.COMMUNITY,
    enum: ContentsTypeEnum,
  })
  @ApiParam({
    name: 'contentsId',
    description: '게시글 id',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글 id',
    example: 1,
    type: Number,
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
  async deleteComment(
    @Param('contentsType') contentsType: ContentsTypeEnum,
    @Param('contentsId') contentsId: number,
    @Param('commentId') commentId: number,
  ) {
    await this.commentService.deleteComment(
      contentsType,
      contentsId,
      commentId,
    );
    return;
  }

  @Post(':commentId/like')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '댓글 추천 토글',
    description: '댓글 추천 토글',
  })
  @ApiParam({
    name: 'contentsType',
    description: '게시글 종류',
    example: ContentsTypeEnum.COMMUNITY,
    enum: ContentsTypeEnum,
  })
  @ApiParam({
    name: 'contentsId',
    description: '게시글 id',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글 id',
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
  async toggleCommentLike(
    @Param('contentsType') contentsType: ContentsTypeEnum,
    @Param('contentsId') contentsId: number,
    @Param('commentId') commentId: number,
    @Req() req,
    @Res() res,
  ) {
    const liked = await this.commentService.toggleCommentLike(
      req.user,
      commentId,
    );

    if (liked) {
      return res.status(HttpStatus.CREATED).send();
    } else {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
  }
}
