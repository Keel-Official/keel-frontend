import type { AssetRisk, PairSummary } from '@/lib/keel/api/types';
import { classify } from '@/lib/keel/format/value';

import type { FigureRow } from './figure-list';

/**
 * Figure rows for the parts of an asset result the detail view had been leaving on the
 * wire: where the price came from, which pair set the band, and what the oracle window
 * adds to the cost of an attack.
 *
 * Every value goes through `classify`, so a key the response did not carry, a key the
 * engine sent as null, and a computed zero stay three different things on screen. No
 * arithmetic is done on a served decimal; the only conversion here is a `delta`, which
 * the contract sends as a JSON number, written as a percentage for reading.
 */

const PRICE_SOURCE_LABEL: Record<AssetRisk['priceSource'], string> = {
  book: 'Order book mid',
  pool: 'AMM pool spot price, because the book and the pool disagree or the book is one-sided',
  none: 'No executable price: this is a finding, not an error',
};

/** 0.02 → "2%", 0.5 → "50%", without the float noise 0.07 * 100 carries. */
export function deltaPercent(delta: number): string {
  return `${Number((delta * 100).toPrecision(12))}%`;
}

/** 900 → "900 seconds (15 minutes)". */
export function windowLabel(seconds: number): string {
  if (seconds > 0 && seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${seconds} seconds (${minutes} ${minutes === 1 ? 'minute' : 'minutes'})`;
  }
  return `${seconds} seconds`;
}

function pairLine(pair: PairSummary): string {
  return `${pair.quote.code}: ${pair.band} (${pair.bandConfidence} confidence)`;
}

export function priceRows(risk: AssetRisk): FigureRow[] {
  const quote = risk.quote.code;
  const pairs = risk.pairsEvaluated;

  return [
    {
      key: 'mid',
      label: 'Price used',
      value: classify(risk.midPrice, quote),
      maxFractionDigits: 8,
      note: PRICE_SOURCE_LABEL[risk.priceSource],
    },
    {
      key: 'poolSpot',
      label: 'AMM pool spot price',
      value: classify(risk.poolSpotPrice, quote),
      maxFractionDigits: 8,
      note: 'The pool with the largest quote reserve, reported whichever source set the price',
    },
    {
      key: 'divergence',
      label: 'Book against pool',
      value: classify(risk.priceDivergencePct, '%'),
      maxFractionDigits: 4,
      note: 'Past the methodology threshold, the pool price is used and PRICE_SOURCE_CONFLICT fires',
    },
    {
      key: 'spread',
      label: 'Spread',
      value: classify(risk.spreadPct, '%'),
      maxFractionDigits: 4,
      note: 'Best ask minus best bid, over the mid',
    },
    // The multi-pair fields are declared in the contract and, in its own words,
    // "nothing populates [them] until the multi-pair evaluation lands. Do not assume
    // presence." A row that could only ever read "not reported" is noise, so each
    // appears when its key does — and a served null still reads as not computed.
    ...(risk.bandDrivenBy === undefined
      ? []
      : [
          {
            key: 'bandDrivenBy',
            label: 'Band set by the pair against',
            text: risk.bandDrivenBy.code,
            note:
              pairs === undefined || pairs.length === 0
                ? 'The band is the highest tier on any evaluated pair, because an attacker takes the cheapest path'
                : pairs.map(pairLine).join(' · '),
          } satisfies FigureRow,
        ]),
    ...(risk.xlmUsdcRate === undefined
      ? []
      : [
          {
            key: 'xlmUsdc',
            label: 'XLM/USDC rate at this ledger',
            value: classify(risk.xlmUsdcRate, 'USDC'),
            maxFractionDigits: 8,
            note: 'Converts an XLM-quoted pair before it is judged against USDC thresholds',
          } satisfies FigureRow,
        ]),
  ];
}

/**
 * The oracle window term, or `null` when the engine sent none. The contract reserves
 * null for "no executable price", but the caller only states that reason when
 * `priceSource` says so, since a null can also arrive beside a computed price.
 */
export function oracleRows(risk: AssetRisk): FigureRow[] | null {
  const oracle = risk.oracleResistance;
  if (oracle === null || oracle === undefined) return null;
  const quote = risk.quote.code;

  return [
    {
      key: 'critical',
      label: `Cost of a ${deltaPercent(oracle.criticalDelta)} move, order book only`,
      value: classify(oracle.manipulationCost, quote),
      maxFractionDigits: 2,
      note: oracle.reachable
        ? 'The target is reachable through the order book'
        : 'NOT reachable through the order book: this is the cost of exhausting the book, not of reaching the target',
    },
    {
      key: 'genuine',
      label: 'Genuine volume in the oracle window',
      value: classify(oracle.genuineVolume, quote),
      maxFractionDigits: 2,
      note: `Over the last ${windowLabel(oracle.windowSeconds)}, after the genuine-trade filter`,
    },
    {
      key: 'ratio',
      label: 'Cost against genuine volume',
      value: classify(oracle.ratio),
      maxFractionDigits: 4,
      note: 'Below 1, moving the price is cheaper than all genuine trading across the window. Not computed when there was no genuine volume or the target is unreachable',
    },
    {
      key: 'total',
      label: 'Total attack cost',
      value: classify(oracle.totalAttackCost, quote),
      maxFractionDigits: 2,
      note: 'The move, plus the genuine volume an averaging oracle forces an attacker to outweigh',
    },
  ];
}

/** The top of the order book, read as a pair: the highest price, and what it costs. */
export function reachRows(risk: AssetRisk): FigureRow[] {
  const quote = risk.quote.code;
  return [
    {
      key: 'maxReachable',
      label: 'Highest price the book can reach',
      value: classify(risk.maxReachablePrice, quote),
      maxFractionDigits: 8,
      note: 'Absorbing every ask. Not computed when an active pool exists, because a constant product curve has no highest price',
    },
    {
      key: 'costToMax',
      label: 'Cost to reach it',
      value: classify(risk.costToMaxReachablePrice, quote),
      maxFractionDigits: 2,
      note: 'Every ask below that price. Catches an attack that lands between two rungs of the ladder',
    },
  ];
}
