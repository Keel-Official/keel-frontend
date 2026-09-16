import { describe, expect, it } from 'vitest';

import {
  assetId,
  formatDecimal,
  truncateIssuer,
  withUnit,
} from '../lib/format/decimal';

describe('formatDecimal', () => {
  it('groups the integer part and leaves the fraction alone', () => {
    expect(formatDecimal('1234567.89').display).toBe('1,234,567.89');
    expect(formatDecimal('100').display).toBe('100');
    expect(formatDecimal('1000').display).toBe('1,000');
    expect(formatDecimal('999').display).toBe('999');
  });

  it('can be asked not to group', () => {
    expect(formatDecimal('1234567.89', { group: false }).display).toBe('1234567.89');
  });

  it('returns the served string untouched as exact', () => {
    const exact = '158493.937041927835527438180617150479700224505053101718';
    const result = formatDecimal(exact, { maxFractionDigits: 2 });
    expect(result.exact).toBe(exact);
  });

  it('truncates rather than rounds, and says that it did', () => {
    // 0.999 to two places is 0.99, not 1.00. Rounding would carry, which is
    // arithmetic, and on a cost figure it would show more than the engine computed.
    const result = formatDecimal('0.999', { maxFractionDigits: 2 });
    expect(result.display).toBe('0.99');
    expect(result.truncated).toBe(true);
  });

  it('does not claim truncation when nothing was dropped', () => {
    expect(formatDecimal('1.5', { maxFractionDigits: 4 }).truncated).toBe(false);
    expect(formatDecimal('1.5', { maxFractionDigits: 1 }).truncated).toBe(false);
    expect(formatDecimal('12', { maxFractionDigits: 2 }).truncated).toBe(false);
  });

  it('can drop the fraction entirely', () => {
    const result = formatDecimal('1234.5678', { maxFractionDigits: 0 });
    expect(result.display).toBe('1,234');
    expect(result.truncated).toBe(true);
  });

  it('keeps a served zero legible without turning it into something else', () => {
    expect(formatDecimal('0.0000000').display).toBe('0.0000000');
    expect(formatDecimal('0').display).toBe('0');
  });

  it('handles negatives without misplacing the sign', () => {
    expect(formatDecimal('-1234.5').display).toBe('-1,234.5');
    expect(formatDecimal('-1234.5678', { maxFractionDigits: 2 }).display).toBe('-1,234.56');
  });

  it('handles a 48 digit fraction, which is what the live API sends', () => {
    const exact = '158493.937041927835527438180617150479700224505053101718';
    expect(formatDecimal(exact, { maxFractionDigits: 4 }).display).toBe('158,493.9370');
  });
});

describe('withUnit', () => {
  it('names the quote asset, because a bare figure is ambiguous', () => {
    expect(withUnit('1,234.50', 'USDC')).toBe('1,234.50 USDC');
  });

  it('omits the unit when there is none to state', () => {
    expect(withUnit('1,234.50', null)).toBe('1,234.50');
  });
});

describe('truncateIssuer', () => {
  const issuer = 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC';

  it('truncates in the middle so both ends stay comparable by eye', () => {
    expect(truncateIssuer(issuer)).toBe('GCRY…MYWC');
    expect(issuer).toHaveLength(56);
  });

  it('leaves a short value alone', () => {
    expect(truncateIssuer('GCRY')).toBe('GCRY');
  });
});

describe('assetId', () => {
  it('builds CODE:ISSUER, never matching on the code alone', () => {
    // 97 distinct assets share the AQUA ticker.
    expect(assetId('AQUA', 'GBNZ')).toBe('AQUA:GBNZ');
  });

  it('uses the bare code for the native asset', () => {
    expect(assetId('XLM', null)).toBe('XLM');
  });
});
