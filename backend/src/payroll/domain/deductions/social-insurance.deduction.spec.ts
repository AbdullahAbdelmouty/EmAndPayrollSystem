import { InvalidPayrollRulesError } from '../errors/invalid-payroll-rules.error';
import { Money } from '../money';
import { SocialInsuranceDeduction } from './social-insurance.deduction';

const insuranceOn = (
  baseMinor: number,
  rule = {
    rateBasisPoints: 800,
    insurableSalaryCapMinor: 4_000_000 as number | null,
  },
  grossMinor = baseMinor,
) =>
  new SocialInsuranceDeduction(rule)
    .calculate({
      baseSalary: Money.ofMinor(baseMinor),
      grossSalary: Money.ofMinor(grossMinor),
    })
    .toMinorNumber();

describe('SocialInsuranceDeduction', () => {
  it('is identified as SOCIAL_INSURANCE', () => {
    expect(
      new SocialInsuranceDeduction({
        rateBasisPoints: 0,
        insurableSalaryCapMinor: null,
      }).type,
    ).toBe('SOCIAL_INSURANCE');
  });

  it('applies the rate below the cap', () => {
    expect(insuranceOn(1_000_000)).toBe(80_000);
  });

  it('applies the rate exactly at the cap', () => {
    expect(insuranceOn(4_000_000)).toBe(320_000);
  });

  it('stops growing above the cap', () => {
    expect(insuranceOn(6_000_000)).toBe(320_000);
  });

  it('applies the rate to the full salary when there is no cap', () => {
    expect(
      insuranceOn(6_000_000, {
        rateBasisPoints: 800,
        insurableSalaryCapMinor: null,
      }),
    ).toBe(480_000);
  });

  it('is based on base salary, not on allowances', () => {
    expect(insuranceOn(1_000_000, undefined, 1_500_000)).toBe(80_000);
  });

  it('is zero when the rate is zero', () => {
    expect(
      insuranceOn(1_000_000, {
        rateBasisPoints: 0,
        insurableSalaryCapMinor: null,
      }),
    ).toBe(0);
  });

  it('rounds half-up', () => {
    expect(insuranceOn(1_006)).toBe(80); // 80.48
    expect(insuranceOn(1_007)).toBe(81); // 80.56
  });

  it.each([-1, 10_001, 8.5])('rejects rate %p', (rate) => {
    expect(
      () =>
        new SocialInsuranceDeduction({
          rateBasisPoints: rate,
          insurableSalaryCapMinor: null,
        }),
    ).toThrow(InvalidPayrollRulesError);
  });

  it.each([0, -5])('rejects cap %p', (cap) => {
    expect(
      () =>
        new SocialInsuranceDeduction({
          rateBasisPoints: 800,
          insurableSalaryCapMinor: cap,
        }),
    ).toThrow(InvalidPayrollRulesError);
  });
});
