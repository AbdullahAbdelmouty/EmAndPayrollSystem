import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { trim } from '../../../common/validation/trim.transform';

export class PayItemDto {
  @ApiProperty({ example: 'TRANSPORT', maxLength: 50 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;

  @ApiProperty({
    example: '2026-10',
    description: 'Payroll month in YYYY-MM format',
  })
  @Transform(trim)
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in YYYY-MM format',
  })
  month!: string;

  @ApiProperty({
    example: 25000,
    minimum: 0,
    description: 'Monthly amount in minor units (cents)',
  })
  @IsInt()
  @Min(0)
  amountMinor!: number;
}
