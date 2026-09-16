import { describe, expect, it } from 'vitest';

import {
  assessFlags,
  compareBands,
  isDirectReading,
  isLowerBound,
  isPass,
  type Band,
} from '../lib/format/flags';

describe('assessFlags', () => {
  it('is a pass only when nothing fired and everything was measured', () => {
    const assessment = assessFlags([], []);
    expect(assessment.kind).toBe('clear');
    expect(isPass(assessment)).toBe(true);
  });

  it('is not a pass when checks could not run', () => {
    // Live XLM on 16 September 2026: band LOW, no triggered flags, six unevaluated.
    const assessment = assessFlags(
      [],
      [
        'MANIPULATION_RATIO_LOW',
        'NO_GENUINE_TRADE_30D',
        'HOLDER_CONCENTRATION_EXTREME',
        'NO_GENUINE_TRADE_7D',
        'HOLDER_CONCENTRATION_HIGH',
        'WASH_TRADE_SUSPECTED',
      ],
    );
    expect(assessment.kind).toBe('incomplete');
    expect(isPass(assessment)).toBe(false);
  });

  it('reports triggered when something fired', () => {
    const assessment = assessFlags(['SPREAD_EXTREME'], ['WASH_TRADE_SUSPECTED']);
    expect(assessment.kind).toBe('triggered');
    expect(isPass(assessment)).toBe(false);
  });

  it('keeps the two groups separate rather than merging them', () => {
    const assessment = assessFlags(['SPREAD_EXTREME'], ['WASH_TRADE_SUSPECTED']);
    expect(assessment.triggered).toEqual(['SPREAD_EXTREME']);
    expect(assessment.unevaluated).toEqual(['WASH_TRADE_SUSPECTED']);
  });
});

describe('data source', () => {
  it('marks trades-implied as a lower bound rather than a measurement', () => {
    expect(isLowerBound('trades-implied')).toBe(true);
    expect(isLowerBound('horizon')).toBe(false);
    expect(isLowerBound('hubble')).toBe(false);
    expect(isLowerBound('offers-implied')).toBe(false);
  });

  it('treats only horizon as a direct reading', () => {
    expect(isDirectReading('horizon')).toBe(true);
    for (const source of ['hubble', 'offers-implied', 'trades-implied'] as const) {
      expect(isDirectReading(source), source).toBe(false);
    }
  });
});

describe('compareBands', () => {
  it('orders worst first', () => {
    const bands: Band[] = ['LOW', 'CRITICAL', 'MEDIUM', 'HIGH'];
    expect([...bands].sort(compareBands)).toEqual(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
  });

  it('is zero for the same band', () => {
    expect(compareBands('LOW', 'LOW')).toBe(0);
  });
});
