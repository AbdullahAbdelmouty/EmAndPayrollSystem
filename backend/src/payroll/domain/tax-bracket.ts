import { InvalidPayrollRulesError } from './errors/invalid-payroll-rules.error';
import { Money } from './money';
import { BASIS_POINTS_DENOMINATOR, divideRoundHalfUp } from './rounding';

const MAX_RATE_BASIS_POINTS = 10_000;

export interface TaxBracket {
  // Upper bound of the bracket in minor units; null marks the open-ended top bracket.
  upToMinor: number | null;
  rateBasisPoints: number;
}

// Marginal (progressive) tax: each slice of income is taxed at its own bracket's rate,
// so there is no jump in tax when income crosses a boundary.
export class ProgressiveTaxSchedule {
  private readonly brackets: ReadonlyArray<{
    upTo: bigint | null;
    rateBasisPoints: bigint;
  }>;

  constructor(brackets: readonly TaxBracket[]) {
    ProgressiveTaxSchedule.assertValid(brackets);
    this.brackets = brackets.map((bracket) => ({
      upTo: bracket.upToMinor === null ? null : BigInt(bracket.upToMinor),
      rateBasisPoints: BigInt(bracket.rateBasisPoints),
    }));
  }

  // Rounded once on the exact total, not per bracket, to avoid accumulating rounding error.
  taxOn(taxable: Money): Money {
    const amount = taxable.toMinorBigInt();
    let lowerBound = 0n;
    let exactTaxNumerator = 0n;

    for (const bracket of this.brackets) {
      if (amount <= lowerBound) break;
      const upperBound =
        bracket.upTo === null || amount < bracket.upTo ? amount : bracket.upTo;
      exactTaxNumerator += (upperBound - lowerBound) * bracket.rateBasisPoints;
      if (bracket.upTo === null) break;
      lowerBound = bracket.upTo;
    }

    return Money.ofMinor(
      divideRoundHalfUp(exactTaxNumerator, BASIS_POINTS_DENOMINATOR),
    );
  }

  private static assertValid(brackets: readonly TaxBracket[]): void {
    if (brackets.length === 0) {
      throw new InvalidPayrollRulesError(
        'at least one tax bracket is required.',
      );
    }

    let previousBound = 0;
    brackets.forEach((bracket, index) => {
      const isLast = index === brackets.length - 1;

      if (
        !Number.isInteger(bracket.rateBasisPoints) ||
        bracket.rateBasisPoints < 0 ||
        bracket.rateBasisPoints > MAX_RATE_BASIS_POINTS
      ) {
        throw new InvalidPayrollRulesError(
          `tax bracket ${index + 1} rate must be between 0 and 100%.`,
        );
      }
      if (bracket.upToMinor === null) {
        if (!isLast) {
          throw new InvalidPayrollRulesError(
            'only the last tax bracket may be open-ended.',
          );
        }
        return;
      }
      if (isLast) {
        throw new InvalidPayrollRulesError(
          'the last tax bracket must be open-ended (upToMinor null).',
        );
      }
      if (
        !Number.isSafeInteger(bracket.upToMinor) ||
        bracket.upToMinor <= previousBound
      ) {
        throw new InvalidPayrollRulesError(
          'tax bracket bounds must be strictly ascending positive integers.',
        );
      }
      previousBound = bracket.upToMinor;
    });
  }
}
