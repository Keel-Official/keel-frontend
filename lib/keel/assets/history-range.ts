import type { DataSource } from '../format/flags';
import { dashboardAssetPath } from '../routes';

/**
 * Everything the trend section asks the engine for, held in the URL like every other
 * view choice, so a reviewer can send someone the exact chart they are looking at.
 *
 * Stored coverage is as old as the deployment — days, not months — so the windows are
 * small on purpose. A ninety day tab would draw five days of data inside an axis
 * implying a quarter, which reads as broken data rather than as young data.
 */

export const HISTORY_RANGES = {
  '24h': { label: 'Last 24 hours', ledgers: 17_280 },
  '7d': { label: 'Last 7 days', ledgers: 120_960 },
  '30d': { label: 'Last 30 days', ledgers: 518_400 },
} as const;

export type HistoryRangeKey = keyof typeof HISTORY_RANGES;

export const HISTORY_RESOLUTIONS = {
  hour: 'Hourly',
  day: 'Daily',
} as const;

export type HistoryResolution = keyof typeof HISTORY_RESOLUTIONS;

/**
 * One request is one source, and the engine names it back in `dataSource`. Two sources
 * are never drawn as one line: `horizon` is a direct reading while the others are
 * reconstructions, and `trades-implied` is a lower bound rather than a measurement, so
 * averaging them would present the weakest number in the range as the same kind of
 * number as the strongest.
 */
export const HISTORY_SOURCES = {
  horizon: { label: 'Horizon', note: 'A direct reading' },
  hubble: { label: 'Hubble', note: 'A warehouse copy' },
  'offers-implied': {
    label: 'Offers implied',
    note: 'Rebuilt from offer events',
  },
  'trades-implied': {
    label: 'Trades implied',
    note: 'A lower bound, not a measurement',
  },
} as const satisfies Record<DataSource, { label: string; note: string }>;

/**
 * The measure an asset result's chart is drawn for. One chart at a time, chosen from a
 * row of tabs, so the page carries one full-size chart rather than four small ones;
 * the choice is in the URL like every other one here.
 */
export const HISTORY_METRICS = {
  depth: 'Buy-side depth',
  price: 'Price',
  cost: 'Cost to move',
  ceiling: 'Collateral ceiling',
} as const;

export type HistoryMetric = keyof typeof HISTORY_METRICS;

/**
 * The evidence behind an asset result, one tab at a time. Each used to be a section of
 * its own down a very long page; they are the detail a reader drills into once the
 * verdict at the top has told them where to look.
 */
export const ASSET_DETAILS = {
  depth: 'Depth',
  cost: 'Cost to move',
  collateral: 'Collateral',
  price: 'Price source',
  oracle: 'Oracle window',
  holders: 'Holders',
  notes: 'Engine notes',
  ledger: 'Past ledger',
} as const;

export type AssetDetail = keyof typeof ASSET_DETAILS;

export interface HistoryQuery {
  readonly range: HistoryRangeKey;
  readonly resolution: HistoryResolution;
  readonly source: DataSource;
  readonly metric: HistoryMetric;
  /**
   * Which evidence tab is open. Not about the series, but it rides in the same URL.
   * Null when the reader has not chosen, so the page can pick the tab that matters
   * most for what is on screen — the engine's notes, for a reconstructed reading.
   */
  readonly detail: AssetDetail | null;
}

/** The whole stored series fits inside seven days today, so that is what opens. */
export const DEFAULT_HISTORY: HistoryQuery = {
  range: '7d',
  resolution: 'hour',
  source: 'horizon',
  metric: 'depth',
  detail: null,
};

/**
 * The resolution a range can afford when a page of rows asks at once.
 *
 * One chart can carry an hourly week; eight rows cannot. Measured against the live API:
 * a seven day window is ~110 KB per asset hourly and ~5.3 KB daily, and the whole
 * audience shares sixty requests a minute because every read is made from the server.
 * A day is still eight points over a week and thirty over a month, which is a shape; an
 * hour over a day is twenty-four, which is also a shape. So the rule is per range.
 */
export function rowResolution(range: HistoryRangeKey): HistoryResolution {
  return range === '24h' ? 'hour' : 'day';
}

type Raw = string | string[] | undefined;

function one<T extends string>(raw: Raw, allowed: readonly T[]): T | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value !== undefined && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export function parseHistoryQuery(params: Record<string, Raw>): HistoryQuery {
  return {
    range:
      one(params.range, Object.keys(HISTORY_RANGES) as HistoryRangeKey[]) ??
      DEFAULT_HISTORY.range,
    resolution:
      one(
        params.resolution,
        Object.keys(HISTORY_RESOLUTIONS) as HistoryResolution[],
      ) ?? DEFAULT_HISTORY.resolution,
    source:
      one(params.source, Object.keys(HISTORY_SOURCES) as DataSource[]) ??
      DEFAULT_HISTORY.source,
    metric:
      one(params.metric, Object.keys(HISTORY_METRICS) as HistoryMetric[]) ??
      DEFAULT_HISTORY.metric,
    detail: one(params.detail, Object.keys(ASSET_DETAILS) as AssetDetail[]),
  };
}

/**
 * A link with one part of the view replaced, keeping the rest.
 *
 * `ledger` carries a past-ledger reading through, so switching an evidence tab while
 * reading ledger 61340262 stays on ledger 61340262. `hash` is where the link lands.
 */
export function historyHref(
  assetId: string,
  query: HistoryQuery,
  patch: Partial<HistoryQuery> = {},
  {
    ledger = null,
    hash = 'history',
  }: { ledger?: number | null; hash?: string } = {},
): string {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.range !== DEFAULT_HISTORY.range) params.set('range', next.range);
  if (next.resolution !== DEFAULT_HISTORY.resolution)
    params.set('resolution', next.resolution);
  if (next.source !== DEFAULT_HISTORY.source) params.set('source', next.source);
  if (next.metric !== DEFAULT_HISTORY.metric) params.set('metric', next.metric);
  if (next.detail !== null) params.set('detail', next.detail);
  if (ledger !== null) params.set('ledger', String(ledger));

  const search = params.toString();
  const base = dashboardAssetPath(assetId);
  return search === '' ? `${base}#${hash}` : `${base}?${search}#${hash}`;
}

/**
 * Stellar closes a ledger roughly every five seconds, so a window in time converts to a
 * ledger span. The engine refuses anything past ninety days itself, with a detail
 * naming both numbers; these are all inside that.
 */
export function ledgerWindow(
  latestLedger: number,
  query: Pick<HistoryQuery, 'range' | 'resolution'> & Partial<HistoryQuery>,
): { from: number; to: number; resolution: HistoryResolution } {
  const span = HISTORY_RANGES[query.range].ledgers;
  return {
    from: Math.max(1, latestLedger - span),
    to: latestLedger,
    resolution: query.resolution,
  };
}

/**
 * A source whose rows exist only where a replay stored them, rather than wherever the
 * scan has been running.
 *
 * WHY THE WINDOW DOES NOT APPLY TO THESE. The scan writes a `horizon` row every fifteen
 * minutes, so a window of hours or days lands on rows. A reconstruction is written by
 * `keel replay`, which has run at three ledgers in February 2026; the tip is about 3.2
 * million ledgers later and the engine caps one windowed request at 90 days, so no
 * window this dashboard offers can contain them. For these the series is asked for
 * without a window and the engine reports the range it answered with.
 */
export function isStoredRangeSource(source: DataSource): boolean {
  return source === 'offers-implied' || source === 'trades-implied';
}

/** `trades-implied` bounds from below; every figure drawn from it is a floor. */
export function isLowerBoundSource(source: DataSource): boolean {
  return source === 'trades-implied';
}
