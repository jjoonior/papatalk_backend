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

  @ApiProperty({
    description: '업로드된 이미지(삭제 반영)',
    type: [String],
    required: true,
    example: ['image_url_1', 'image_url_2', 'image_url_3'],
  })
  uploadedImages: string;

  @ApiProperty({
    description: '추가로 업로드할 이미지',
    type: Array,
    format: 'binary',
    required: false,
    example: [],
  })
  images: string[];
}
