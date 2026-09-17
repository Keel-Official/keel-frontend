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
}

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
  };
}

/**
 * Builds a link with one part of the state replaced. Only values that differ from the
 * default are written, so the shared URL says what was actually chosen.
 */
export function assetHref(
  query: AssetQuery,
  patch: Partial<AssetQuery> = {},
): string {
  const next: AssetQuery = { ...query, ...patch };
  const params = new URLSearchParams();

  if (next.band !== null) params.set('band', next.band);
  if (next.hasFlag !== null) params.set('hasFlag', next.hasFlag);
  if (next.q !== '') params.set('q', next.q);
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
