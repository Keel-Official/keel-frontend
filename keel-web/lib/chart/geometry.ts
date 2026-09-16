/**
 * THE ONLY MODULE IN THIS CODEBASE THAT MAY TURN A DECIMAL STRING INTO A NUMBER.
 *
 * Pixel positions need numbers, so the conversion has to happen somewhere. It happens
 * here and nowhere else, and `scripts/check-no-float-math.mts` fails the build if it
 * appears anywhere outside this file.
 *
 * Everything this module returns is a COORDINATE: a ratio between 0 and 1 that a
 * caller turns into a width or an offset. No value returned from here is ever shown to
 * a reader. Every label, tooltip value, axis tick, and table cell comes from the
 * original string by way of `lib/format/`, never from a number converted back.
 *
 * A double cannot hold `"158493.937041927835527438180617150479700224505053101718"`
 * exactly. That is acceptable for a bar a few hundred pixels wide and unacceptable for
 * anything a reader might act on, which is exactly why the boundary is drawn here.
 */

/** A plain decimal string, matching what the API serves. */
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

/**
 * Converts for geometry only. Returns null when the value is absent, unknown, or not a
 * plain decimal, so a caller has to decide what an unmeasured value looks like rather
 * than getting a zero-width bar that reads as a measured zero.
 */
function toGeometryNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!DECIMAL_PATTERN.test(value)) return null;
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : null;
}

/** True when the engine produced a figure that can be drawn. */
export function isDrawable(value: string | null | undefined): boolean {
  return toGeometryNumber(value) !== null;
}

/**
 * Each value as a fraction of the largest in the set, for bars sharing one axis.
 *
 * One scale across the whole set, never one per row: a bar that filled its own row
 * would make every asset look equally deep. An unmeasured value returns null so the
 * caller can draw the absent state instead of a bar of length zero — a computed zero
 * does get a zero-length bar, because that is a measurement.
 */
export function barRatios(values: readonly (string | null | undefined)[]): (number | null)[] {
  const numbers = values.map(toGeometryNumber);
  const max = numbers.reduce<number>(
    (best, n) => (n !== null && n > best ? n : best),
    0,
  );
  if (max <= 0) return numbers.map((n) => (n === null ? null : 0));
  return numbers.map((n) => (n === null ? null : clamp(n / max)));
}

/**
 * A part as a fraction of the whole it decomposes, for a stacked segment.
 *
 * Verified against the live API: `fromSdex + fromAmm` equals `buySide` exactly, on
 * every rung of every monitored asset checked. It does NOT equal `sellSide`, so this
 * decomposition applies to the buy side only.
 */
export function stackRatio(
  part: string | null | undefined,
  whole: string | null | undefined,
): number | null {
  const partNumber = toGeometryNumber(part);
  const wholeNumber = toGeometryNumber(whole);
  if (partNumber === null || wholeNumber === null) return null;
  if (wholeNumber <= 0) return 0;
  return clamp(partNumber / wholeNumber);
}

function clamp(ratio: number): number {
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

/** A ratio as a CSS percentage string. */
export function toPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(4)}%`;
}
