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

@Controller('/community/:communityId/comments')
@ApiTags('Community Comment')
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
    summary: '커뮤니티 댓글 목록 조회',
    description: '커뮤니티 댓글 목록 조회',
  })
  @ApiParam({
    name: 'communityId',
    description: '커뮤니티 게시글 id',
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
    @Param('communityId') contentsId: number,
    @Query('page') page = 1,
    @Query('sort') sort = 'createdAt',
    @Query('take') take = 10,
    @Req() req,
  ): Promise<GetCommentListResDto> {
    const [commentList, totalCount] = await this.commentService.getCommentList(
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
    summary: '커뮤니티 댓글 생성',
    description: '커뮤니티 댓 생성',
  })
  @ApiCreatedResponse()
  @ApiParam({
    name: 'communityId',
    description: '커뮤니티 게시글 id',
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
    @Param('communityId') contentsId: number,
    @Body() dto: CreateCommentReqDto,
    @Req() req,
  ) {
    await this.commentService.createComment(contentsId, dto.content, req.user);
  }

  @Put(':commentId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 댓글 수정',
    description: '커뮤니티 댓글 수정',
  })
  @ApiOkResponse()
  @ApiParam({
    name: 'communityId',
    description: '커뮤니티 게시글 id',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'commentId',
    description: '커뮤니티 댓글 id',
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
    @Param('communityId') contentsId: number,
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentReqDto,
  ) {
    await this.commentService.updateComment(contentsId, commentId, dto.content);
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 댓글 삭제',
    description: '커뮤니티 댓글 삭제',
  })
  @ApiOkResponse()
  @ApiParam({
    name: 'communityId',
    description: '커뮤니티 게시글 id',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'commentId',
    description: '커뮤니티 댓글 id',
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
    @Param('communityId') contentsId: number,
    @Param('commentId') commentId: number,
  ) {
    await this.commentService.deleteComment(contentsId, commentId);
    return;
  }

  @Post(':commentId/like')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '커뮤니티 댓글 추천 토글',
    description: '커뮤니티 추천 토글',
  })
  @ApiParam({
    name: 'communityId',
    description: '커뮤니티 게시글 id',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'commentId',
    description: '커뮤니티 댓글 id',
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
    @Param('communityId') contentsId: number,
    @Param('commentId') commentId: number,
    @Req() req,
    @Res() res,
  ) {
    const liked = await this.commentService.toggleCommentLike(
      req.user,
      contentsId,
      commentId,
    );

    if (liked) {
      return res.status(HttpStatus.CREATED).send();
    } else {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
  }
}
