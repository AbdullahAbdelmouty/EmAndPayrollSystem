import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeOrmEntity } from './infrastructure/employee.orm-entity';
import { EmployeeAllowanceOrmEntity } from './infrastructure/employee-allowances.orm-entity';
import { EmployeeDeductionOrmEntity } from './infrastructure/employee-deductions.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeOrmEntity,
      EmployeeAllowanceOrmEntity,
      EmployeeDeductionOrmEntity,
    ]),
  ],
})
export class EmployeesModule {}
