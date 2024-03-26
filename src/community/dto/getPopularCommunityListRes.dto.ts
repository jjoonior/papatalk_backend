import { ApiProperty } from '@nestjs/swagger';

export class GetPopularCommunityListResDto {
  @ApiProperty({
    description: '커뮤니티 인기글 리스트',
    type: Array,
    example: [
      {
        id: 145,
        title: 'qwe',
        views: 0,
        likes: 0,
        createdAt: '2024-03-23T08:25:28.652Z',
        authorNickname: 'a',
        category: '자유게시판',
        thumbnail: null,
      },
      {
        id: 144,
        title: 'qwe',
        views: 0,
        likes: 0,
        createdAt: '2024-03-23T08:25:08.035Z',
        authorNickname: 'a',
        category: '자유게시판',
        thumbnail: null,
      },
      {
        id: 144,
        title: 'qwe',
        views: 0,
        likes: 0,
        createdAt: '2024-03-23T08:25:08.035Z',
        authorNickname: 'a',
        category: '자유게시판',
        thumbnail: null,
      },
      {
        id: 144,
        title: 'qwe',
        views: 0,
        likes: 0,
        createdAt: '2024-03-23T08:25:08.035Z',
        authorNickname: 'a',
        category: '자유게시판',
        thumbnail: null,
      },
    ],
  })
  communityList: Community[];
}

class Community {
  id: number;
  title: string;
  views: number;
  likes: number;
  createdAt: Date;
  authorNickname: string;
  category: string;
  thumbnail: string;
}
