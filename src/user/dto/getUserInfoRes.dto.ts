import { ApiProperty } from '@nestjs/swagger';

export class GetUserInfoResDto {
  // @ApiProperty({
  //   description: '유저 id',
  //   type: String,
  //   example: '123124',
  // })
  // id: string;

  @ApiProperty({
    description: '이메일',
    type: String,
    example: 'example@example.com',
  })
  email: string;

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
