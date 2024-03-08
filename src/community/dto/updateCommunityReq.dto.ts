import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommunityReqDto {
  @ApiProperty({
    description: '제목',
    type: String,
    required: true,
    example: '예시_제목',
  })
  title: string;

  @ApiProperty({
    description: '내용',
    type: String,
    required: true,
    example: '예시_내용',
  })
  content: string;

  @ApiProperty({
    description: '카테고리',
    type: String,
    required: true,
    example: '자유게시판',
  })
  category: string;
}
