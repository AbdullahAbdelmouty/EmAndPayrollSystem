import { Money } from './money';

export interface PayslipLine {
  type: string;
  amount: Money;
}

export interface Payslip {
  readonly baseSalary: Money;
  readonly allowances: readonly PayslipLine[];
  readonly grossSalary: Money;
  readonly statutoryDeductions: readonly PayslipLine[];
  readonly otherDeductions: readonly PayslipLine[];
  readonly totalDeductions: Money;
  readonly netSalary: Money;
}
