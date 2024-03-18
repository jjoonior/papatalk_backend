import { ApiProperty } from '@nestjs/swagger';

export class UpdateSosReqDto {
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
}
