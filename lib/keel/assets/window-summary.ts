import type { HistoryPoint } from '../api/types';
import type { Gap } from '../chart/geometry';
import { compareDecimalStrings } from '../format/compare';
import { compareBands, type Band } from '../format/flags';
import { classify, isMeasured } from '../format/value';

/**
 * What a window of stored readings says about one row, using comparison and counting
 * only.
 *
 * The pattern this borrows from prints a mean and a standard deviation beside each
 * market. Neither is available here and neither is faked: a mean divides decimals and a
 * deviation takes a root, and nothing in this codebase computes a financial value — see
 * the note at the top of `lib/keel/format/compare.ts` and the one in
 * `components/dashboard/metric-panel.tsx`.
 *
 * What replaces them is stronger for this product anyway. A reader sizing a position
 * does not want the average depth of the last week, they want the WORST reading in it,
 * and that is a served string found by comparing digits. Nothing returned from here was
 * derived; every figure is a string the engine sent, carried with the ledger it came
 * from.
 */

export interface Reading {
  /** The served string, never reconstructed. */
  readonly value: string;
  readonly ledgerSeq: number;
  readonly ledgerClosedAt: string;
}

export interface WindowSummary {
  /** Readings stored in the window, measured or not. */
  readonly points: number;
  /** Readings that carried a figure for this metric. */
  readonly readings: number;
  readonly first: Reading | null;
  readonly last: Reading | null;
  readonly low: Reading | null;
  readonly high: Reading | null;
  /**
   * −1 thinner, 0 unchanged, 1 deeper, settled by comparing digits.
   *
   * Null when either end carried no figure, AND null when there is a single reading:
   * "unchanged" is a claim about two readings and one reading cannot support it.
   */
  readonly direction: -1 | 0 | 1 | null;
  /** A declared gap, or a reading that carried nothing. The line has to break here. */
  readonly broken: boolean;
}

function reading(point: HistoryPoint, value: string): Reading {
  return {
    value,
    ledgerSeq: point.ledgerSeq,
    ledgerClosedAt: point.ledgerClosedAt,
  };
}

export function summariseWindow(
  points: readonly HistoryPoint[],
  pick: (point: HistoryPoint) => string | null | undefined,
  options: { gaps?: readonly Gap[] } = {},
): WindowSummary {
  let first: Reading | null = null;
  let last: Reading | null = null;
  let low: Reading | null = null;
  let high: Reading | null = null;
  let readings = 0;
  let missing = false;

  for (const point of points) {
    const value = classify(pick(point));
    // `classify` rejects anything that is not a plain decimal, so a value that reaches
    // this branch is one the comparison can order exactly.
    if (!isMeasured(value) || value.exact === null) {
      missing = true;
      continue;
    }

    const at = reading(point, value.exact);
    readings += 1;
    if (first === null) first = at;
    last = at;
    if (low === null || compareDecimalStrings(at.value, low.value) < 0)
      low = at;
    if (high === null || compareDecimalStrings(at.value, high.value) > 0)
      high = at;
  }

  const direction =
    first === null || last === null || readings < 2
      ? null
      : (Math.sign(compareDecimalStrings(last.value, first.value)) as
          -1 | 0 | 1);

  return {
    points: points.length,
    readings,
    first,
    last,
    low,
    high,
    direction,
    broken: missing || (options.gaps ?? []).length > 0,
  };
}

export interface BandMix {
  /** Readings at each band. Integer counting; a band is not a score to average. */
  readonly counts: readonly { readonly band: Band; readonly count: number }[];
  readonly total: number;
  /** The worst band that appears anywhere in the window. */
  readonly worst: Band | null;
  /** More than one band appeared: the engine's verdict moved inside the window. */
  readonly changed: boolean;
}

export function bandMix(points: readonly HistoryPoint[]): BandMix {
  const tally = new Map<Band, number>();
  for (const point of points) {
    tally.set(point.band, (tally.get(point.band) ?? 0) + 1);
  }

  const counts = [...tally.entries()]
    .map(([band, count]) => ({ band, count }))
    // Worst first — `compareBands` ranks CRITICAL lowest — then the larger count, so
    // the two bands a row shows are the two worth showing.
    .sort((a, b) => compareBands(a.band, b.band) || b.count - a.count);

  return {
    counts,
    total: points.length,
    worst: counts[0]?.band ?? null,
    changed: counts.length > 1,
  };
}
