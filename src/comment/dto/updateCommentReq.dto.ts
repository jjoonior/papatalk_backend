import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentReqDto {
  @ApiProperty({
    description: '댓글 내용',
    type: String,
    required: true,
    example: '예시_댓글',
  })
  content: string;
}
