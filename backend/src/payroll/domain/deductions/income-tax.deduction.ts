import { Money } from '../money';
import { ProgressiveTaxSchedule } from '../tax-bracket';
import { Deduction, PayrollContext } from './deduction';

export class IncomeTaxDeduction implements Deduction {
  readonly type = 'INCOME_TAX';

  constructor(private readonly schedule: ProgressiveTaxSchedule) {}

  calculate({ grossSalary }: PayrollContext): Money {
    return this.schedule.taxOn(grossSalary);
  }
}
