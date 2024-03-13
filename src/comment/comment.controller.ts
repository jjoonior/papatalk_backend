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
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateCommentReqDto } from './dto/createCommentReq.dto';
import { ValidateUserGuard } from '../auth/guard/validateUser.guard';
import { UpdateCommentReqDto } from './dto/updateCommentReq.dto';

@Controller('/community/:communityId/comments')
@ApiTags('Community Comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @UseGuards(ValidateUserGuard)
  async getCommentList(
    @Param('communityId') contentsId: number,
    @Query('page') page = 1,
    @Query('sort') sort = 'createdAt',
    @Query('take') take = 10,
  ) {
    const [commentList, totalCount] = await this.commentService.getCommentList(
      contentsId,
      page,
      sort,
      take,
    );
    const totalPage = Math.ceil(totalCount / take);

    return {
      commentList: commentList.map((c: any) => {
        c.authorId = c.user.id;
        c.authorNickname = c.user.nickname;
        delete c.user;

        return c;
      }),
      totalCount,
      totalPage,
      currentPage: page,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async createComment(
    @Param('communityId') contentsId: number,
    @Body() dto: CreateCommentReqDto,
    @Req() req,
  ) {
    await this.commentService.createComment(contentsId, dto.content, req.user);
  }

  @Put(':commentId')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('communityId') contentsId: number,
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentReqDto,
  ) {
    await this.commentService.updateComment(contentsId, commentId, dto.content);
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  async deleteComment(
    @Param('communityId') contentsId: number,
    @Param('commentId') commentId: number,
  ) {
    await this.commentService.deleteComment(contentsId, commentId);
  }
}