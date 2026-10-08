import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQuery } from '../../../common/pagination/pagination.query';
import { EmployeeStatus } from '../../domain/employee-status.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ListEmployeesQuery extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Matches full name or email (case-insensitive, partial)',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Exact department name' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
