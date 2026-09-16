/**
 * Ordering for decimal strings, by string comparison only.
 *
 * Sorting a column is the one operation a table needs that looks like arithmetic, and
 * it is where a float gets introduced. It does not need to be: two plain decimal
 * strings can be ordered exactly by comparing their digits.
 *
 * WHY NOT decimal.js, which the backend notes suggest. Ordering needs no arbitrary
 * precision arithmetic, only comparison, so the library buys nothing here. Carrying it
 * would put `.toNumber()` one keystroke away in every file that sorts a column, which
 * is the exact failure `scripts/check-no-float-math.mts` exists to prevent. Nothing in
 * this codebase parses or computes a monetary value, so nothing needs a decimal type.
 */
import { isMeasured, isZeroString, type KeelValue } from './value';

function stripLeadingZeros(digits: string): string {
  const stripped = digits.replace(/^0+/, '');
  return stripped.length === 0 ? '0' : stripped;
}

function splitParts(unsigned: string): { integer: string; fraction: string } {
  const pointIndex = unsigned.indexOf('.');
  if (pointIndex === -1) return { integer: stripLeadingZeros(unsigned), fraction: '' };
  return {
    integer: stripLeadingZeros(unsigned.slice(0, pointIndex)),
    fraction: unsigned.slice(pointIndex + 1),
  };
}

/** Compares two non-negative decimal strings by magnitude. */
function compareMagnitude(a: string, b: string): number {
  const left = splitParts(a);
  const right = splitParts(b);

  // More integer digits means a larger number, once leading zeros are gone.
  if (left.integer.length !== right.integer.length) {
    return left.integer.length < right.integer.length ? -1 : 1;
  }
  if (left.integer !== right.integer) return left.integer < right.integer ? -1 : 1;

  // Equal integer parts: pad the fractions so digit positions line up.
  const width = Math.max(left.fraction.length, right.fraction.length);
  const leftFraction = left.fraction.padEnd(width, '0');
  const rightFraction = right.fraction.padEnd(width, '0');
  if (leftFraction === rightFraction) return 0;
  return leftFraction < rightFraction ? -1 : 1;
}

/**
 * Orders two decimal strings exactly. Both must be plain decimals; the API does not
 * use exponent notation.
 */
export function compareDecimalStrings(a: string, b: string): number {
  const aNegative = a.startsWith('-');
  const bNegative = b.startsWith('-');
  const aMagnitude = aNegative ? a.slice(1) : a;
  const bMagnitude = bNegative ? b.slice(1) : b;

  const magnitude = compareMagnitude(aMagnitude, bMagnitude);
  if (aNegative !== bNegative) {
    // Opposite signs: the negative one is smaller. The single exception is -0 against
    // 0, which are the same value, and equal magnitudes alone do not establish that.
    if (isZeroString(aMagnitude) && isZeroString(bMagnitude)) return 0;
    return aNegative ? -1 : 1;
  }
  return aNegative ? -magnitude : magnitude;
}

/**
 * Ordering for a sortable column.
 *
 * Values the engine did not produce sort to the end in both directions, rather than
 * to one extreme of the scale. An asset whose collateral ceiling could not be computed
 * is not the safest asset in the table, and it is not the riskiest either; sorting it
 * to either end would state something the engine did not.
 */
export function compareValues(a: KeelValue, b: KeelValue): number {
  const aMeasured = isMeasured(a);
  const bMeasured = isMeasured(b);
  if (!aMeasured && !bMeasured) return 0;
  if (!aMeasured) return 1;
  if (!bMeasured) return -1;
  return compareDecimalStrings(a.exact as string, b.exact as string);
}

/** Applies a direction to a comparator while keeping unmeasured values last. */
export function byValue(
  direction: 'asc' | 'desc',
): (a: KeelValue, b: KeelValue) => number {
  return (a, b) => {
    const aMeasured = isMeasured(a);
    const bMeasured = isMeasured(b);
    if (!aMeasured || !bMeasured) return compareValues(a, b);
    return direction === 'asc' ? compareValues(a, b) : -compareValues(a, b);
  };
}
