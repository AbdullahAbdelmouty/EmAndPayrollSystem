import { InvalidPayrollRulesError } from '../domain/errors/invalid-payroll-rules.error';
import { Money } from '../domain/money';
import { buildPayrollCalculator } from './payroll-calculator.factory';
import { PayrollRules } from './payroll-config.provider';

const rules = (overrides: Partial<PayrollRules> = {}): PayrollRules => ({
  currency: 'USD',
  incomeTax: {
    brackets: [
      { upToMinor: 1_000_000, ratePercent: 0 },
      { upToMinor: null, ratePercent: 10 },
    ],
  },
  socialInsurance: { ratePercent: 8, insurableSalaryCapMinor: null },
  ...overrides,
});

const netFor = (config: PayrollRules, baseMinor: number) =>
  buildPayrollCalculator(config)
    .calculate({
      baseSalary: Money.ofMinor(baseMinor),
      allowances: [],
      otherDeductions: [],
    })
    .netSalary.toMinorNumber();

describe('buildPayrollCalculator', () => {
  it('turns percentages into the configured deductions', () => {
    // insurance 8% of 2,000,000 = 160,000; tax 10% of 1,000,000 = 100,000
    expect(netFor(rules(), 2_000_000)).toBe(1_740_000);
  });

  it('supports percentages with two decimals', () => {
    const config = rules({
      socialInsurance: { ratePercent: 8.25, insurableSalaryCapMinor: null },
    });
    // 8.25% of 1,000,000 = 82,500; no tax at the boundary
    expect(netFor(config, 1_000_000)).toBe(917_500);
  });

  it('rejects percentages with more than two decimals', () => {
    const config = rules({
      socialInsurance: { ratePercent: 8.255, insurableSalaryCapMinor: null },
    });
    expect(() => buildPayrollCalculator(config)).toThrow(
      InvalidPayrollRulesError,
    );
  });

  it('fails fast on invalid brackets', () => {
    const config = rules({
      incomeTax: { brackets: [{ upToMinor: 100, ratePercent: 5 }] },
    });
    expect(() => buildPayrollCalculator(config)).toThrow(
      InvalidPayrollRulesError,
    );
  });
});
