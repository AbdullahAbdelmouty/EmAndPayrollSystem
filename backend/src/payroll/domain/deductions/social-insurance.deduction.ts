import { InvalidPayrollRulesError } from '../errors/invalid-payroll-rules.error';
import { Money } from '../money';
import { Deduction, PayrollContext } from './deduction';

export interface SocialInsuranceRule {
  rateBasisPoints: number;
  // Ceiling on the salary the rate applies to; null means no cap.
  insurableSalaryCapMinor: number | null;
}

export class SocialInsuranceDeduction implements Deduction {
  readonly type = 'SOCIAL_INSURANCE';
  private readonly insurableSalaryCap: Money | null;
  private readonly rateBasisPoints: number;

  constructor(rule: SocialInsuranceRule) {
    if (
      !Number.isInteger(rule.rateBasisPoints) ||
      rule.rateBasisPoints < 0 ||
      rule.rateBasisPoints > 10_000
    ) {
      throw new InvalidPayrollRulesError(
        'social insurance rate must be between 0 and 100%.',
      );
    }
    if (
      rule.insurableSalaryCapMinor !== null &&
      (!Number.isSafeInteger(rule.insurableSalaryCapMinor) ||
        rule.insurableSalaryCapMinor <= 0)
    ) {
      throw new InvalidPayrollRulesError(
        'social insurance cap must be greater than 0 when provided.',
      );
    }
    this.rateBasisPoints = rule.rateBasisPoints;
    this.insurableSalaryCap =
      rule.insurableSalaryCapMinor === null
        ? null
        : Money.ofMinor(rule.insurableSalaryCapMinor);
  }

  calculate({ baseSalary }: PayrollContext): Money {
    const insurableSalary = this.insurableSalaryCap
      ? baseSalary.min(this.insurableSalaryCap)
      : baseSalary;
    return insurableSalary.multiplyByBasisPoints(this.rateBasisPoints);
  }
}
