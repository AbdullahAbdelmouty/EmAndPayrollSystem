import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { trim } from '../../../common/validation/trim.transform';
import { EmployeeStatus } from '../../domain/employee-status.enum';
import { PayItemDto } from './pay-item.dto';

const MAX_PAY_ITEMS = 20;

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Ana Silva', maxLength: 100 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'ana.silva@acme.com' })
  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'Backend Engineer' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  jobTitle!: string;

  @ApiProperty({ example: 'Engineering' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department!: string;

  @ApiProperty({
    example: '2024-03-01',
    description: 'Calendar date, not in the future',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'hireDate must be in YYYY-MM-DD format',
  })
  hireDate!: string;

  @ApiProperty({
    example: 500000,
    description: 'Monthly base salary in minor units (cents), greater than 0',
  })
  @IsInt()
  @IsPositive()
  baseSalaryMinor!: number;

  @ApiPropertyOptional({ enum: EmployeeStatus, default: EmployeeStatus.Active })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ type: [PayItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PAY_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => PayItemDto)
  allowances?: PayItemDto[];

  @ApiPropertyOptional({ type: [PayItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PAY_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => PayItemDto)
  deductions?: PayItemDto[];
}
