import { describe, expect, it } from 'vitest';

import { bandMix, summariseWindow } from '../lib/keel/assets/window-summary';
import type { HistoryPoint } from '../lib/keel/api/types';
import type { Band } from '../lib/keel/format/flags';

/**
 * The window a row reports, and the line between what it may say and what it may not.
 *
 * Everything here is comparison or counting. The pattern this borrows from prints a
 * mean and a standard deviation; both divide, and nothing in this codebase computes a
 * financial value, so the tests that matter are the ones proving the figures come back
 * as SERVED rather than derived — and that a window with nothing comparable in it says
 * so instead of guessing.
 */

function point(
  ledgerSeq: number,
  depth: string | null,
  band: Band = 'CRITICAL',
): HistoryPoint {
  return {
    ledgerSeq,
    ledgerClosedAt: `2026-09-1${ledgerSeq}T00:00:00Z`,
    depth5PctBuySide: depth,
    band,
    flags: [],
  };
}

const pick = (p: HistoryPoint) => p.depth5PctBuySide;

describe('summariseWindow', () => {
  it('returns the served string, not a normalised one', () => {
    // "1.50" and "1.5" are equal as numbers and are different strings. The engine sent
    // one of them and that is the one a reader is shown.
    const summary = summariseWindow([point(1, '1.50'), point(2, '1.5')], pick);

    expect(summary.low?.value).toBe('1.50');
    expect(summary.high?.value).toBe('1.50');
    expect(summary.direction).toBe(0);
  });

  it('finds the extremes by digits rather than by length', () => {
    const summary = summariseWindow(
      [point(1, '9'), point(2, '10'), point(3, '0.5')],
      pick,
    );

    expect(summary.low?.value).toBe('0.5');
    expect(summary.high?.value).toBe('10');
    expect(summary.low?.ledgerSeq).toBe(3);
  });

  it('says thinner and deeper by comparing the ends', () => {
    expect(
      summariseWindow([point(1, '100'), point(2, '40')], pick).direction,
    ).toBe(-1);
    expect(
      summariseWindow([point(1, '40'), point(2, '100')], pick).direction,
    ).toBe(1);
  });

  it('refuses a direction for a single reading', () => {
    // "Unchanged" is a claim about two readings. One cannot support it.
    const summary = summariseWindow([point(1, '100')], pick);

    expect(summary.readings).toBe(1);
    expect(summary.direction).toBeNull();
    expect(summary.low?.value).toBe('100');
  });

  it('refuses a direction when an end carried nothing', () => {
    const summary = summariseWindow(
      [point(1, null), point(2, '100'), point(3, null)],
      pick,
    );

    expect(summary.points).toBe(3);
    expect(summary.readings).toBe(1);
    expect(summary.direction).toBeNull();
    expect(summary.broken).toBe(true);
  });

  it('treats a computed zero as a measurement', () => {
    // Zero depth is the most severe thing this column reports. It is a reading, so it
    // is counted, it can be the low, and it is not a missing value.
    const summary = summariseWindow([point(1, '0'), point(2, '0')], pick);

    expect(summary.readings).toBe(2);
    expect(summary.low?.value).toBe('0');
    expect(summary.high?.value).toBe('0');
    expect(summary.direction).toBe(0);
    expect(summary.broken).toBe(false);
  });

  it('breaks on a declared gap even when every reading carried a value', () => {
    const summary = summariseWindow([point(1, '1'), point(2, '2')], pick, {
      gaps: [{ from: 1, to: 2 }],
    });

    expect(summary.readings).toBe(2);
    expect(summary.broken).toBe(true);
  });

  it('reports an empty window without inventing an endpoint', () => {
    const summary = summariseWindow([], pick);

    expect(summary).toMatchObject({
      points: 0,
      readings: 0,
      first: null,
      last: null,
      low: null,
      high: null,
      direction: null,
    });
  });
});

describe('bandMix', () => {
  it('counts readings per band, worst first', () => {
    const mix = bandMix([
      point(1, '1', 'MEDIUM'),
      point(2, '1', 'CRITICAL'),
      point(3, '1', 'MEDIUM'),
    ]);

    expect(mix.total).toBe(3);
    expect(mix.worst).toBe('CRITICAL');
    expect(mix.counts).toEqual([
      { band: 'CRITICAL', count: 1 },
      { band: 'MEDIUM', count: 2 },
    ]);
    expect(mix.changed).toBe(true);
  });

  it('does not call a steady verdict a change', () => {
    const mix = bandMix([point(1, '1', 'LOW'), point(2, '1', 'LOW')]);

    expect(mix.changed).toBe(false);
    expect(mix.worst).toBe('LOW');
  });

  it('holds nothing for an empty window', () => {
    expect(bandMix([])).toMatchObject({ total: 0, worst: null, changed: false });
  });
});
