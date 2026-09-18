import {
  DEFAULT_HISTORY,
  HISTORY_RANGES,
  type HistoryRangeKey,
} from '../assets/history-range';
import type { Band, Flag } from '../format/flags';
import { dashboardPath } from '../routes';

/**
 * Filter and sort state for the monitored set, held in the URL.
 *
 * There is no client state store and no browser storage. Any view a reviewer sees has
 * to be shareable as a link, which means the query string is the state, and a filter
 * control is a real link wherever one will do.
 *
 * Unknown or malformed values are dropped rather than corrected, so a hand-edited URL
 * degrades to the unfiltered set instead of to a guess about what was meant.
 */

export const BANDS: readonly Band[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const FLAGS: readonly Flag[] = [
  'NO_EXECUTABLE_PRICE',
  'ZERO_DEPTH_2PCT',
  'MANIPULATION_CHEAP',
  'MANIPULATION_RATIO_LOW',
  'NO_GENUINE_TRADE_30D',
  'NO_GENUINE_TRADE_7D',
  'HOLDER_CONCENTRATION_EXTREME',
  'HOLDER_CONCENTRATION_HIGH',
  'THIN_DEPTH_5PCT',
  'WASH_TRADE_SUSPECTED',
  'SPREAD_EXTREME',
  'PRICE_SOURCE_CONFLICT',
];

/** Columns the table can be ordered by. */
export const SORT_KEYS = [
  'asset',
  'band',
  'depth',
  'collateral',
  'flags',
] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = 'asc' | 'desc';

export interface AssetQuery {
  readonly band: Band | null;
  readonly hasFlag: Flag | null;
  /** Free text matched against asset code and issuer. Not an API parameter. */
  readonly q: string;
  readonly sort: SortKey;
  readonly dir: SortDirection;
  /**
   * The window the overview's trend chart covers.
   *
   * It is in the URL for the same reason the panel is: a reviewer looking at a
   * seven-day slide in an asset's depth has to be able to send that exact chart. The
   * keys are the ones `HISTORY_RANGES` declares, so the windows offered here and on the
   * asset page cannot drift apart.
   */
  readonly range: HistoryRangeKey;
  /**
   * Which page of the table is shown, counting from one.
   *
   * The whole monitored set arrives in one response — sixty-one assets against a
   * contract maximum of two hundred — so this slices rows that are already in hand
   * rather than asking the engine for a page. That is not a shortcut: `/assets` has no
   * `sort` parameter, so ordering happens here, over the whole set. Paging on the
   * server would leave each sort describing only the rows that came back.
   */
  readonly page: number;
}

/**
 * Rows per page.
 *
 * It is the only number that decides paging: the page count, the clamp, the run of
 * page links and the tests all derive from it, so changing it here is the whole change.
 */
export const PAGE_SIZE = 8;

/**
 * Worst first. The monitored set is mostly CRITICAL, and opening on the safest assets
 * would bury the finding the product exists to surface.
 */
export const DEFAULT_QUERY: AssetQuery = {
  band: null,
  hasFlag: null,
  q: '',
  sort: 'band',
  dir: 'asc',
  range: DEFAULT_HISTORY.range,
  page: 1,
};

/** Next hands a param through as a string, an array, or nothing. */
export type RawParams = Record<string, string | string[] | undefined>;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function oneOf<T extends string>(
  raw: string | string[] | undefined,
  allowed: readonly T[],
): T | null {
  const value = first(raw);
  return value !== undefined && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export function parseAssetQuery(params: RawParams): AssetQuery {
  return {
    band: oneOf(params.band, BANDS),
    hasFlag: oneOf(params.hasFlag, FLAGS),
    q: (first(params.q) ?? '').trim().slice(0, 64),
    sort: oneOf(params.sort, SORT_KEYS) ?? DEFAULT_QUERY.sort,
    dir: oneOf(params.dir, ['asc', 'desc'] as const) ?? DEFAULT_QUERY.dir,
    range:
      oneOf(params.range, Object.keys(HISTORY_RANGES) as HistoryRangeKey[]) ??
      DEFAULT_QUERY.range,
    page: pageParam(params.page),
  };
}

/**
 * A page number, or the first page.
 *
 * Anything that is not a positive whole number is dropped rather than corrected, like
 * every other parameter here. A number PAST the end is not malformed and is not dropped
 * here — {@link paginate} clamps it against the row count it actually has, which this
 * parser cannot know.
 */
function pageParam(raw: string | string[] | undefined): number {
  const value = first(raw);
  if (value === undefined || !/^[1-9]\d{0,4}$/.test(value)) {
    return DEFAULT_QUERY.page;
  }
  return Number(value);
}

/**
 * Builds a link with one part of the state replaced. Only values that differ from the
 * default are written, so the shared URL says what was actually chosen.
 */
/**
 * Changing any of these changes WHICH rows there are, so the page number that went with
 * the old set no longer means anything and would often point past the end of the new
 * one. Ordering counts: page three of a table sorted by depth holds different assets
 * from page three of the same table sorted by name.
 *
 * `range` is deliberately absent. It changes the chart, not the rows.
 */
const RESETS_PAGING: readonly (keyof AssetQuery)[] = [
  'band',
  'hasFlag',
  'q',
  'sort',
  'dir',
];

export function assetHref(
  query: AssetQuery,
  patch: Partial<AssetQuery> = {},
): string {
  const resets =
    patch.page === undefined &&
    RESETS_PAGING.some((key) => key in patch && patch[key] !== query[key]);

  const next: AssetQuery = {
    ...query,
    ...patch,
    ...(resets ? { page: DEFAULT_QUERY.page } : {}),
  };
  const params = new URLSearchParams();

  if (next.band !== null) params.set('band', next.band);
  if (next.hasFlag !== null) params.set('hasFlag', next.hasFlag);
  if (next.q !== '') params.set('q', next.q);
  if (next.range !== DEFAULT_QUERY.range) params.set('range', next.range);
  if (next.page !== DEFAULT_QUERY.page) params.set('page', String(next.page));
  // The sort column is written whenever the direction is not the default, so a
  // shared link never reads `?dir=desc` with nothing saying what it orders.
  const dirDiffers = next.dir !== DEFAULT_QUERY.dir;
  if (next.sort !== DEFAULT_QUERY.sort || dirDiffers)
    params.set('sort', next.sort);
  if (dirDiffers) params.set('dir', next.dir);

  const search = params.toString();
  return dashboardPath(search);
}

/**
 * The link a column heading points at: the same column flips direction, a new column
 * starts ascending so the first click is predictable.
 */
export function sortHref(query: AssetQuery, key: SortKey): string {
  const dir: SortDirection =
    query.sort === key && query.dir === 'asc' ? 'desc' : 'asc';
  return assetHref(query, { sort: key, dir });
}

export function isFiltered(query: AssetQuery): boolean {
  return query.band !== null || query.hasFlag !== null || query.q !== '';
}

/** The link that changes the trend window, keeping everything else in place. */
export function rangeHref(query: AssetQuery, range: HistoryRangeKey): string {
  return assetHref(query, { range });
}

/** The link to another page of the table. */
export function pageHref(query: AssetQuery, page: number): string {
  return assetHref(query, { page });
}

/**
 * The page a reader can actually be shown, and the slice of rows on it.
 *
 * A page number out of range is clamped rather than treated as an error: it arrives
 * from a hand-edited URL, or from a link shared before a filter narrowed the set, and
 * answering an empty table to someone who asked for page nine of four is a worse answer
 * than showing them page four.
 */
export function paginate<T>(
  rows: readonly T[],
  page: number,
): {
  readonly page: number;
  readonly pageCount: number;
  readonly rows: readonly T[];
  readonly from: number;
  readonly to: number;
} {
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * PAGE_SIZE;

  return {
    page: current,
    pageCount,
    rows: rows.slice(start, start + PAGE_SIZE),
    // One-based and inclusive, for "showing 9 to 16 of 61".
    from: rows.length === 0 ? 0 : start + 1,
    to: Math.min(start + PAGE_SIZE, rows.length),
  };
}
