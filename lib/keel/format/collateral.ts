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
 * A null manipulation term beside a computed ceiling is NOT a missing measurement. The
 * contract is explicit that it means the critical target is unreachable through the
 * order book, so the term is not applied at all and the ceiling falls back to the
 * liquidation term — with a `warnings` entry saying so. Reading that null as "unknown",
 * or worse as zero, would invert the finding: zero would claim the attack is free.
 *
 * That reason does not carry over to a response where nothing was computed at all, and
 * {@link ManipulationTermState} keeps the two apart.
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

/**
 * Why the manipulation term reads the way it does.
 *
 * `not-applicable` is the contract's documented case: the term is null because the
 * critical target cannot be reached through the order book, so it was not applied and
 * the ceiling is the liquidation term alone. That is a complete answer.
 *
 * `unmeasured` is the case where nothing was computed at all — no executable price, so
 * no ceiling and no terms. The reason the manipulation term is missing is then the
 * reason everything is missing, and claiming the documented one would put a sentence
 * on screen that does not describe this response. The engine's own `warnings` entry
 * carries the actual reason.
 */
export type ManipulationTermState = 'applied' | 'not-applicable' | 'unmeasured';

export interface CollateralCeiling {
  readonly ceiling: KeelValue;
  readonly liquidation: KeelValue;
  readonly manipulation: KeelValue;
  readonly binding: CeilingBinding;
  readonly manipulationTerm: ManipulationTermState;
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
  return (
    compareDecimalStrings(ceiling.exact as string, term.exact as string) === 0
  );
}

export function readCollateralCeiling(
  risk: Pick<
    AssetRisk,
    | 'maxSafeCollateral'
    | 'maxSafeCollateralLiquidation'
    | 'maxSafeCollateralManipulation'
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

  let manipulationTerm: ManipulationTermState;
  if (isMeasured(manipulation)) manipulationTerm = 'applied';
  else if (isMeasured(ceiling)) manipulationTerm = 'not-applicable';
  else manipulationTerm = 'unmeasured';

  return {
    ceiling,
    liquidation,
    manipulation,
    binding,
    manipulationTerm,
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
