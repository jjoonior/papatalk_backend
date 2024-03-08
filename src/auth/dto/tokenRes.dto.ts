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
}
