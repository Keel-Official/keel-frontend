import { describe, expect, it } from 'vitest';

import type { ManipulationCost } from '../lib/api/types';
import { classifyManipulation, orderbookExceedsCombined } from '../lib/format/cost';
import { compareDecimalStrings } from '../lib/format/compare';

const rung = (
  delta: ManipulationCost['delta'],
  cost: string,
  reachable: boolean,
  targetPrice = '1.0',
): ManipulationCost => ({ delta, targetPrice, cost, reachable });

describe('classifyManipulation', () => {
  it('separates a free target from no liquidity at all', () => {
    // Both send cost "0". They are opposite findings and must not share a treatment.
    expect(classifyManipulation(rung(0.5, '0.0000000', true)).kind).toBe('free');
    expect(classifyManipulation(rung(0.5, '0.0000000', false)).kind).toBe('unreachable');
  });

  it('does not read an unreachable rung as a high cost', () => {
    // The broken-book example sends exactly this: a bounded figure on a rung that
    // never reaches the target. It is how far the book goes, not what the move costs.
    const outcome = classifyManipulation(rung(10, '130.0627093', false));
    expect(outcome.kind).toBe('unreachable');
    expect(outcome.reachable).toBe(false);
    expect(outcome.cost.exact).toBe('130.0627093');
  });

  it('reports a reachable target with its cost', () => {
    const outcome = classifyManipulation(rung(1, '8422018.7710000', true), 'USDC');
    expect(outcome.kind).toBe('reachable');
    expect(outcome.cost.state).toBe('present');
    expect(outcome.cost.exact).toBe('8422018.7710000');
    expect(outcome.cost.unit).toBe('USDC');
  });

  it('carries the delta and the target price through', () => {
    const outcome = classifyManipulation(rung(100, '5', true, '2.5'), 'USDC');
    expect(outcome.delta).toBe(100);
    expect(outcome.targetPrice.exact).toBe('2.5');
    expect(outcome.targetPrice.unit).toBe('USDC');
  });

  it('never leaves reachable out of the result', () => {
    for (const reachable of [true, false]) {
      expect(classifyManipulation(rung(1, '5', reachable))).toHaveProperty(
        'reachable',
        reachable,
      );
    }
  });
});

describe('orderbookExceedsCombined', () => {
  it('reports nothing when the order-book figure stays at or below the combined one', () => {
    const orderbook = [rung(0.5, '100', true), rung(1, '200', true)];
    const combined = [rung(0.5, '100', true), rung(1, '250', true)];
    expect(orderbookExceedsCombined(orderbook, combined, compareDecimalStrings)).toEqual([]);
  });

  it('reports the delta where the ordering is violated', () => {
    // More venues can only absorb the order at the same price or better, so the
    // combined cost can never be the smaller of the two.
    const orderbook = [rung(1, '300', true)];
    const combined = [rung(1, '250', true)];
    expect(orderbookExceedsCombined(orderbook, combined, compareDecimalStrings)).toEqual([1]);
  });

  it('does not compare rungs that answer different questions', () => {
    // An unreachable rung carries a bound, not a cost to the target, so an ordering
    // between it and a reachable figure means nothing.
    const orderbook = [rung(1, '300', false)];
    const combined = [rung(1, '250', true)];
    expect(orderbookExceedsCombined(orderbook, combined, compareDecimalStrings)).toEqual([]);
  });

  it('skips a delta that is missing from one side', () => {
    expect(orderbookExceedsCombined([rung(100, '5', true)], [], compareDecimalStrings)).toEqual(
      [],
    );
  });

  it('compares exactly, not through a double', () => {
    const orderbook = [rung(1, '9007199254740993', true)];
    const combined = [rung(1, '9007199254740992', true)];
    expect(orderbookExceedsCombined(orderbook, combined, compareDecimalStrings)).toEqual([1]);
  });
});
