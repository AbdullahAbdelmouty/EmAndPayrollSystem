import { IncomeTaxDeduction } from '../domain/deductions/income-tax.deduction';
import { SocialInsuranceDeduction } from '../domain/deductions/social-insurance.deduction';
import { InvalidPayrollRulesError } from '../domain/errors/invalid-payroll-rules.error';
import { PayrollCalculator } from '../domain/payroll-calculator';
import { ProgressiveTaxSchedule } from '../domain/tax-bracket';
import { PayrollRules } from './payroll-config.provider';

// Wires configuration into the domain. Invalid rules throw here, so a bad config fails at startup.
export function buildPayrollCalculator(rules: PayrollRules): PayrollCalculator {
  const taxSchedule = new ProgressiveTaxSchedule(
    rules.incomeTax.brackets.map((bracket, index) => ({
      upToMinor: bracket.upToMinor,
      rateBasisPoints: percentToBasisPoints(
        bracket.ratePercent,
        `tax bracket ${index + 1} rate`,
      ),
    })),
  );
  const socialInsurance = new SocialInsuranceDeduction({
    rateBasisPoints: percentToBasisPoints(
      rules.socialInsurance.ratePercent,
      'social insurance rate',
    ),
    insurableSalaryCapMinor: rules.socialInsurance.insurableSalaryCapMinor,
  });

  return new PayrollCalculator([
    socialInsurance,
    new IncomeTaxDeduction(taxSchedule),
  ]);
}

function percentToBasisPoints(percent: number, label: string): number {
  const basisPoints = Math.round(percent * 100);
  if (
    !Number.isFinite(percent) ||
    Math.abs(basisPoints - percent * 100) > 1e-6
  ) {
    throw new InvalidPayrollRulesError(
      `${label} must have at most two decimal places.`,
    );
  }
  return basisPoints;
}
