import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, Clock } from '../../common/time/clock';
import { Employee } from '../../employees/domain/employee';
import { PayItem } from '../../employees/domain/employee-details';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../../employees/domain/employee.repository';
import { EmployeeNotFoundError } from '../../employees/domain/errors/employee-not-found.error';
import { InactiveEmployeeError } from '../../employees/domain/errors/inactive-employee.error';
import { PayslipMonthBeforeHireError } from '../domain/errors/payslip-month-before-hire.error';
import { PayslipMonthInFutureError } from '../domain/errors/payslip-month-in-future.error';
import { Money } from '../domain/money';
import { PayrollCalculator } from '../domain/payroll-calculator';
import { Payslip, PayslipLine } from '../domain/payslip';
import {
  PAYROLL_CONFIG_PROVIDER,
  PayrollConfigProvider,
} from './payroll-config.provider';

export interface PayslipResult {
  employee: Employee;
  month: string;
  currency: string;
  payslip: Payslip;
}

@Injectable()
export class PayrollService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employees: EmployeeRepository,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(PAYROLL_CONFIG_PROVIDER)
    private readonly config: PayrollConfigProvider,
    private readonly calculator: PayrollCalculator,
  ) {}

  async getPayslip(employeeId: string, month: string): Promise<PayslipResult> {
    const employee = await this.employees.findById(employeeId);
    if (!employee) throw new EmployeeNotFoundError(employeeId);
    if (!employee.isActive()) throw new InactiveEmployeeError(employee.id);
    this.assertMonthIsPayable(employee, month);

    const payslip = this.calculator.calculate({
      baseSalary: Money.ofMinor(employee.baseSalaryMinor),
      allowances: toPayslipLines(employee.allowances, month),
      otherDeductions: toPayslipLines(employee.deductions, month),
    });

    return {
      employee,
      month,
      currency: this.config.getRules().currency,
      payslip,
    };
  }

  // Months compare correctly as strings because they are zero-padded YYYY-MM.
  // The hire month itself is payable in full (no proration, see README).
  private assertMonthIsPayable(employee: Employee, month: string): void {
    if (month < employee.hireDate.slice(0, 7)) {
      throw new PayslipMonthBeforeHireError(month, employee.hireDate);
    }
    if (month > this.clock.now().toISOString().slice(0, 7)) {
      throw new PayslipMonthInFutureError(month);
    }
  }
}

function toPayslipLines(items: PayItem[], month: string): PayslipLine[] {
  return items.filter((item) => item.month === month).map((item) => ({
    type: item.type,
    amount: Money.ofMinor(item.amountMinor),
  }));
}
