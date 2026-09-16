/**
 * The collateral ceiling, and which of the two terms produced it.
 *
 * `maxSafeCollateral` is the MINIMUM of `maxSafeCollateralLiquidation` and
 * `maxSafeCollateralManipulation`. The contract states why both are sent: "the minimum
 * alone hides WHICH limit binds, and that is the part a lender acts on. A position
 * limited by liquidation depth and one limited by manipulation cost call for different
 * responses." So the ceiling is never shown on its own here.
 *
 * NOTHING IS COMPUTED. The binding term is found by comparing the served ceiling
 * against the served terms, digit by digit, through `compareDecimalStrings`. The
 * minimum is not recomputed and the two terms are never combined: this module reports
 * which figure the engine's own answer matches.
 *
 * A null manipulation term is NOT a missing measurement. The contract is explicit that
 * it means the critical target is unreachable through the order book, so the term is
 * not applied at all and the ceiling falls back to the liquidation term — with a
 * `warnings` entry saying so. Reading that null as "unknown", or worse as zero, would
 * invert the finding: zero would claim the attack is free.
 */
import type { AssetRisk } from '../api/types';
import { compareDecimalStrings } from './compare';
import { classify, isMeasured, type KeelValue } from './value';

export type CeilingBinding =
  /** The ceiling equals the liquidation term, and that is what limits the position. */
  | 'liquidation'
  /** The ceiling equals the manipulation term. */
  | 'manipulation'
  /** The two terms are equal, so both bind at once. */
  | 'both'
  /**
   * A ceiling the engine computed that matches neither term. The contract says it is
   * the minimum of the two, so this cannot happen — and it is reported rather than
   * resolved, because picking a term here would hide a contract breach behind a
   * plausible-looking display.
   */
  | 'unmatched'
  /** No ceiling was computed, so no term binds. */
  | 'unmeasured';

export interface CollateralCeiling {
  readonly ceiling: KeelValue;
  readonly liquidation: KeelValue;
  readonly manipulation: KeelValue;
  readonly binding: CeilingBinding;
  /**
   * False when the manipulation term was not applied. The ceiling is then the
   * liquidation term alone, which is a complete answer rather than a partial one.
   */
  readonly manipulationApplied: boolean;
  /**
   * True when the engine sent a ceiling without the liquidation term. The contract
   * says the liquidation term is "always present when `maxSafeCollateral` is", so this
   * is a breach and the display has to say so instead of drawing a ceiling that
   * nothing stands behind.
   */
  readonly missingLiquidationTerm: boolean;
}

function matches(ceiling: KeelValue, term: KeelValue): boolean {
  if (!isMeasured(ceiling) || !isMeasured(term)) return false;
  return compareDecimalStrings(ceiling.exact as string, term.exact as string) === 0;
}

export function readCollateralCeiling(
  risk: Pick<
    AssetRisk,
    'maxSafeCollateral' | 'maxSafeCollateralLiquidation' | 'maxSafeCollateralManipulation'
  >,
  unit: string | null = null,
): CollateralCeiling {
  const ceiling = classify(risk.maxSafeCollateral, unit);
  const liquidation = classify(risk.maxSafeCollateralLiquidation, unit);
  const manipulation = classify(risk.maxSafeCollateralManipulation, unit);

  const byLiquidation = matches(ceiling, liquidation);
  const byManipulation = matches(ceiling, manipulation);

  let binding: CeilingBinding;
  if (!isMeasured(ceiling)) binding = 'unmeasured';
  else if (byLiquidation && byManipulation) binding = 'both';
  else if (byLiquidation) binding = 'liquidation';
  else if (byManipulation) binding = 'manipulation';
  else binding = 'unmatched';

  return {
    ceiling,
    liquidation,
    manipulation,
    binding,
    manipulationApplied: isMeasured(manipulation),
    missingLiquidationTerm: isMeasured(ceiling) && !isMeasured(liquidation),
  };
}

/**
 * The sentence for the binding term.
 *
 * This is a statement about the response, not about the asset: it says which served
 * figure the served ceiling matches. What a lender should do about a liquidation-bound
 * position as against a manipulation-bound one is a methodology statement.
 *
 * TODO-COPY(Al): one sentence per binding term saying what a protocol engineer should
 * change in response — the contract says the two call for different responses, and
 * naming the difference is the whole reason both terms are on screen.
 */
export const BINDING_WORDS: Readonly<Record<CeilingBinding, string>> = {
  liquidation: 'Limited by liquidation depth',
  manipulation: 'Limited by manipulation cost',
  both: 'Both terms bind at the same figure',
  unmatched: 'The ceiling matches neither term',
  unmeasured: 'No ceiling was computed',
};
