import Decimal from 'decimal.js';
import daily from './api/february-evidence.json';

/**
 * The February USTRY/USDC backtest, as the `/backtest` page reads it.
 *
 * The reading's provenance is copied from the header of
 * `public/evidence/ustry-february-evidence.md`, the note the backend wrote when it
 * produced these rows; a change to one belongs in the other. Every figure below that
 * is not provenance is derived from the rows themselves, so the page cannot state a
 * total the data does not add up to.
 */
export const BACKTEST = {
  pair: {
    base: {
      code: 'USTRY',
      issuer: 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
    },
    quote: {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    },
  },
  windowFrom: '2026-02-01T00:00:00Z',
  windowTo: '2026-03-01T00:00:00Z',
  readOn: '2026-08-26',
  source: 'Horizon mainnet',
  incidentDay: '2026-02-22',
  command: [
    'go run ./cmd/keel backtest \\',
    '  -pairs scripts/record-pairs.example.json \\',
    '  -from 2026-02-01 -to 2026-03-01 -mark 2026-02-22 \\',
    '  -from-ledger 60977383 -out docs/evidences',
  ].join('\n'),
  /* Still read by `/backtest`, whose own download button serves this file. The landing
     section no longer links to it; the page that is about the record still does. */
  csvPath: '/evidence/ustry-february-daily.csv',
  notesPath: '/evidence/ustry-february-evidence.md',
} as const;

/** The rungs the engine measures, as the keys the rows carry them under. */
const RUNGS = ['0.02', '0.05', '0.1', '0.5'] as const;
type Rung = (typeof RUNGS)[number];
type Row = (typeof daily)[number];
type RowKey = keyof Row;

const field = (row: Row, key: string) => row[key as RowKey] as string | null;

/**
 * The widest rung a day's trades bound, and the bound itself. A bound at a wider
 * rung is the stronger statement, so it is the one worth showing; the narrower ones
 * are implied by it.
 */
function widestBound(row: Row, kind: 'within_leg' | 'between_legs') {
  for (const rung of [...RUNGS].reverse() as Rung[]) {
    const delta = field(row, `bound_${kind}_delta_${rung}`);
    if (delta === null) continue;
    return {
      rung,
      delta,
      source: field(row, `bound_${kind}_source_${rung}`),
      gapSeconds:
        kind === 'between_legs'
          ? field(row, `bound_between_legs_gap_seconds_${rung}`)
          : null,
    };
  }
  return null;
}

export type BacktestDay = ReturnType<typeof toDay>;

function toDay(row: Row) {
  return {
    day: row.day!,
    trades: row.trades!,
    volumeQuote: row.volume_quote!,
    priceOpen: row.price_open!,
    priceClose: row.price_close!,
    priceLow: row.price_low!,
    priceHigh: row.price_high!,
    /** Fractions, as the rows carry them. `null` is no observation, never zero. */
    maxWithinLeg: row.max_delta_within_leg,
    maxBetweenLegs: row.max_delta_between_legs,
    withinLegBound: widestBound(row, 'within_leg'),
    betweenLegsBound: widestBound(row, 'between_legs'),
    thinDepthBetweenLegs: row.thin_depth_5pct_between_legs === 'yes',
    manipulationCheapBetweenLegs: row.manipulation_cheap_between_legs === 'yes',
  };
}

export const BACKTEST_DAYS = daily.map(toDay);

function largest(values: (string | null)[]) {
  return values.reduce<string | null>(
    (max, value) =>
      value !== null && (max === null || new Decimal(value).gt(max))
        ? value
        : max,
    null,
  );
}

const largestWithinLeg = largest(BACKTEST_DAYS.map((day) => day.maxWithinLeg));

export const BACKTEST_SUMMARY = {
  days: BACKTEST_DAYS.length,
  trades: BACKTEST_DAYS.reduce(
    (total, day) => total.plus(day.trades),
    new Decimal(0),
  ).toFixed(),
  volumeQuote: BACKTEST_DAYS.reduce(
    (total, day) => total.plus(day.volumeQuote),
    new Decimal(0),
  ).toFixed(),
  largestWithinLeg,
  largestWithinLegDay:
    BACKTEST_DAYS.find((day) => day.maxWithinLeg === largestWithinLeg)?.day ??
    null,
  /** Days a single leg is known to have moved the price by a whole rung. */
  causalBoundDays: BACKTEST_DAYS.filter((day) => day.withinLegBound).length,
  /** Days with a bound that holds only if the book did not change between legs. */
  assumingBoundDays: BACKTEST_DAYS.filter((day) => day.betweenLegsBound),
  missingWithinLeg: BACKTEST_DAYS.filter((day) => day.maxWithinLeg === null)
    .length,
  smallestRung: RUNGS[0],
};
