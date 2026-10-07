import { InvalidPayrollRulesError } from '../domain/errors/invalid-payroll-rules.error';
import {
  PayrollRules,
  TaxBracketRule,
} from '../application/payroll-config.provider';

// Checks the shape of the raw JSON. Business validity (ordering, ranges) is enforced by the domain.
export function parsePayrollRules(raw: unknown): PayrollRules {
  const root = asRecord(raw, 'rules');
  const incomeTax = asRecord(root.incomeTax, 'incomeTax');
  const socialInsurance = asRecord(root.socialInsurance, 'socialInsurance');

  if (typeof root.currency !== 'string' || !/^[A-Z]{3}$/.test(root.currency)) {
    throw new InvalidPayrollRulesError(
      'currency must be a 3-letter uppercase code.',
    );
  }
  if (!Array.isArray(incomeTax.brackets)) {
    throw new InvalidPayrollRulesError('incomeTax.brackets must be an array.');
  }

  return {
    currency: root.currency,
    incomeTax: {
      brackets: incomeTax.brackets.map((bracket, index): TaxBracketRule => {
        const record = asRecord(bracket, `incomeTax.brackets[${index}]`);
        return {
          upToMinor: asNullableNumber(
            record.upToMinor,
            `incomeTax.brackets[${index}].upToMinor`,
          ),
          ratePercent: asNumber(
            record.ratePercent,
            `incomeTax.brackets[${index}].ratePercent`,
          ),
        };
      }),
    },
    socialInsurance: {
      ratePercent: asNumber(
        socialInsurance.ratePercent,
        'socialInsurance.ratePercent',
      ),
      insurableSalaryCapMinor: asNullableNumber(
        socialInsurance.insurableSalaryCapMinor,
        'socialInsurance.insurableSalaryCapMinor',
      ),
    },
  };
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidPayrollRulesError(`${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidPayrollRulesError(`${path} must be a number.`);
  }
  return value;
}

function asNullableNumber(value: unknown, path: string): number | null {
  return value === null ? null : asNumber(value, path);
}
