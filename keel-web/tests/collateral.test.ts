import { describe, expect, it } from 'vitest';

import { readCollateralCeiling } from '../lib/format/collateral';

/**
 * The figures below are responses from the live API on 16 September 2026, copied
 * whole. A shortened value would not exercise the thing under test: the terms differ
 * from the ceiling in the twentieth decimal place, which is exactly where a float
 * comparison stops being able to tell them apart.
 */

const terms = (
  ceiling: string | null | undefined,
  liquidation: string | null | undefined,
  manipulation: string | null | undefined,
) => ({
  maxSafeCollateral: ceiling,
  maxSafeCollateralLiquidation: liquidation,
  maxSafeCollateralManipulation: manipulation,
});

describe('readCollateralCeiling', () => {
  it('names liquidation when the ceiling matches that term', () => {
    // AFR, live: the liquidation term is the smaller of the two.
    const read = readCollateralCeiling(
      terms(
        '18.7908281873011439531730076422999030544606397896',
        '18.7908281873011439531730076422999030544606397896',
        '55.685373450008974511568685',
      ),
      'USDC',
    );

    expect(read.binding).toBe('liquidation');
    expect(read.manipulationApplied).toBe(true);
  });

  it('names manipulation when that term is the one that binds', () => {
    // AIus, live: fifty digits of liquidation depth, held down to 0.0000017 by the
    // cost of moving the price.
    const read = readCollateralCeiling(
      terms(
        '0.000001775011085',
        '32.235936314489128634745569553871318644604632254322',
        '0.000001775011085',
      ),
      'USDC',
    );

    expect(read.binding).toBe('manipulation');
  });

  it('treats a null manipulation term as not applicable, never as zero', () => {
    // XLM, live. The engine did not apply the term because the critical target is not
    // reachable through the order book; a zero here would claim the attack is free.
    const read = readCollateralCeiling(
      terms(
        '156164.5418840911162973161386287182392417827063065804165',
        '156164.5418840911162973161386287182392417827063065804165',
        null,
      ),
      'USDC',
    );

    expect(read.manipulationApplied).toBe(false);
    expect(read.binding).toBe('liquidation');
    expect(read.manipulation.exact).toBeNull();
    expect(read.manipulation.state).toBe('unknown');
  });

  it('reads a computed zero ceiling as a measurement with a binding term', () => {
    // ACT, live: the engine computed zero. That is a finding about the asset, and the
    // term that produced it is still identifiable.
    const read = readCollateralCeiling(
      terms('0', '4.422327473454986756077922832380496760127728142446', '0'),
      'USDC',
    );

    expect(read.binding).toBe('manipulation');
    expect(read.ceiling.state).toBe('zero');
    expect(read.ceiling.exact).toBe('0');
  });

  it('matches on value rather than on spelling', () => {
    // The same number written two ways is the same number. A string equality check
    // would call this unmatched and put a contract-breach alert on a correct response.
    const read = readCollateralCeiling(terms('18.790', '18.79', '55.6'), 'USDC');
    expect(read.binding).toBe('liquidation');
  });

  it('reports both terms when they are equal', () => {
    const read = readCollateralCeiling(terms('12.5', '12.5', '12.5'), 'USDC');
    expect(read.binding).toBe('both');
  });

  it('reports a ceiling that matches neither term rather than picking one', () => {
    // The contract defines the ceiling as the minimum of the two, so this cannot
    // happen. If it does, resolving it here would hide the breach.
    const read = readCollateralCeiling(terms('7', '9', '11'), 'USDC');
    expect(read.binding).toBe('unmatched');
  });

  it('has no binding term when no ceiling was computed', () => {
    expect(readCollateralCeiling(terms(null, null, null)).binding).toBe('unmeasured');
    expect(readCollateralCeiling(terms(undefined, undefined, undefined)).binding).toBe(
      'unmeasured',
    );
  });

  it('flags a ceiling served without the liquidation term', () => {
    // The contract says the liquidation term is always present when the ceiling is.
    const read = readCollateralCeiling(terms('5', null, '5'), 'USDC');
    expect(read.missingLiquidationTerm).toBe(true);
  });

  it('does not flag a missing liquidation term when there is no ceiling either', () => {
    expect(readCollateralCeiling(terms(null, null, null)).missingLiquidationTerm).toBe(
      false,
    );
  });

  it('carries the quote asset onto every figure', () => {
    const read = readCollateralCeiling(terms('5', '5', '9'), 'USDC');
    expect(read.ceiling.unit).toBe('USDC');
    expect(read.liquidation.unit).toBe('USDC');
    expect(read.manipulation.unit).toBe('USDC');
  });
});
