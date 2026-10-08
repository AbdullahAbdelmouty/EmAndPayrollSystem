import { InvalidPayrollRulesError } from './errors/invalid-payroll-rules.error';
import { Money } from './money';
import { ProgressiveTaxSchedule, TaxBracket } from './tax-bracket';

const BRACKETS: TaxBracket[] = [
  { upToMinor: 1_000_000, rateBasisPoints: 0 },
  { upToMinor: 3_000_000, rateBasisPoints: 1000 },
  { upToMinor: null, rateBasisPoints: 2000 },
];

const taxOn = (minor: number, brackets = BRACKETS) =>
  new ProgressiveTaxSchedule(brackets)
    .taxOn(Money.ofMinor(minor))
    .toMinorNumber();

describe('ProgressiveTaxSchedule', () => {
  describe('taxOn', () => {
    it('is zero for zero income and income inside the tax-free bracket', () => {
      expect(taxOn(0)).toBe(0);
      expect(taxOn(500_000)).toBe(0);
    });

    it('is zero exactly on the first boundary', () => {
      expect(taxOn(1_000_000)).toBe(0);
    });

    it('taxes only the slice above the first boundary', () => {
      expect(taxOn(2_000_000)).toBe(100_000);
    });

    it('is continuous across the second boundary', () => {
      expect(taxOn(3_000_000)).toBe(200_000);
      expect(taxOn(3_000_005)).toBe(200_001); // 5 x 20% = 1
    });

    it('applies every bracket to income in the top bracket', () => {
      expect(taxOn(4_000_000)).toBe(400_000);
    });

    it('rounds half-up', () => {
      expect(taxOn(1_000_005)).toBe(1); // 0.5 -> 1
      expect(taxOn(1_000_004)).toBe(0); // 0.4 -> 0
    });

    it('rounds once on the exact total, not per bracket', () => {
      const split: TaxBracket[] = [
        { upToMinor: 5, rateBasisPoints: 1000 },
        { upToMinor: null, rateBasisPoints: 1000 },
      ];
      // 5 x 10% = 0.5 and 5 x 10% = 0.5; exact total 1.0. Per-bracket rounding would give 2.
      expect(taxOn(10, split)).toBe(1);
    });

    it('supports a single flat bracket', () => {
      expect(taxOn(1000, [{ upToMinor: null, rateBasisPoints: 1500 }])).toBe(
        150,
      );
    });
  });

  describe('validation', () => {
    const invalid = (brackets: TaxBracket[]) => () =>
      new ProgressiveTaxSchedule(brackets);

    it('rejects an empty schedule', () => {
      expect(invalid([])).toThrow(InvalidPayrollRulesError);
    });

    it('rejects bounds that are not strictly ascending', () => {
      expect(
        invalid([
          { upToMinor: 100, rateBasisPoints: 0 },
          { upToMinor: 100, rateBasisPoints: 10 },
          { upToMinor: null, rateBasisPoints: 20 },
        ]),
      ).toThrow(InvalidPayrollRulesError);
      expect(
        invalid([
          { upToMinor: 200, rateBasisPoints: 0 },
          { upToMinor: 100, rateBasisPoints: 10 },
          { upToMinor: null, rateBasisPoints: 20 },
        ]),
      ).toThrow(InvalidPayrollRulesError);
    });

    it('rejects a schedule without an open-ended top bracket', () => {
      expect(invalid([{ upToMinor: 100, rateBasisPoints: 0 }])).toThrow(
        InvalidPayrollRulesError,
      );
    });

    it('rejects an open-ended bracket that is not last', () => {
      expect(
        invalid([
          { upToMinor: null, rateBasisPoints: 0 },
          { upToMinor: null, rateBasisPoints: 10 },
        ]),
      ).toThrow(InvalidPayrollRulesError);
    });

    it.each([-1, 10_001, 12.5])('rejects rate %p', (rate) => {
      expect(invalid([{ upToMinor: null, rateBasisPoints: rate }])).toThrow(
        InvalidPayrollRulesError,
      );
    });
  });
});
