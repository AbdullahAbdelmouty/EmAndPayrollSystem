import { Money } from '../money';

export interface PayrollContext {
  baseSalary: Money;
  grossSalary: Money;
}

export interface Deduction {
  readonly type: string;
  calculate(context: PayrollContext): Money;
}
