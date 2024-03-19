import { ApiProperty } from '@nestjs/swagger';

export class GetGrowthRecordListResDto {
  @ApiProperty({
    description: '개월수',
    type: Number,
    example: 1,
  })
  month: number;

  @ApiProperty({
    description: '신장',
    type: Number,
    example: '62.3',
  })
  height: number;

  @ApiProperty({
    description: '체중',
    type: Number,
    example: '3.5',
  })
  weight: number;
}
