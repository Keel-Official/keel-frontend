import { describe, expect, it } from 'vitest';

import type { AssetSummary } from '@/lib/api/types';
import { assetKey, filterByText, matchesText, sortAssets } from '@/lib/assets/list';
import {
  assetHref,
  DEFAULT_QUERY,
  isFiltered,
  parseAssetQuery,
  sortHref,
} from '@/lib/url/asset-query';

const ISSUER = 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC';

function asset(over: Partial<AssetSummary> & { code: string }): AssetSummary {
  const { code, ...rest } = over;
  return {
    asset: { code, type: 'credit_alphanum12', issuer: ISSUER },
    quote: { code: 'USDC', type: 'credit_alphanum4', issuer: 'GA5Z' },
    band: 'LOW',
    bandConfidence: 'partial',
    flags: [],
    ledgerSeq: 1,
    ...rest,
  } as AssetSummary;
}

describe('parseAssetQuery', () => {
  it('reads a well-formed query', () => {
    expect(
      parseAssetQuery({ band: 'CRITICAL', hasFlag: 'SPREAD_EXTREME', q: ' ustry ', sort: 'depth', dir: 'desc' }),
    ).toEqual({ band: 'CRITICAL', hasFlag: 'SPREAD_EXTREME', q: 'ustry', sort: 'depth', dir: 'desc' });
  });

  it('drops values that are not in the contract rather than guessing', () => {
    const parsed = parseAssetQuery({ band: 'EXTREME', hasFlag: 'MADE_UP', sort: 'price', dir: 'sideways' });
    expect(parsed.band).toBeNull();
    expect(parsed.hasFlag).toBeNull();
    expect(parsed.sort).toBe(DEFAULT_QUERY.sort);
    expect(parsed.dir).toBe(DEFAULT_QUERY.dir);
  });

  it('opens on the worst band first', () => {
    // The monitored set is mostly CRITICAL; opening on the safest assets would bury
    // the finding the product exists to surface.
    expect(DEFAULT_QUERY.sort).toBe('band');
    expect(DEFAULT_QUERY.dir).toBe('asc');
  });

  it('takes the first value when a param repeats, and caps free text', () => {
    expect(parseAssetQuery({ band: ['LOW', 'HIGH'] }).band).toBe('LOW');
    expect(parseAssetQuery({ q: 'x'.repeat(200) }).q).toHaveLength(64);
  });

  it('treats an empty query as unfiltered', () => {
    expect(isFiltered(parseAssetQuery({}))).toBe(false);
    expect(isFiltered(parseAssetQuery({ band: 'LOW' }))).toBe(true);
    expect(isFiltered(parseAssetQuery({ q: 'a' }))).toBe(true);
  });
});

describe('assetHref', () => {
  it('writes only what differs from the default, so a shared link says what was chosen', () => {
    expect(assetHref(DEFAULT_QUERY)).toBe('/');
    expect(assetHref(DEFAULT_QUERY, { band: 'HIGH' })).toBe('/?band=HIGH');
  });

  it('keeps the rest of the state when one part changes', () => {
    const query = parseAssetQuery({ band: 'HIGH', q: 'aqua' });
    expect(assetHref(query, { band: 'LOW' })).toBe('/?band=LOW&q=aqua');
  });

  it('clears filters without losing the ordering', () => {
    const query = parseAssetQuery({ band: 'HIGH', sort: 'depth', dir: 'desc' });
    expect(assetHref(query, { band: null, hasFlag: null, q: '' })).toBe(
      '/?sort=depth&dir=desc',
    );
  });
});

describe('sortHref', () => {
  it('flips direction on the active column', () => {
    const query = parseAssetQuery({ sort: 'depth', dir: 'asc' });
    expect(sortHref(query, 'depth')).toContain('dir=desc');
  });

  it('starts a new column ascending, so the first click is predictable', () => {
    const query = parseAssetQuery({ sort: 'depth', dir: 'desc' });
    expect(sortHref(query, 'collateral')).toBe('/?sort=collateral');
  });
});

describe('matchesText', () => {
  const item = asset({ code: 'USTRY' });

  it('matches on code and on issuer', () => {
    // The issuer is searchable because 97 distinct assets share the AQUA ticker.
    expect(matchesText(item, 'ustry')).toBe(true);
    expect(matchesText(item, 'GCRYUGD5')).toBe(true);
    expect(matchesText(item, 'usdc')).toBe(true);
  });

  it('does not match an unrelated string', () => {
    expect(matchesText(item, 'aqua')).toBe(false);
  });

  it('matches everything when the box is empty', () => {
    expect(matchesText(item, '')).toBe(true);
  });

  it('filters a list', () => {
    const items = [asset({ code: 'USTRY' }), asset({ code: 'AQUA' })];
    expect(filterByText(items, 'aqua').map((i) => i.asset.code)).toEqual(['AQUA']);
  });
});

describe('sortAssets', () => {
  it('orders bands worst first', () => {
    const items = [
      asset({ code: 'A', band: 'LOW' }),
      asset({ code: 'B', band: 'CRITICAL' }),
      asset({ code: 'C', band: 'MEDIUM' }),
    ];
    expect(sortAssets(items, 'band', 'asc').map((i) => i.band)).toEqual([
      'CRITICAL',
      'MEDIUM',
      'LOW',
    ]);
  });

  it('orders decimal columns exactly, not through a float', () => {
    const items = [
      asset({ code: 'A', maxSafeCollateral: '9007199254740992' }),
      asset({ code: 'B', maxSafeCollateral: '9007199254740993' }),
    ];
    expect(sortAssets(items, 'collateral', 'asc').map((i) => i.asset.code)).toEqual([
      'A',
      'B',
    ]);
  });

  it('keeps an unmeasured figure last in both directions', () => {
    // An asset whose ceiling could not be computed is not the safest in the table and
    // not the riskiest; sorting it to either end would state something the engine did
    // not.
    const items = [
      asset({ code: 'A', maxSafeCollateral: '100' }),
      asset({ code: 'B', maxSafeCollateral: null }),
      asset({ code: 'C', maxSafeCollateral: '5' }),
    ];
    expect(sortAssets(items, 'collateral', 'asc').map((i) => i.asset.code)).toEqual([
      'C',
      'A',
      'B',
    ]);
    expect(sortAssets(items, 'collateral', 'desc').map((i) => i.asset.code)).toEqual([
      'A',
      'C',
      'B',
    ]);
  });

  it('places a computed zero on the scale, above the unmeasured', () => {
    const items = [
      asset({ code: 'A', maxSafeCollateral: null }),
      asset({ code: 'B', maxSafeCollateral: '0' }),
    ];
    expect(sortAssets(items, 'collateral', 'asc').map((i) => i.asset.code)).toEqual([
      'B',
      'A',
    ]);
  });

  it('breaks ties on the asset id so the order is stable', () => {
    const items = [asset({ code: 'B', band: 'LOW' }), asset({ code: 'A', band: 'LOW' })];
    expect(sortAssets(items, 'band', 'asc').map((i) => i.asset.code)).toEqual(['A', 'B']);
  });
});

describe('assetKey', () => {
  it('is CODE:ISSUER, never the code alone', () => {
    expect(assetKey(asset({ code: 'AQUA' }))).toBe(`AQUA:${ISSUER}`);
  });

  it('is the bare code for the native asset', () => {
    const native = asset({ code: 'XLM' });
    expect(
      assetKey({ ...native, asset: { code: 'XLM', type: 'native', issuer: null } }),
    ).toBe('XLM');
  });
});
