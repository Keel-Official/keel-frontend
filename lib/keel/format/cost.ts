/**
 * `cost` is never displayed without `reachable`.
 *
 * `cost: "0"` with `reachable: true` means the target price is free to reach: there is
 * nothing in the way. `cost: "0"` with `reachable: false` means there is no liquidity
 * at all, so no amount of capital walks the book to that target. These are opposite
 * findings about an asset and must not share a visual treatment.
 *
 * An unreachable target is also not "a high cost". The figure on an unreachable rung
 * is what it costs to go as far as the book allows, which is a different quantity from
 * the cost of reaching the target, and the two must not be read off the same column
 * as if they answered the same question.
 *
 * This module turns the pair into one value a component cannot render incompletely.
 */
import type { ManipulationCost } from '../api/types';
import { classify, isZeroString, type KeelValue } from './value';

export type ManipulationOutcomeKind =
  /** Reachable at no cost: nothing stands between the current price and the target. */
  | 'free'
  /** Reachable, and this is what it costs. */
  | 'reachable'
  /** Not reachable. Any figure is a bound on how far the book goes, not a price. */
  | 'unreachable';

export interface ManipulationOutcome {
  readonly kind: ManipulationOutcomeKind;
  readonly delta: ManipulationCost['delta'];
  readonly targetPrice: KeelValue;
  /**
   * For `reachable`, the cost of reaching the target. For `unreachable`, the cost of
   * going as far as the book allows. For `free`, the served zero.
   */
  readonly cost: KeelValue;
  readonly reachable: boolean;
}

export function classifyManipulation(
  rung: ManipulationCost,
  unit: string | null = null,
): ManipulationOutcome {
  const cost = classify(rung.cost, unit);
  const targetPrice = classify(rung.targetPrice, unit);

  let kind: ManipulationOutcomeKind;
  if (!rung.reachable) {
    kind = 'unreachable';
  } else if (typeof rung.cost === 'string' && isZeroString(rung.cost)) {
    kind = 'free';
  } else {
    kind = 'reachable';
  }

  return {
    kind,
    delta: rung.delta,
    targetPrice,
    cost,
    reachable: rung.reachable,
  };
}

/**
 * `manipulationCostOrderbookOnly` is bounded above by `manipulationCostCombined`: the
 * combined figure has more venues to absorb the order, so it can only cost the same or
 * more to move the price. A display that suggests otherwise is wrong, and this reports
 * that rather than correcting it, because the frontend does not adjust engine output.
 */
export function orderbookExceedsCombined(
  orderbookOnly: ManipulationCost[],
  combined: ManipulationCost[],
  compare: (a: string, b: string) => number,
): ManipulationCost['delta'][] {
  const combinedByDelta = new Map(combined.map((rung) => [rung.delta, rung]));
  const offending: ManipulationCost['delta'][] = [];

  for (const rung of orderbookOnly) {
    const pair = combinedByDelta.get(rung.delta);
    // Only comparable when both rungs actually reach the target; otherwise the two
    // figures answer different questions and an ordering between them means nothing.
    if (pair === undefined || !rung.reachable || !pair.reachable) continue;
    if (compare(rung.cost, pair.cost) > 0) offending.push(rung.delta);
  }

  return offending;
}

/**
 * A manipulation rung's delta, as the price rise it simulates.
 *
 * The contract's delta is a FRACTION of the price: "0.5 means a rise of 50 percent, 100
 * means a rise of 10000 percent". An earlier table printed the raw value with a percent
 * sign, which told a reader the critical rung was a half-per-cent nudge when it is a
 * fifty per cent move — a hundredfold understatement of what the cost buys. The enum is
 * four fixed values, so the conversion is exact.
 */
const DELTA_LABELS: Readonly<Record<ManipulationCost['delta'], string>> = {
  0.5: '+50%',
  1: '+100%',
  10: '+1,000%',
  100: '+10,000%',
};

export function formatManipulationDelta(
  delta: ManipulationCost['delta'],
): string {
  return DELTA_LABELS[delta];
}
