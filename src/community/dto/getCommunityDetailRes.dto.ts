import { ApiProperty } from '@nestjs/swagger';

export class GetCommunityDetailResDto {
  @ApiProperty({
    description: '게시글 id',
    type: Number,
    example: 24,
  })
  id: number;

  @ApiProperty({
    description: '제목',
    type: String,
    example: '예시_제목',
  })
  title: string;

  @ApiProperty({
    description: '내용',
    type: String,
    example: '예시_내용',
  })
  content: string;

  @ApiProperty({
    description: '카테고리',
    type: String,
    example: '자유게시판',
  })
  category: string;

  @ApiProperty({
    description: '조회수',
    type: Number,
    example: 44,
  })
  views: number;

  @ApiProperty({
    description: '좋아요 수',
    type: Number,
    example: 23,
  })
  likes: number;

  @ApiProperty({
    description: '좋아요 T/F',
    type: Boolean,
    example: true,
  })
  liked: boolean;

  @ApiProperty({
    description: '작성자 id (db)',
    type: Number,
    example: 423,
  })
  authorId: number;

  @ApiProperty({
    description: '작성자 닉네임',
    type: String,
    example: '아무개',
  })
  authorNickname: string;

  @ApiProperty({
    description: '생성 날짜',
    type: Date,
    // example: ,
  })
  createdAt: Date;
}
