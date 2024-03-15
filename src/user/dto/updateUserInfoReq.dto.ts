import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoReqDto {
  @ApiProperty({
    description: '닉네임',
    type: String,
    required: false,
    example: '아무개',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지',
    type: String,
    format: 'binary',
    required: false,
    example: '',
  })
  profileImage: string;
}
