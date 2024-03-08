import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '이메일',
    type: String,
    required: true,
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    type: String,
    required: true,
    example: 'qwer1234',
  })
  password: string;
}
