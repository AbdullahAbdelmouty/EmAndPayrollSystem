import { Money } from './money';

describe('Money', () => {
  it('rejects fractional and unsafe numbers', () => {
    expect(() => Money.ofMinor(10.5)).toThrow(RangeError);
    expect(() => Money.ofMinor(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      RangeError,
    );
  });

  it('adds and subtracts exactly', () => {
    const result = Money.ofMinor(10)
      .add(Money.ofMinor(20))
      .subtract(Money.ofMinor(5));
    expect(result.toMinorNumber()).toBe(25);
  });

  it('sums an empty list to zero', () => {
    expect(Money.sum([]).isZero()).toBe(true);
  });

  it('returns the smaller amount from min', () => {
    expect(Money.ofMinor(5).min(Money.ofMinor(9)).toMinorNumber()).toBe(5);
    expect(Money.ofMinor(9).min(Money.ofMinor(5)).toMinorNumber()).toBe(5);
  });

  describe('multiplyByBasisPoints', () => {
    it.each([
      [1050, 1000, 105],
      [4, 1000, 0], // 0.4 rounds down
      [5, 1000, 1], // 0.5 rounds up (half-up)
      [15, 1000, 2], // 1.5 rounds up
      [14, 1000, 1], // 1.4 rounds down
      [0, 1000, 0],
    ])('%i minor x %i bps = %i minor', (amount, bps, expected) => {
      expect(
        Money.ofMinor(amount).multiplyByBasisPoints(bps).toMinorNumber(),
      ).toBe(expected);
    });

    it('rejects negative or fractional rates', () => {
      expect(() => Money.ofMinor(1).multiplyByBasisPoints(-1)).toThrow(
        RangeError,
      );
      expect(() => Money.ofMinor(1).multiplyByBasisPoints(0.5)).toThrow(
        RangeError,
      );
    });
  });

  it('keeps precision beyond the float range during multiplication', () => {
    const large = Money.ofMinor(Number.MAX_SAFE_INTEGER);
    expect(large.multiplyByBasisPoints(10_000).equals(large)).toBe(true);
  });
});
