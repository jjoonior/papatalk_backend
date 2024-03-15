import { ApiProperty } from '@nestjs/swagger';

export class TokenResDto {
  @ApiProperty({
    description: 'access token',
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmlja25hbWUiOiJhIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTcwOTcyNzIyNCwiZXhwIjoxNzA5Nzg3MjI0fQ.8ZPUGJgbl3VzC2w1wouITusGFRIkyGWCN-oPVXVKC74',
  })
  accessToken: string;

  @ApiProperty({
    description: 'refresh token',
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmlja25hbWUiOiJhIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3MDk3MjcyMjQsImV4cCI6MTcwOTc4NzIyNH0.ZrwjIZdVgBgu27GVz4kdBlC_tLjGpyuZT5-5ezIWbC4',
  })
  refreshToken: string;

  @ApiProperty({
    description: '유저 id',
    type: Number,
    example: '아무개',
  })
  userId: number;

  @ApiProperty({
    description: '닉네임',
    type: String,
    example: '아무개',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지',
    type: String,
    example:
      'https://papatalk.s3.ap-northeast-2.amazonaws.com/63e53824-e823-4f2e-94bd-731c6cb7fd8b',
  })
  profileImage: string;
}
