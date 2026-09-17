/**
 * Display formatting for decimal strings, by string manipulation only.
 *
 * The engine uses arbitrary-precision decimals and serves them as strings.
 * `"158493.937041927835527438180617150479700224505053101718"` has 48 fraction digits
 * and does not survive `Number()`. Nothing in this module parses, converts, rounds,
 * or otherwise computes: it slices and it inserts separators.
 *
 * ON SHORTENING A FIGURE. A table cell cannot carry 48 fraction digits, so a display
 * length has to be chosen. This module truncates, never rounds, and reports that it
 * did. Rounding was rejected: carrying a digit is arithmetic, and on a cost figure it
 * would show a number larger than the one the engine computed, which is the wrong
 * direction to be wrong in for a risk display. Truncation is not safe either — it
 * shows a number smaller than the engine's — which is why `truncated` is part of the
 * return value rather than an implementation detail: a caller that drops digits is
 * required to mark that it did, and to keep `exact` reachable.
 *
 * What counts as a meaningful number of digits for a given metric is a methodology
 * question, not a formatting one.
 *
 * TODO-COPY(Al): state, per metric family (price, depth, cost, collateral), how many
 * fraction digits are meaningful to show by default, and whether a truncated figure
 * should read as an approximation or always be accompanied by the exact value.
 */

/** Group separator for the integer part. The decimal point stays `.`, as served. */
const GROUP_SEPARATOR = ',';
const GROUP_SIZE = 3;

/**
 * Significant digits kept when a value is smaller than the requested display
 * precision. Two, so a reader can tell 0.0000001 from 0.0000009.
 */
const SIGNIFICANT_DIGITS = 2;

export interface DecimalDisplay {
  /** What to put on screen. */
  readonly display: string;
  /** The string exactly as served, for tooltips, copy actions, and comparisons. */
  readonly exact: string;
  /** True when fraction digits were dropped and the display is not the whole value. */
  readonly truncated: boolean;
}

export interface FormatDecimalOptions {
  /** Fraction digits to keep. Omitted means keep every digit served. */
  readonly maxFractionDigits?: number;
  /** Insert thousands separators into the integer part. Defaults to true. */
  readonly group?: boolean;
}

function groupIntegerDigits(digits: string): string {
  let out = '';
  for (let i = 0; i < digits.length; i += 1) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && fromEnd % GROUP_SIZE === 1) out += GROUP_SEPARATOR;
  }
  return out;
}

export function formatDecimal(
  exact: string,
  options: FormatDecimalOptions = {},
): DecimalDisplay {
  const { maxFractionDigits, group = true } = options;

  const negative = exact.startsWith('-');
  const unsigned = negative ? exact.slice(1) : exact;
  const pointIndex = unsigned.indexOf('.');
  const integerPart =
    pointIndex === -1 ? unsigned : unsigned.slice(0, pointIndex);
  const fractionPart = pointIndex === -1 ? '' : unsigned.slice(pointIndex + 1);

  let shownFraction = fractionPart;
  let truncated = false;
  if (
    maxFractionDigits !== undefined &&
    fractionPart.length > maxFractionDigits
  ) {
    shownFraction = fractionPart.slice(0, maxFractionDigits);
    truncated = true;

    // A small positive value must not be shortened into something that reads as zero.
    // "0.0000001" at two fraction digits would display as "0.00", which is the same
    // thing on screen as a computed zero — and those are different findings. When the
    // kept digits are all zero but the value is not, keep slicing until two significant
    // digits are in view.
    if (/^0*$/.test(integerPart) && /^0*$/.test(shownFraction)) {
      const firstSignificant = fractionPart.search(/[1-9]/);
      if (firstSignificant !== -1) {
        shownFraction = fractionPart.slice(
          0,
          firstSignificant + SIGNIFICANT_DIGITS,
        );
        truncated = shownFraction.length < fractionPart.length;
      }
    }
  }

  const shownInteger = group ? groupIntegerDigits(integerPart) : integerPart;
  const body =
    shownFraction.length > 0
      ? `${shownInteger}.${shownFraction}`
      : shownInteger;

  return { display: negative ? `-${body}` : body, exact, truncated };
}

/**
 * Renders a figure with its unit. Keel quotes in an asset rather than in an abstract
 * currency, so a bare number is ambiguous about what it measures.
 */
export function withUnit(display: string, unit: string | null): string {
  return unit === null ? display : `${display} ${unit}`;
}

/**
 * A 56-character Stellar issuer does not fit a layout. Truncation is in the middle so
 * both ends stay comparable by eye; the full value is always what gets copied.
 */
export function truncateIssuer(issuer: string, edge = 4): string {
  if (issuer.length <= edge * 2 + 1) return issuer;
  return `${issuer.slice(0, edge)}…${issuer.slice(-edge)}`;
}

/**
 * `CODE:ISSUER`, or the bare code for the native asset. Never match an asset on its
 * code alone: 97 distinct assets share the AQUA ticker.
 */
export function assetId(code: string, issuer: string | null): string {
  return issuer === null ? code : `${code}:${issuer}`;
}
