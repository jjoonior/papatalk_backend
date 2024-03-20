import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordReqDto {
  @ApiProperty({
    description: '현재 비밀번호',
    type: String,
    required: true,
    example: 'qwer1234',
  })
  originPassword: string;

  @ApiProperty({
    description: '새 비밀번호',
    type: String,
    required: true,
    example: 'qwer1234',
  })
  newPassword: string;
}
