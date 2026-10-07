import { Money } from '../money';
import { ProgressiveTaxSchedule } from '../tax-bracket';
import { IncomeTaxDeduction } from './income-tax.deduction';

describe('IncomeTaxDeduction', () => {
  const deduction = new IncomeTaxDeduction(
    new ProgressiveTaxSchedule([
      { upToMinor: 1_000_000, rateBasisPoints: 0 },
      { upToMinor: null, rateBasisPoints: 1000 },
    ]),
  );

  it('is identified as INCOME_TAX', () => {
    expect(deduction.type).toBe('INCOME_TAX');
  });

  it('taxes gross salary, including allowances', () => {
    const tax = deduction.calculate({
      baseSalary: Money.ofMinor(1_000_000),
      grossSalary: Money.ofMinor(1_500_000),
    });
    expect(tax.toMinorNumber()).toBe(50_000);
  });
});
