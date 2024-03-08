import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
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

  @ApiProperty({
    description: '닉네임',
    type: String,
    required: true,
    example: '예시_닉네임',
  })
  nickname: string;

  @ApiProperty({
    description: '이용약관동의 T/F',
    type: Boolean,
    required: true,
    example: true,
  })
  termsAgreed: boolean;

  @ApiProperty({
    description: '개인정보취급동의 T/F',
    type: Boolean,
    required: true,
    example: true,
  })
  privacyPolicyAgreed: boolean;
}
