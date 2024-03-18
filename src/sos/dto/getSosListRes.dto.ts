import { ApiProperty } from '@nestjs/swagger';

export class GetSosListResDto {
  @ApiProperty({
    description: '현재 페이지의 게시글 리스트',
    type: Array,
    example: [
      {
        id: 48,
        title: 'testa',
        views: 0,
        likes: 0,
        createdAt: '2024-03-06T11:50:15.812Z',
        // category: 'test',
        authorNickname: 'a',
      },
      {
        id: 47,
        title: 'testa',
        views: 1,
        likes: 0,
        createdAt: '2024-03-06T11:27:25.951Z',
        // category: 'test',
        authorNickname: 'a',
      },
    ],
  })
  sosList: Sos[];

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

class Sos {
  id: number;
  title: string;
  views: number;
  likes: number;
  createdAt: Date;
  authorNickname: string;
}
