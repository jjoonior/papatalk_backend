import { ApiProperty } from '@nestjs/swagger';

export class GetSosDetailResDto {
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
    description: '이미지',
    type: [String],
    example: [
      'https://papatalk.s3.ap-northeast-2.amazonaws.com/63e53824-e823-4f2e-94bd-731c6cb7fd8b',
      'https://papatalk.s3.ap-northeast-2.amazonaws.com/d53da27f-dbf9-4f20-8055-6aee4639fcb2',
      'https://papatalk.s3.ap-northeast-2.amazonaws.com/2a908bfa-8bad-4881-a062-c93432caa079',
    ],
  })
  images: string[];

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
    description: '작성자 프로필 이미지',
    type: String,
    example:
      'https://papatalk.s3.ap-northeast-2.amazonaws.com/63e53824-e823-4f2e-94bd-731c6cb7fd8b',
  })
  authorProfileImage: string;

  @ApiProperty({
    description: '생성 날짜',
    type: Date,
    example: '2024-03-14T10:39:24.712Z',
  })
  createdAt: Date;
}
