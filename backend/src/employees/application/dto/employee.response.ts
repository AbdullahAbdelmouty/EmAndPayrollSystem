import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from '../../../common/pagination/paginated-result';
import { Employee } from '../../domain/employee';
import { EmployeeStatus } from '../../domain/employee-status.enum';

export class PayItemResponse {
  @ApiProperty() type!: string;
  @ApiProperty({ example: '2026-10' }) month!: string;
  @ApiProperty({ description: 'Minor units (cents)' }) amountMinor!: number;
}

export class EmployeeResponse {
  @ApiProperty() id!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty() email!: string;
  @ApiProperty() jobTitle!: string;
  @ApiProperty() department!: string;
  @ApiProperty({ example: '2024-03-01' }) hireDate!: string;
  @ApiProperty({ description: 'Minor units (cents)' }) baseSalaryMinor!: number;
  @ApiProperty({ enum: EmployeeStatus }) status!: EmployeeStatus;
  @ApiProperty({ type: [PayItemResponse] }) allowances!: PayItemResponse[];
  @ApiProperty({ type: [PayItemResponse] }) deductions!: PayItemResponse[];

  static from(employee: Employee): EmployeeResponse {
    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      jobTitle: employee.jobTitle,
      department: employee.department,
      hireDate: employee.hireDate,
      baseSalaryMinor: employee.baseSalaryMinor,
      status: employee.status,
      allowances: employee.allowances,
      deductions: employee.deductions,
    };
  }
}

export class EmployeePageResponse {
  @ApiProperty({ type: [EmployeeResponse] }) items!: EmployeeResponse[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() totalPages!: number;

  static from(result: PaginatedResult<Employee>): EmployeePageResponse {
    return {
      items: result.items.map(EmployeeResponse.from),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
    };
  }
}
