import type { DataSource } from '../format/flags';

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
  'offers-implied': { label: 'Offers implied', note: 'Rebuilt from offer events' },
  'trades-implied': {
    label: 'Trades implied',
    note: 'A lower bound, not a measurement',
  },
} as const satisfies Record<DataSource, { label: string; note: string }>;

export interface HistoryQuery {
  readonly range: HistoryRangeKey;
  readonly resolution: HistoryResolution;
  readonly source: DataSource;
}

/** The whole stored series fits inside seven days today, so that is what opens. */
export const DEFAULT_HISTORY: HistoryQuery = {
  range: '7d',
  resolution: 'hour',
  source: 'horizon',
};

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
      one(params.resolution, Object.keys(HISTORY_RESOLUTIONS) as HistoryResolution[]) ??
      DEFAULT_HISTORY.resolution,
    source:
      one(params.source, Object.keys(HISTORY_SOURCES) as DataSource[]) ??
      DEFAULT_HISTORY.source,
  };
}

/** A link with one part of the trend query replaced, keeping the rest. */
export function historyHref(
  assetId: string,
  query: HistoryQuery,
  patch: Partial<HistoryQuery> = {},
): string {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.range !== DEFAULT_HISTORY.range) params.set('range', next.range);
  if (next.resolution !== DEFAULT_HISTORY.resolution)
    params.set('resolution', next.resolution);
  if (next.source !== DEFAULT_HISTORY.source) params.set('source', next.source);

  const search = params.toString();
  const base = `/asset/${encodeURIComponent(assetId)}`;
  return search === '' ? `${base}#history` : `${base}?${search}#history`;
}

/**
 * Stellar closes a ledger roughly every five seconds, so a window in time converts to a
 * ledger span. The engine refuses anything past ninety days itself, with a detail
 * naming both numbers; these are all inside that.
 */
export function ledgerWindow(
  latestLedger: number,
  query: HistoryQuery,
): { from: number; to: number; resolution: HistoryResolution } {
  const span = HISTORY_RANGES[query.range].ledgers;
  return {
    from: Math.max(1, latestLedger - span),
    to: latestLedger,
    resolution: query.resolution,
  };
}

/** `trades-implied` bounds from below; every figure drawn from it is a floor. */
export function isLowerBoundSource(source: DataSource): boolean {
  return source === 'trades-implied';
}
