import { Employee } from '../domain/employee';
import { PayItem } from '../domain/employee-details';
import { EmployeeStatus } from '../domain/employee-status.enum';
import { EmployeeAllowanceOrmEntity } from './employee-allowances.orm-entity';
import { EmployeeDeductionOrmEntity } from './employee-deductions.orm-entity';

import { EmployeeOrmEntity } from './employee.orm-entity';

type PayItemEntity = EmployeeAllowanceOrmEntity | EmployeeDeductionOrmEntity;

export function toDomain(entity: EmployeeOrmEntity): Employee {
  return Employee.rehydrate({
    id: entity.id,
    fullName: entity.fullName,
    email: entity.email,
    jobTitle: entity.jobTitle,
    department: entity.department,
    hireDate: entity.hireDate,
    baseSalaryMinor: entity.baseSalaryMinor,
    status: entity.status as EmployeeStatus,
    allowances: toPayItems(entity.allowances),
    deductions: toPayItems(entity.deductions),
  });
}

export function toOrmEntity(employee: Employee): EmployeeOrmEntity {
  const entity = new EmployeeOrmEntity();
  entity.id = employee.id;
  entity.fullName = employee.fullName;
  entity.email = employee.email;
  entity.jobTitle = employee.jobTitle;
  entity.department = employee.department;
  entity.hireDate = employee.hireDate;
  entity.baseSalaryMinor = employee.baseSalaryMinor;
  entity.status = employee.status as EmployeeOrmEntity['status'];
  entity.allowances = employee.allowances.map((item) =>
    toPayItemEntity(new EmployeeAllowanceOrmEntity(), employee.id, item),
  );
  entity.deductions = employee.deductions.map((item) =>
    toPayItemEntity(new EmployeeDeductionOrmEntity(), employee.id, item),
  );
  return entity;
}

function toPayItems(entities: PayItemEntity[] | undefined): PayItem[] {
  return (entities ?? [])
    .map(({ type, amountMinor }) => ({ type, amountMinor }))
    .sort((a, b) => a.type.localeCompare(b.type));
}

function toPayItemEntity<T extends PayItemEntity>(
  entity: T,
  employeeId: string,
  item: PayItem,
): T {
  entity.employeeId = employeeId;
  entity.type = item.type;
  entity.amountMinor = item.amountMinor;
  return entity;
}
