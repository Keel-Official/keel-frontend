import { describe, expect, it } from 'vitest';

import { classify, classifyCount, isMeasured, isZeroString } from '../lib/format/value';

describe('classify', () => {
  it('separates absent from unknown', () => {
    expect(classify(undefined).state).toBe('absent');
    expect(classify(null).state).toBe('unknown');
  });

  it('treats a computed zero as a finding, not as a missing value', () => {
    // maxSafeCollateral "0" means the engine computed zero; null means it could not
    // compute. The broken-book and no-price examples send exactly this pair.
    expect(classify('0').state).toBe('zero');
    expect(classify('0.0000000').state).toBe('zero');
    expect(classify(null).state).toBe('unknown');
  });

  it('keeps the served string exactly', () => {
    const exact = '158493.937041927835527438180617150479700224505053101718';
    expect(classify(exact).exact).toBe(exact);
  });

  it('carries the quote unit, because a bare figure is ambiguous', () => {
    expect(classify('12.5', 'USDC').unit).toBe('USDC');
    expect(classify('12.5').unit).toBeNull();
  });

  it('refuses a value that is not a plain decimal rather than guessing', () => {
    expect(classify('1e5').state).toBe('unknown');
    expect(classify('abc').state).toBe('unknown');
    expect(classify('').state).toBe('unknown');
    expect(classify('1.2.3').state).toBe('unknown');
    expect(classify('1e5').exact).toBeNull();
  });

  it('accepts a negative decimal', () => {
    expect(classify('-4.25').state).toBe('present');
    expect(classify('-0.0').state).toBe('zero');
  });
});

describe('isZeroString', () => {
  it('recognises every spelling of zero the engine may send', () => {
    for (const zero of ['0', '0.0', '0.0000000', '00', '-0', '-0.000']) {
      expect(isZeroString(zero), zero).toBe(true);
    }
  });

  it('does not treat a small figure as zero', () => {
    for (const nonZero of ['0.0000001', '1', '0.1', '-0.0001']) {
      expect(isZeroString(nonZero), nonZero).toBe(false);
    }
  });
});

describe('isMeasured', () => {
  it('is true for a figure and for a computed zero', () => {
    expect(isMeasured(classify('12'))).toBe(true);
    expect(isMeasured(classify('0'))).toBe(true);
  });

  it('is false when the engine produced nothing', () => {
    expect(isMeasured(classify(null))).toBe(false);
    expect(isMeasured(classify(undefined))).toBe(false);
  });
});

describe('classifyCount', () => {
  it('handles integer fields, which arrive as JSON numbers by contract', () => {
    expect(classifyCount(64457447)).toEqual({
      state: 'present',
      exact: '64457447',
      unit: null,
    });
    expect(classifyCount(0).state).toBe('zero');
    expect(classifyCount(null).state).toBe('unknown');
    expect(classifyCount(undefined).state).toBe('absent');
  });
});
