import { ApiProperty } from '@nestjs/swagger';

export class GetUserActivityListResDto {
  @ApiProperty({
    description: '현재 페이지의 게시글 리스트',
    type: Array,
    example: [
      {
        contentsType: 'community',
        contentsId: 1,
        title: 'test',
        authorNickname: 'a',
        created_at: '2024-03-06T02:24:34.920Z',
        views: 0,
        likes: 0,
      },
      {
        contentsType: 'community',
        contentsId: 9,
        title: 'testa',
        authorNickname: 'a',
        created_at: '2024-03-06T04:36:51.728Z',
        views: 0,
        likes: 0,
      },
    ],
  })
  contentsList: Contents[];

  @ApiProperty({
    description: '게시글 총 개수',
    type: Number,
    example: 22,
  })
  totalCount: number;

  @ApiProperty({
    description: '게시글 총 페이지 수',
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

class Contents {
  contentsType: string;
  contentsId: number;
  title: string;
  views: number;
  likes: number;
  createdAt: Date;
  authorNickname: string;
}
