export const BASIS_POINTS_DENOMINATOR = 10_000n;

// Rounding rule for the whole payroll module: half-up to the nearest minor unit
// (0.5 rounds to 1, 0.49 rounds to 0). Amounts are never negative in practice;
// negatives round half away from zero so the rule stays symmetric.
export function divideRoundHalfUp(
  numerator: bigint,
  denominator: bigint,
): bigint {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive.');
  const magnitude = numerator < 0n ? -numerator : numerator;
  const quotient = magnitude / denominator;
  const roundsUp = (magnitude % denominator) * 2n >= denominator;
  const rounded = roundsUp ? quotient + 1n : quotient;
  return numerator < 0n ? -rounded : rounded;
}
