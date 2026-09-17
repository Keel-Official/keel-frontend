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

/**
 * A polyline through a series, broken wherever the engine reported a gap or could not
 * produce a value.
 *
 * Gaps are ledger ranges the engine says hold no data. Drawing a segment across one
 * would invent a trend between two readings that were never adjacent, which is the same
 * class of error as averaging a band. So the result is a LIST of segments: each is a
 * run of consecutive points, and the break between them is the finding.
 *
 * A point whose value is null breaks the line for the same reason. It is not a zero.
 */
export interface SeriesPoint {
  /** Position along the x axis, typically a ledger sequence. */
  readonly at: number;
  /** The served decimal string, or null when the engine produced nothing. */
  readonly value: string | null | undefined;
}

export interface Gap {
  readonly from: number;
  readonly to: number;
}

export interface PlottedPoint {
  readonly x: number;
  readonly y: number;
  readonly at: number;
}

export interface PlottedSeries {
  /** Runs of consecutive points. A break between runs is a gap, drawn as a gap. */
  readonly segments: readonly (readonly PlottedPoint[])[];
  /** True when at least one point carried a value. */
  readonly hasData: boolean;
}

/**
 * Projects a series into 0..1 coordinates. The y scale spans the whole set passed in,
 * so several series drawn together stay comparable; the caller passes them together
 * when that is what it wants.
 */
export function plotSeries(
  points: readonly SeriesPoint[],
  options: { gaps?: readonly Gap[]; min?: number; max?: number } = {},
): PlottedSeries {
  const numeric = points.map((p) => ({ at: p.at, n: toGeometryNumber(p.value) }));
  const present = numeric.filter((p) => p.n !== null) as { at: number; n: number }[];
  if (present.length === 0) return { segments: [], hasData: false };

  const xs = numeric.map((p) => p.at);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const xSpan = xMax - xMin || 1;

  const yMin = options.min ?? Math.min(...present.map((p) => p.n));
  const yMax = options.max ?? Math.max(...present.map((p) => p.n));
  const ySpan = yMax - yMin || 1;

  const inGap = (a: number, b: number): boolean =>
    (options.gaps ?? []).some((g) => g.from >= a && g.to <= b) ||
    (options.gaps ?? []).some((g) => g.from <= b && g.to >= a);

  const segments: PlottedPoint[][] = [];
  let current: PlottedPoint[] = [];
  let previousAt: number | null = null;

  for (const point of numeric) {
    if (point.n === null) {
      if (current.length > 0) segments.push(current);
      current = [];
      previousAt = null;
      continue;
    }
    if (previousAt !== null && inGap(previousAt, point.at)) {
      if (current.length > 0) segments.push(current);
      current = [];
    }
    current.push({
      x: clamp((point.at - xMin) / xSpan),
      y: clamp((point.n - yMin) / ySpan),
      at: point.at,
    });
    previousAt = point.at;
  }
  if (current.length > 0) segments.push(current);

  return { segments, hasData: true };
}

/** The y extent across several series, so they can share one axis. */
export function sharedExtent(
  series: readonly (readonly SeriesPoint[])[],
): { min: number; max: number } | null {
  const numbers: number[] = [];
  for (const points of series) {
    for (const point of points) {
      const n = toGeometryNumber(point.value);
      if (n !== null) numbers.push(n);
    }
  }
  if (numbers.length === 0) return null;
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}
