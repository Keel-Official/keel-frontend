import { describe, expect, it } from 'vitest';

import { byValue, compareDecimalStrings, compareValues } from '../lib/format/compare';
import { classify } from '../lib/format/value';

const sign = (n: number): number => (n === 0 ? 0 : n > 0 ? 1 : -1);

describe('compareDecimalStrings', () => {
  it('orders by magnitude when the integer parts differ in length', () => {
    expect(sign(compareDecimalStrings('9', '100'))).toBe(-1);
    expect(sign(compareDecimalStrings('1000', '999.9'))).toBe(1);
  });

  it('ignores leading zeros', () => {
    expect(compareDecimalStrings('007', '7')).toBe(0);
    expect(sign(compareDecimalStrings('007', '8'))).toBe(-1);
  });

  it('treats trailing fraction zeros as the same value', () => {
    expect(compareDecimalStrings('1.5', '1.50')).toBe(0);
    expect(compareDecimalStrings('1.5', '1.500000000000')).toBe(0);
    expect(compareDecimalStrings('0', '0.0000000')).toBe(0);
  });

  it('pads fractions so digit positions line up', () => {
    expect(sign(compareDecimalStrings('1.5', '1.45'))).toBe(1);
    expect(sign(compareDecimalStrings('0.1', '0.0999999'))).toBe(1);
  });

  it('separates values a double would collapse', () => {
    // Both of these land on the same IEEE-754 double, which is the whole reason the
    // engine serves decimal strings and this comparator does not convert. The
    // comparison below is exact, and a float-based sort would call them equal.
    const a = '158493.937041927835527438180617150479700224505053101718';
    const b = '158493.937041927835527438180617150479700224505053101719';
    expect(sign(compareDecimalStrings(a, b))).toBe(-1);

    // 2^53 and 2^53 + 1 are the textbook pair that a double cannot tell apart.
    expect(sign(compareDecimalStrings('9007199254740992', '9007199254740993'))).toBe(-1);
  });

  it('handles very long values without losing the low digits', () => {
    const base = `1.${'0'.repeat(40)}`;
    expect(sign(compareDecimalStrings(`${base}1`, `${base}2`))).toBe(-1);
    expect(compareDecimalStrings(`${base}1`, `${base}1`)).toBe(0);
  });

  it('orders negatives below positives', () => {
    expect(sign(compareDecimalStrings('-1', '1'))).toBe(-1);
    expect(sign(compareDecimalStrings('-1', '-2'))).toBe(1);
    expect(sign(compareDecimalStrings('-0.5', '0'))).toBe(-1);
  });

  it('treats negative zero as zero rather than letting the sign decide', () => {
    expect(compareDecimalStrings('-0', '0')).toBe(0);
    expect(compareDecimalStrings('-0.000', '0.0')).toBe(0);
  });

  it('is a consistent ordering when used to sort', () => {
    const input = ['10', '9.5', '0', '100.25', '9.50', '-3'];
    const sorted = [...input].sort(compareDecimalStrings);
    expect(sorted).toEqual(['-3', '0', '9.5', '9.50', '10', '100.25']);
  });
});

describe('compareValues', () => {
  it('sorts values the engine did not produce to the end', () => {
    expect(sign(compareValues(classify(null), classify('1')))).toBe(1);
    expect(sign(compareValues(classify(undefined), classify('1')))).toBe(1);
    expect(sign(compareValues(classify('1'), classify(null)))).toBe(-1);
  });

  it('treats two unmeasured values as equal', () => {
    expect(compareValues(classify(null), classify(undefined))).toBe(0);
  });

  it('places a computed zero on the scale, not with the unmeasured', () => {
    // A collateral ceiling of zero is a finding about the asset and belongs in the
    // ordering; one that could not be computed does not.
    expect(sign(compareValues(classify('0'), classify('5')))).toBe(-1);
    expect(sign(compareValues(classify('0'), classify(null)))).toBe(-1);
  });
});

describe('byValue', () => {
  it('reverses measured values but keeps unmeasured ones last in both directions', () => {
    const values = [classify('5'), classify(null), classify('1')];

    const ascending = [...values].sort(byValue('asc')).map((v) => v.exact);
    expect(ascending).toEqual(['1', '5', null]);

    const descending = [...values].sort(byValue('desc')).map((v) => v.exact);
    expect(descending).toEqual(['5', '1', null]);
  });

  it('does not make an unmeasured value the safest or the riskiest asset', () => {
    const sorted = [classify(null), classify('0'), classify('999')]
      .sort(byValue('asc'))
      .map((v) => v.state);
    expect(sorted[sorted.length - 1]).toBe('unknown');
  });
});
