import { Money } from '../money';

export class DeductionsExceedGrossError extends Error {
  constructor(grossSalary: Money, totalDeductions: Money) {
    super(
      `Total deductions (${totalDeductions.toString()}) exceed gross salary (${grossSalary.toString()}) in minor units.`,
    );
    this.name = 'DeductionsExceedGrossError';
  }
}
