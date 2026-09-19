import { describe, expect, it } from 'vitest';

import {
  PREVIEW_SIZE,
  groupByBand,
  previewOrder,
} from '../lib/keel/assets/band-groups';
import type { AssetSummary } from '../lib/keel/api/types';
import type { Band, BandConfidence } from '../lib/keel/format/flags';
import { DEFAULT_QUERY } from '../lib/keel/url/asset-query';

/**
 * The band sections, which are the page's only grouping.
 *
 * What is worth pinning here is not that a filter works. It is that an EMPTY band is
 * still returned — a band holding nothing at this ledger is a statement about the scan,
 * and a section that silently disappears says nothing at all — and that the four rows a
 * preview shows are the four worth showing rather than whichever four sort first by
 * name.
 */

function row(
  code: string,
  band: Band,
  depth: string | null,
  confidence: BandConfidence = 'partial',
): AssetSummary {
  return {
    asset: { code, type: 'credit_alphanum4', issuer: `G${code}` },
    quote: { code: 'USDC', type: 'credit_alphanum4', issuer: 'GUSDC' },
    depth5PctBuySide: depth,
    maxSafeCollateral: depth,
    band,
    bandConfidence: confidence,
    flags: [],
    ledgerSeq: 1,
  };
}

describe('groupByBand', () => {
  const rows = [
    row('AAA', 'CRITICAL', '30'),
    row('BBB', 'CRITICAL', '10'),
    row('CCC', 'CRITICAL', '20'),
    row('DDD', 'CRITICAL', '40'),
    row('EEE', 'CRITICAL', '50'),
    row('FFF', 'LOW', '900', 'full'),
  ];

  it('returns every band, worst first, including the empty ones', () => {
    const groups = groupByBand(rows, DEFAULT_QUERY);

    expect(groups.map((group) => group.band)).toEqual([
      'CRITICAL',
      'HIGH',
      'MEDIUM',
      'LOW',
    ]);
    // HIGH and MEDIUM hold nothing at this ledger and are still sections.
    expect(groups[1].rows).toHaveLength(0);
    expect(groups[1].preview).toHaveLength(0);
    expect(groups[1].hidden).toBe(0);
  });

  it('holds the rest of a band behind a count rather than dropping it', () => {
    const [critical] = groupByBand(rows, DEFAULT_QUERY);

    expect(critical.rows).toHaveLength(5);
    expect(critical.preview).toHaveLength(PREVIEW_SIZE);
    expect(critical.hidden).toBe(5 - PREVIEW_SIZE);
  });

  it('counts the bands that are floors rather than verdicts', () => {
    const groups = groupByBand(rows, DEFAULT_QUERY);

    expect(groups[0].partial).toBe(5);
    // `full` confidence is not counted as a floor.
    expect(groups[3].partial).toBe(0);
  });

  it('leads a preview with the thinnest market, not the first name', () => {
    // The default sort is by band, which says nothing once the rows are already
    // grouped by band. Four rows out of thirty-eight should be the four worth looking
    // at, so the fallback is thinnest first.
    const [critical] = groupByBand(rows, DEFAULT_QUERY);

    expect(critical.preview.map((item) => item.asset.code)).toEqual([
      'BBB',
      'CCC',
      'AAA',
      'DDD',
    ]);
  });

  it('keeps an ordering the reader chose', () => {
    const [critical] = groupByBand(rows, {
      ...DEFAULT_QUERY,
      sort: 'asset',
      dir: 'asc',
    });

    // Already sorted upstream; the section must not reorder it.
    expect(critical.preview.map((item) => item.asset.code)).toEqual([
      'AAA',
      'BBB',
      'CCC',
      'DDD',
    ]);
  });

  it('keeps a market with no measured depth out of the head of the preview', () => {
    const withUnmeasured = [
      row('ZZZ', 'CRITICAL', null),
      row('YYY', 'CRITICAL', '5'),
    ];

    const ordered = previewOrder(withUnmeasured, DEFAULT_QUERY);

    // An unmeasured depth is not a small one, in either direction.
    expect(ordered.map((item) => item.asset.code)).toEqual(['YYY', 'ZZZ']);
  });
});
