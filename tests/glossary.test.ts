import { describe, expect, it } from 'vitest';

import { FLAG_COPY, TERMS, flagCopy } from '../lib/keel/format/glossary';
import { pageNumbers } from '../components/dashboard/pagination';
import {
  DEFAULT_QUERY,
  FLAGS,
  PAGE_SIZE,
  assetHref,
  paginate,
  parseAssetQuery,
  sortHref,
} from '../lib/keel/url/asset-query';

/**
 * The plain-language layer, and the two rules that keep it from becoming a second
 * source of truth.
 *
 * Copy is usually not worth a test. This copy is, because it sits next to figures the
 * engine owns and the failure mode is silent: a sentence that names a threshold reads
 * perfectly and goes stale the moment the engine is redeployed, and nothing in the
 * build would notice.
 */

describe('flag copy', () => {
  it('covers every flag the contract declares', () => {
    for (const flag of FLAGS) {
      expect(flagCopy(flag)).toBeDefined();
      expect(flagCopy(flag).label.length).toBeGreaterThan(0);
      expect(flagCopy(flag).meaning.length).toBeGreaterThan(0);
    }
    expect(Object.keys(FLAG_COPY).sort()).toEqual([...FLAGS].sort());
  });

  it('never writes a threshold into the wording', () => {
    // `GET /methodology` serves nineteen thresholds and they move without a major
    // version bump. A sentence that quotes one is a copy of served data that no
    // deployment will ever update, so the numbers stay out and the KEY is named instead.
    for (const flag of FLAGS) {
      const { label, meaning } = flagCopy(flag);
      // The rung names in "Thin depth at 5%" and "within 2%" are contract enum values
      // on `DepthPoint.delta`, not thresholds, so they are allowed and nothing else is.
      const withoutRungs = `${label} ${meaning}`.replace(/\b(2|5|10)%/g, '');
      expect(withoutRungs).not.toMatch(/\d{3,}/);
      expect(withoutRungs).not.toMatch(/\bUSDC\b/);
    }
  });

  it('names a threshold key the methodology actually serves, or none at all', () => {
    // Every key here appeared in a live `GET /methodology` response. A typo would
    // otherwise surface as a silently missing figure wherever one is interpolated.
    const served = new Set([
      'genuineTradeStaleDays',
      'genuineTradeWarnDays',
      'holderTop10HighPct',
      'holderTop1ExtremePct',
      'liquidationDelta',
      'liquidationHaircut',
      'manipulationCheapAbsolute',
      'manipulationCheapUnit',
      'manipulationCriticalDelta',
      'manipulationMargin',
      'manipulationRatioLowPct',
      'oracleWindowSeconds',
      'priceDivergencePct',
      'spreadExtremePct',
      'thinDepth5PctAbsolute',
      'thinDepth5PctUnit',
      'washTradeSuspectedPct',
    ]);

    for (const flag of FLAGS) {
      const key = flagCopy(flag).thresholdKey;
      if (key !== null) expect(served).toContain(key);
    }
  });

  it('assigns no severity, because the API publishes none per flag', () => {
    // `band` is the worst LEVEL that fired, but the contract never says which level a
    // given flag sits at. Ranking them here would be inventing methodology.
    for (const flag of FLAGS) {
      expect(Object.keys(flagCopy(flag)).sort()).toEqual([
        'label',
        'meaning',
        'thresholdKey',
      ]);
    }
  });

  it('leads with words rather than the enum value', () => {
    for (const flag of FLAGS) {
      expect(flagCopy(flag).label).not.toBe(flag);
      expect(flagCopy(flag).label).not.toMatch(/_/);
    }
  });
});

describe('term definitions', () => {
  it('says what partial confidence means for how far to trust a band', () => {
    // The single sentence a reader needs in order not to misread a LOW. It is the
    // state of every monitored asset today, so it can never be quietly dropped.
    expect(TERMS.partial.definition).toMatch(/worse/i);
    expect(TERMS.confidence.definition).toMatch(/floor|worse/i);
  });

  it('keeps every definition to something a newcomer will finish reading', () => {
    for (const [key, term] of Object.entries(TERMS)) {
      expect(term.term.length, key).toBeGreaterThan(0);
      expect(term.definition.length, key).toBeGreaterThan(20);
      expect(term.definition.length, key).toBeLessThan(320);
    }
  });
});

describe('the view is the URL', () => {
  it('writes nothing when nothing is chosen, so a shared link stays clean', () => {
    expect(assetHref(DEFAULT_QUERY)).toBe('/dashboard');
  });

  it('carries the filters and the ordering through a change to one of them', () => {
    const query = parseAssetQuery({
      band: 'CRITICAL',
      sort: 'depth',
      dir: 'desc',
    });
    const href = assetHref(query, { q: 'usd' });
    expect(href).toContain('band=CRITICAL');
    expect(href).toContain('sort=depth');
    expect(href).toContain('dir=desc');
    expect(href).toContain('q=usd');
  });

  it('flips the direction on the column already sorted, and starts fresh on another', () => {
    const byDepth = parseAssetQuery({ sort: 'depth', dir: 'asc' });
    expect(sortHref(byDepth, 'depth')).toContain('dir=desc');
    expect(sortHref(byDepth, 'collateral')).not.toContain('dir=desc');
  });

  it('drops a malformed value rather than correcting it', () => {
    // A hand-edited URL degrades to the unfiltered set instead of to a guess about
    // what was meant.
    expect(parseAssetQuery({ band: 'CATASTROPHIC' }).band).toBeNull();
    expect(parseAssetQuery({ sort: 'issuer' }).sort).toBe(DEFAULT_QUERY.sort);
    expect(parseAssetQuery({ range: '5y' }).range).toBe(DEFAULT_QUERY.range);
  });

  it('keeps the trend window when a filter changes', () => {
    // The window is about the chart, not about which rows there are.
    const query = parseAssetQuery({ range: '24h' });
    expect(assetHref(query, { band: 'HIGH' })).toContain('range=24h');
  });
});

describe('paging the table', () => {
  // The size of the live monitored set. Nothing below hardcodes a page size or a page
  // count: both are derived, so changing PAGE_SIZE is a one-line change rather than a
  // one-line change plus a broken suite.
  const TOTAL = 61;
  const rows = Array.from({ length: TOTAL }, (_, i) => i);
  const lastPage = Math.ceil(TOTAL / PAGE_SIZE);
  const onLastPage = TOTAL - (lastPage - 1) * PAGE_SIZE;

  it('slices the set the reader asked for', () => {
    const first = paginate(rows, 1);
    expect(first.page).toBe(1);
    expect(first.pageCount).toBe(lastPage);
    expect(first.rows).toHaveLength(PAGE_SIZE);
    expect(first.from).toBe(1);
    expect(first.to).toBe(PAGE_SIZE);

    const last = paginate(rows, lastPage);
    expect(last.rows).toHaveLength(onLastPage);
    expect(last.to).toBe(TOTAL);
  });

  it('covers every row exactly once across all pages', () => {
    const seen: number[] = [];
    for (let n = 1; n <= lastPage; n += 1) seen.push(...paginate(rows, n).rows);
    expect(seen).toEqual(rows);
  });

  it('clamps a page past the end rather than showing an empty table', () => {
    const beyond = paginate(rows, 99);
    expect(beyond.page).toBe(lastPage);
    expect(beyond.rows).toHaveLength(onLastPage);
  });

  it('survives an empty set', () => {
    const none = paginate([], 3);
    expect(none.page).toBe(1);
    expect(none.pageCount).toBe(1);
    expect(none.from).toBe(0);
    expect(none.to).toBe(0);
  });

  it('drops a malformed page number instead of correcting it', () => {
    expect(parseAssetQuery({ page: '0' }).page).toBe(1);
    expect(parseAssetQuery({ page: '-2' }).page).toBe(1);
    expect(parseAssetQuery({ page: 'two' }).page).toBe(1);
    expect(parseAssetQuery({ page: '3' }).page).toBe(3);
  });

  it('writes nothing for the first page, so a shared link stays clean', () => {
    expect(assetHref({ ...DEFAULT_QUERY, page: 1 })).toBe('/dashboard');
    expect(assetHref({ ...DEFAULT_QUERY, page: 3 })).toBe('/dashboard?page=3');
  });

  it('returns to the first page when the set of rows changes', () => {
    // Page three of a table sorted by depth holds different assets from page three of
    // the same table sorted by name, and a filter can leave fewer pages than there
    // were. Keeping the old number would land the reader past the end.
    const onPageThree = { ...DEFAULT_QUERY, page: 3 };
    expect(assetHref(onPageThree, { band: 'CRITICAL' })).not.toContain('page=');
    expect(assetHref(onPageThree, { sort: 'depth' })).not.toContain('page=');
    expect(assetHref(onPageThree, { q: 'usd' })).not.toContain('page=');
    expect(sortHref(onPageThree, 'collateral')).not.toContain('page=');
  });

  it('stays on the page when only the chart window changes', () => {
    const onPageThree = { ...DEFAULT_QUERY, page: 3 };
    expect(assetHref(onPageThree, { range: '24h' })).toContain('page=3');
  });

  it('keeps the page when a control is re-selected with the value it already had', () => {
    const onPageThree = {
      ...DEFAULT_QUERY,
      band: 'CRITICAL' as const,
      page: 3,
    };
    expect(assetHref(onPageThree, { band: 'CRITICAL' })).toContain('page=3');
  });
});

describe('the run of page numbers', () => {
  it('offers a run at each end, so the last page is always one click away', () => {
    expect(pageNumbers(1, 8)).toEqual([1, 2, 3, null, 6, 7, 8]);
    expect(pageNumbers(8, 8)).toEqual([1, 2, 3, null, 6, 7, 8]);
  });

  it('shows every page once the runs meet', () => {
    expect(pageNumbers(4, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(pageNumbers(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('keeps the current page and its neighbours in a long set', () => {
    expect(pageNumbers(10, 20)).toEqual([
      1,
      2,
      3,
      null,
      9,
      10,
      11,
      null,
      18,
      19,
      20,
    ]);
  });

  it('prints a single missing number rather than eliding it', () => {
    // "3 … 5" is no shorter than "3 4 5" and costs the reader a click.
    expect(pageNumbers(5, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('never repeats a page', () => {
    for (let page = 1; page <= 20; page += 1) {
      const run = pageNumbers(page, 20).filter((n) => n !== null);
      expect(new Set(run).size).toBe(run.length);
    }
  });

  it('handles a single page', () => {
    expect(pageNumbers(1, 1)).toEqual([1]);
  });
});
