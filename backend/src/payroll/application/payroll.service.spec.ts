import { Clock } from '../../common/time/clock';
import { Employee, NewEmployee } from '../../employees/domain/employee';
import { EmployeeStatus } from '../../employees/domain/employee-status.enum';
import { EmployeeNotFoundError } from '../../employees/domain/errors/employee-not-found.error';
import { InactiveEmployeeError } from '../../employees/domain/errors/inactive-employee.error';
import { InMemoryEmployeeRepository } from '../../employees/infrastructure/in-memory-employee.repository';
import { DeductionsExceedGrossError } from '../domain/errors/deductions-exceed-gross.error';
import { PayslipMonthBeforeHireError } from '../domain/errors/payslip-month-before-hire.error';
import { PayslipMonthInFutureError } from '../domain/errors/payslip-month-in-future.error';
import { buildPayrollCalculator } from './payroll-calculator.factory';

import { PayrollRules } from './payroll-config.provider';
import { PayrollService } from './payroll.service';

const RULES: PayrollRules = {
  currency: 'USD',
  incomeTax: {
    brackets: [
      { upToMinor: 1_000_000, ratePercent: 0 },
      { upToMinor: 3_000_000, ratePercent: 10 },
      { upToMinor: null, ratePercent: 20 },
    ],
  },
  socialInsurance: { ratePercent: 8, insurableSalaryCapMinor: 4_000_000 },
};

const TODAY = new Date('2026-04-15T10:00:00Z');
const clock: Clock = { now: () => TODAY };
const EMPLOYEE_ID = '11111111-1111-4111-8111-111111111111';

function newEmployee(overrides: Partial<NewEmployee> = {}): Employee {
  return Employee.create(
    {
      id: EMPLOYEE_ID,
      fullName: 'Ana Silva',
      email: 'ana@acme.com',
      jobTitle: 'Engineer',
      department: 'Engineering',
      hireDate: '2025-01-10',
      baseSalaryMinor: 2_000_000,
      allowances: [{ type: 'TRANSPORT', amountMinor: 200_000 }],
      deductions: [{ type: 'LOAN', amountMinor: 50_000 }],
      ...overrides,
    },
    TODAY,
  );
}

describe('PayrollService', () => {
  let repository: InMemoryEmployeeRepository;
  let service: PayrollService;

  beforeEach(() => {
    repository = new InMemoryEmployeeRepository();
    service = new PayrollService(
      repository,
      clock,
      { getRules: () => RULES },
      buildPayrollCalculator(RULES),
    );
  });

  it("builds the payslip from the employee's salary, allowances and deductions", async () => {
    await repository.save(newEmployee());

    const result = await service.getPayslip(EMPLOYEE_ID, '2026-03');

    expect(result.month).toBe('2026-03');
    expect(result.currency).toBe('USD');
    expect(result.employee.id).toBe(EMPLOYEE_ID);
    expect(result.payslip.grossSalary.toMinorNumber()).toBe(2_200_000);
    expect(result.payslip.totalDeductions.toMinorNumber()).toBe(330_000); // 160k + 120k + 50k
    expect(result.payslip.netSalary.toMinorNumber()).toBe(1_870_000);
  });

  it('works for an employee with no allowances or deductions', async () => {
    await repository.save(newEmployee({ allowances: [], deductions: [] }));

    const result = await service.getPayslip(EMPLOYEE_ID, '2026-03');

    expect(result.payslip.grossSalary.toMinorNumber()).toBe(2_000_000);
    expect(result.payslip.otherDeductions).toEqual([]);
  });

  it('throws when the employee does not exist', async () => {
    await expect(
      service.getPayslip(EMPLOYEE_ID, '2026-03'),
    ).rejects.toBeInstanceOf(EmployeeNotFoundError);
  });

  it('rejects an inactive employee', async () => {
    await repository.save(newEmployee({ status: EmployeeStatus.Inactive }));

    await expect(
      service.getPayslip(EMPLOYEE_ID, '2026-03'),
    ).rejects.toBeInstanceOf(InactiveEmployeeError);
  });

  describe('month rules', () => {
    beforeEach(async () => {
      await repository.save(newEmployee({ hireDate: '2026-02-20' }));
    });

    it('rejects a month before the hire month', async () => {
      await expect(
        service.getPayslip(EMPLOYEE_ID, '2026-01'),
      ).rejects.toBeInstanceOf(PayslipMonthBeforeHireError);
    });

    it('accepts the hire month itself', async () => {
      await expect(
        service.getPayslip(EMPLOYEE_ID, '2026-02'),
      ).resolves.toBeDefined();
    });

    it('accepts the current month', async () => {
      await expect(
        service.getPayslip(EMPLOYEE_ID, '2026-04'),
      ).resolves.toBeDefined();
    });

    it('rejects a future month', async () => {
      await expect(
        service.getPayslip(EMPLOYEE_ID, '2026-05'),
      ).rejects.toBeInstanceOf(PayslipMonthInFutureError);
    });
  });

  it('surfaces deductions that exceed gross salary', async () => {
    await repository.save(
      newEmployee({
        baseSalaryMinor: 100_000,
        allowances: [],
        deductions: [{ type: 'ADVANCE', amountMinor: 200_000 }],
      }),
    );

    await expect(
      service.getPayslip(EMPLOYEE_ID, '2026-03'),
    ).rejects.toBeInstanceOf(DeductionsExceedGrossError);
  });
});
