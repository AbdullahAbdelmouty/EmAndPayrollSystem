import { Deduction } from './deductions/deduction';
import { IncomeTaxDeduction } from './deductions/income-tax.deduction';
import { SocialInsuranceDeduction } from './deductions/social-insurance.deduction';
import { DeductionsExceedGrossError } from './errors/deductions-exceed-gross.error';
import { Money } from './money';
import { PayrollCalculator, PayrollInput } from './payroll-calculator';
import { ProgressiveTaxSchedule } from './tax-bracket';

const calculator = new PayrollCalculator([
  new SocialInsuranceDeduction({
    rateBasisPoints: 800,
    insurableSalaryCapMinor: 4_000_000,
  }),
  new IncomeTaxDeduction(
    new ProgressiveTaxSchedule([
      { upToMinor: 1_000_000, rateBasisPoints: 0 },
      { upToMinor: 3_000_000, rateBasisPoints: 1000 },
      { upToMinor: null, rateBasisPoints: 2000 },
    ]),
  ),
]);

const line = (type: string, minor: number) => ({
  type,
  amount: Money.ofMinor(minor),
});

const input = (
  baseMinor: number,
  overrides: Partial<PayrollInput> = {},
): PayrollInput => ({
  baseSalary: Money.ofMinor(baseMinor),
  allowances: [],
  otherDeductions: [],
  ...overrides,
});

const minor = (money: Money) => money.toMinorNumber();

describe('PayrollCalculator', () => {
  it('computes gross, deductions and net for a typical salary', () => {
    const payslip = calculator.calculate(
      input(2_000_000, {
        allowances: [line('TRANSPORT', 200_000), line('HOUSING', 300_000)],
        otherDeductions: [line('LOAN', 50_000)],
      }),
    );

    expect(minor(payslip.grossSalary)).toBe(2_500_000);
    expect(
      payslip.statutoryDeductions.map((d) => [d.type, minor(d.amount)]),
    ).toEqual([
      ['SOCIAL_INSURANCE', 160_000],
      ['INCOME_TAX', 150_000],
    ]);
    expect(minor(payslip.totalDeductions)).toBe(360_000);
    expect(minor(payslip.netSalary)).toBe(2_140_000);
  });

  it('handles zero allowances and zero other deductions', () => {
    const payslip = calculator.calculate(input(800_000));

    expect(minor(payslip.grossSalary)).toBe(800_000);
    expect(minor(payslip.netSalary)).toBe(736_000);
  });

  it('charges no tax when salary sits exactly on the tax-free boundary', () => {
    const payslip = calculator.calculate(input(1_000_000));

    expect(minor(payslip.statutoryDeductions[1].amount)).toBe(0);
    expect(minor(payslip.netSalary)).toBe(920_000);
  });

  it('caps insurance but not tax for a high salary', () => {
    const payslip = calculator.calculate(input(5_000_000));

    expect(minor(payslip.statutoryDeductions[0].amount)).toBe(320_000);
    expect(minor(payslip.statutoryDeductions[1].amount)).toBe(600_000);
    expect(minor(payslip.netSalary)).toBe(4_080_000);
  });

  it('allows net pay of exactly zero', () => {
    const payslip = calculator.calculate(
      input(100_000, { otherDeductions: [line('ADVANCE', 92_000)] }),
    );

    expect(payslip.netSalary.isZero()).toBe(true);
  });

  it('rejects deductions that exceed gross salary', () => {
    expect(() =>
      calculator.calculate(
        input(100_000, { otherDeductions: [line('ADVANCE', 200_000)] }),
      ),
    ).toThrow(DeductionsExceedGrossError);
  });

  it('always balances: gross - total deductions = net', () => {
    const payslip = calculator.calculate(
      input(1_234_567, {
        allowances: [line('TRANSPORT', 12_345)],
        otherDeductions: [line('LOAN', 999)],
      }),
    );

    expect(
      payslip.grossSalary
        .subtract(payslip.totalDeductions)
        .equals(payslip.netSalary),
    ).toBe(true);
  });

  it('runs any additional deduction without changes to the calculator', () => {
    const flatLevy: Deduction = {
      type: 'LEVY',
      calculate: () => Money.ofMinor(1_000),
    };
    const extended = new PayrollCalculator([flatLevy]);

    const payslip = extended.calculate(input(50_000));

    expect(payslip.statutoryDeductions.map((d) => d.type)).toEqual(['LEVY']);
    expect(minor(payslip.netSalary)).toBe(49_000);
  });

  it('does not mutate its input', () => {
    const allowances = [line('TRANSPORT', 1)];
    calculator.calculate(input(100_000, { allowances }));

    expect(allowances).toEqual([line('TRANSPORT', 1)]);
  });
});
