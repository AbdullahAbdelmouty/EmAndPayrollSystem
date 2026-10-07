import { Money } from '../money';

export class DeductionsExceedGrossError extends Error {
  constructor(grossSalary: Money, totalDeductions: Money) {
    super(
      `Total deductions (${totalDeductions}) exceed gross salary (${grossSalary}) in minor units.`,
    );
    this.name = 'DeductionsExceedGrossError';
  }
}
