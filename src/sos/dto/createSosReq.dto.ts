import { ApiProperty } from '@nestjs/swagger';

export class CreateSosReqDto {
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
    description: '이미지',
    type: String,
    format: 'binary',
    required: false,
    example: '',
  })
  images: string;
}
