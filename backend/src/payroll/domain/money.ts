import { BASIS_POINTS_DENOMINATOR, divideRoundHalfUp } from './rounding';

// Immutable amount in minor units (cents). bigint internally so intermediate
// products (amount x rate) can never lose precision the way floats would.
export class Money {
  private constructor(private readonly minorUnits: bigint) {}

  static zero(): Money {
    return new Money(0n);
  }

  static ofMinor(amount: number | bigint): Money {
    if (typeof amount === 'number' && !Number.isSafeInteger(amount)) {
      throw new RangeError(
        `Money must be a whole number of minor units, received ${amount}.`,
      );
    }
    return new Money(BigInt(amount));
  }

  static sum(values: readonly Money[]): Money {
    return values.reduce((total, value) => total.add(value), Money.zero());
  }

  add(other: Money): Money {
    return new Money(this.minorUnits + other.minorUnits);
  }

  subtract(other: Money): Money {
    return new Money(this.minorUnits - other.minorUnits);
  }

  min(other: Money): Money {
    return this.minorUnits <= other.minorUnits ? this : other;
  }

  multiplyByBasisPoints(basisPoints: number): Money {
    if (!Number.isSafeInteger(basisPoints) || basisPoints < 0) {
      throw new RangeError(
        `Basis points must be a non-negative integer, received ${basisPoints}.`,
      );
    }
    return new Money(
      divideRoundHalfUp(
        this.minorUnits * BigInt(basisPoints),
        BASIS_POINTS_DENOMINATOR,
      ),
    );
  }

  isNegative(): boolean {
    return this.minorUnits < 0n;
  }

  isZero(): boolean {
    return this.minorUnits === 0n;
  }

  equals(other: Money): boolean {
    return this.minorUnits === other.minorUnits;
  }

  toMinorBigInt(): bigint {
    return this.minorUnits;
  }

  toMinorNumber(): number {
    const value = Number(this.minorUnits);
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(
        `${this.minorUnits} does not fit in a safe integer.`,
      );
    }
    return value;
  }

  toString(): string {
    return this.minorUnits.toString();
  }
}
