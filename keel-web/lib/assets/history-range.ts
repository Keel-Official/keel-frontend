/**
 * The window the trend chart asks for, held in the URL like every other view choice.
 *
 * Stored coverage is as old as the deployment — days, not months — so the choices are
 * small on purpose. A ninety day tab would draw five days of data inside an axis
 * implying a quarter, which reads as broken data rather than as young data.
 *
 * Both windows use hourly resolution. Daily over this range returns about six points,
 * which is a shape rather than a series.
 */
export const HISTORY_RANGES = {
  '24h': { label: 'Last 24 hours', ledgers: 17_280 },
  '7d': { label: 'Last 7 days', ledgers: 120_960 },
} as const;

export type HistoryRangeKey = keyof typeof HISTORY_RANGES;

/** The whole stored series fits inside this, so it is what the page opens on. */
export const DEFAULT_RANGE: HistoryRangeKey = '7d';

export function isHistoryRange(value: string | undefined): value is HistoryRangeKey {
  return value !== undefined && Object.hasOwn(HISTORY_RANGES, value);
}

export function parseHistoryRange(raw: string | string[] | undefined): HistoryRangeKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isHistoryRange(value) ? value : DEFAULT_RANGE;
}

/**
 * Stellar closes a ledger roughly every five seconds, so a window in hours converts to
 * a ledger span. The engine clamps anything past ninety days itself; these are far
 * inside that.
 */
export function ledgerWindow(
  latestLedger: number,
  range: HistoryRangeKey,
): { from: number; to: number; resolution: 'hour' } {
  const span = HISTORY_RANGES[range].ledgers;
  return { from: Math.max(1, latestLedger - span), to: latestLedger, resolution: 'hour' };
}
