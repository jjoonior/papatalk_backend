import { ApiProperty } from '@nestjs/swagger';

export class GetCommentListResDto {
  @ApiProperty({
    description: '현재 페이지의 게시글 리스트',
    type: Array,
    example: [
      {
        id: 7,
        content: 'dddddd',
        createdAt: '2024-03-13T06:11:43.244Z',
        updatedAt: '2024-03-13T08:23:21.000Z',
        likes: 2,
        liked: true,
        authorId: 1,
        authorNickname: 'a',
      },
      {
        id: 6,
        content: 'ddd',
        createdAt: '2024-03-13T06:11:42.760Z',
        updatedAt: '2024-03-13T06:11:42.760Z',
        likes: 2,
        liked: true,
        authorId: 1,
        authorNickname: 'a',
      },
    ],
  })
  commentList: Comment[];

  @ApiProperty({
    description: '댓글 총 개수',
    type: Number,
    example: 22,
  })
  totalCount: number;

  @ApiProperty({
    description: '댓글 총 페이지 수',
    type: Number,
    example: 3,
  })
  totalPage: number;

  @ApiProperty({
    description: '현재 페이지',
    type: Number,
    example: 3,
  })
  currentPage: number;
}

class Comment {
  id: number;
  content: string;
  likes: number;
  liked: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
  authorNickname: string;
}
