import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeModule } from '../common/time/time.module';
import { EmployeesService } from './application/employees.service';
import { EMPLOYEE_REPOSITORY } from './domain/employee.repository';
import { EmployeeDeductionOrmEntity } from './infrastructure/employee-deductions.orm-entity';
import { EmployeeAllowanceOrmEntity } from './infrastructure/employee-allowances.orm-entity';
import { EmployeeOrmEntity } from './infrastructure/employee.orm-entity';
import { TypeOrmEmployeeRepository } from './infrastructure/typeorm-employee.repository';
import { EmployeesController } from './presentation/employees.controller';

@Module({
  imports: [
    TimeModule,
    TypeOrmModule.forFeature([
      EmployeeOrmEntity,
      EmployeeAllowanceOrmEntity,
      EmployeeDeductionOrmEntity,
    ]),
  ],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    { provide: EMPLOYEE_REPOSITORY, useClass: TypeOrmEmployeeRepository },
  ],
  exports: [EMPLOYEE_REPOSITORY],
})
export class EmployeesModule {}
