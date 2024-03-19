import { ApiProperty } from '@nestjs/swagger';
import { SexEnum } from '../../../entity/enum/sex.enum';

export class GetBabyInfoResDto {
  @ApiProperty({
    description: '성별',
    enum: SexEnum,
    example: SexEnum.MALE,
  })
  sex: string;

  @ApiProperty({
    description: '생년월일',
    type: Date,
    example: '2024-01-01',
  })
  birth: Date;

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
