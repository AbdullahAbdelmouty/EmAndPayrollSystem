import { Employee } from '../domain/employee';
import { EmployeeStatus } from '../domain/employee-status.enum';
import { toDomain, toOrmEntity } from './employee.mapper';

const today = new Date('2026-10-07T12:00:00Z');

const employee = Employee.create(
  {
    id: '7d0e6c1a-0000-4000-8000-000000000001',
    fullName: 'Ana Silva',
    email: 'ana@acme.com',
    jobTitle: 'Engineer',
    department: 'Engineering',
    hireDate: '2024-03-01',
    baseSalaryMinor: 500_000,
    status: EmployeeStatus.Inactive,
    allowances: [
      { type: 'TRANSPORT', amountMinor: 5_000 },
      { type: 'HOUSING', amountMinor: 20_000 },
    ],
    deductions: [{ type: 'LOAN', amountMinor: 1_000 }],
  },
  today,
);

describe('employee mapper', () => {
  it('survives a domain -> ORM -> domain round trip (pay items sorted by type)', () => {
    const restored = toDomain(toOrmEntity(employee));

    expect(restored.toState()).toEqual({
      ...employee.toState(),
      allowances: [
        { type: 'HOUSING', amountMinor: 20_000 },
        { type: 'TRANSPORT', amountMinor: 5_000 },
      ],
    });
  });

  it('links every pay item to the employee id', () => {
    const entity = toOrmEntity(employee);

    expect(entity.allowances.map((a) => a.employeeId)).toEqual([
      employee.id,
      employee.id,
    ]);
    expect(entity.deductions[0].employeeId).toBe(employee.id);
  });

  it('treats missing relations as empty pay item lists', () => {
    const entity = toOrmEntity(employee);
    entity.allowances = undefined as never;
    entity.deductions = undefined as never;

    expect(toDomain(entity).allowances).toEqual([]);
    expect(toDomain(entity).deductions).toEqual([]);
  });
});
