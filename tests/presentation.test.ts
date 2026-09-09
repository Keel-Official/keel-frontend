import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  sourceContribution,
  manipulationLabel,
  splitHistory,
} from '../lib/format/keel';
import history from '../public/evidence/history-ustry.json';

describe('exact financial presentation', () => {
  it('preserves amounts beyond floating point precision', () => {
    expect(formatAmount('9007199254740993.1234567')).toBe(
      '9,007,199,254,740,993.1234567',
    );
    expect(formatAmount('0.0000001')).toBe('0.0000001');
    expect(formatAmount('441038.9920700')).toBe('441,038.99207');
  });
  it('keeps zero distinct from unavailable', () => {
    expect(formatAmount('0.0000000')).toBe('0');
    expect(formatAmount(null)).toBe('Not available');
  });
  it('derives source shares without inventing liquidity for zero totals', () => {
    expect(sourceContribution('0', '0')).toBeNull();
    expect(sourceContribution('0', '2710.991')).toEqual({
      sdex: '0',
      amm: '100',
    });
    expect(sourceContribution('337920.1180600', '103118.8740100')).toEqual({
      sdex: '76.6',
      amm: '23.4',
    });
  });
  it.each([
    ['0', true, 'Reachable at zero cost'],
    ['0', false, 'Not reachable; no liquidity'],
    ['130.0627093', false, 'Not reachable; book exhausted'],
    ['130.0627093', true, 'Reachable'],
  ])('interprets cost %s with reachability %s', (cost, reachable, label) => {
    expect(manipulationLabel(cost as string, reachable as boolean)).toBe(label);
  });
  it('never connects a series across a declared ledger gap', () => {
    const segments = splitHistory(history.points, history.gaps);
    expect(
      segments.map((segment) => segment.map((point) => point.ledgerSeq)),
    ).toEqual([[60890120], [60912345, 60934000]]);
    expect(segments.flat()).toEqual(history.points);
  });
});
