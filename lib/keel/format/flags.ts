/**
 * Triggered flags and unevaluated flags are different findings.
 *
 * `flags` lists what fired. `unevaluatedFlags` lists what could not be measured. An
 * unevaluated flag is not a flag that came back clear, so rendering an empty `flags`
 * array as a green tick makes a claim the engine explicitly refuses to make.
 *
 * On the live deployment this is the common case rather than an edge case: on
 * 16 September 2026 XLM reported band LOW with no triggered flags and six unevaluated
 * ones, and `bandConfidence` was `partial` on 61 of 61 assets.
 */
import type { components } from '../api/schema';

export type Flag = components['schemas']['Flag'];
export type Band = components['schemas']['Band'];
export type BandConfidence = components['schemas']['BandConfidence'];
export type DataSource = components['schemas']['DataSource'];

export type FlagAssessmentKind =
  /** Nothing fired, and everything was measured. The only case that is a pass. */
  | 'clear'
  /** Nothing fired, but some checks could not run. Not a pass. */
  | 'incomplete'
  /** Something fired. */
  | 'triggered';

export interface FlagAssessment {
  readonly kind: FlagAssessmentKind;
  readonly triggered: readonly Flag[];
  readonly unevaluated: readonly Flag[];
}

export function assessFlags(
  triggered: readonly Flag[],
  unevaluated: readonly Flag[],
): FlagAssessment {
  let kind: FlagAssessmentKind;
  if (triggered.length > 0) kind = 'triggered';
  else if (unevaluated.length > 0) kind = 'incomplete';
  else kind = 'clear';
  return { kind, triggered, unevaluated };
}

/**
 * A reader must be able to say which group a flag is in without a legend lookup, so
 * the two lists are never merged into one sequence.
 */
export function isPass(assessment: FlagAssessment): boolean {
  return assessment.kind === 'clear';
}

/**
 * `trades-implied` is a reconstruction that yields a lower bound rather than a
 * measurement, so a figure derived from it is not the same kind of number as one from
 * a direct reading and must carry a distinguishing marker.
 */
export function isLowerBound(source: DataSource): boolean {
  return source === 'trades-implied';
}

export function isDirectReading(source: DataSource): boolean {
  return source === 'horizon';
}

/**
 * Band ordering, worst first, for sorting a column by severity. This is the order the
 * enum declares; it asserts nothing about what the bands mean.
 */
const BAND_SEVERITY: Record<Band, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function compareBands(a: Band, b: Band): number {
  return BAND_SEVERITY[a] - BAND_SEVERITY[b];
}

/*
 * What each flag means, what a band threshold implies, and what `partial` confidence
 * should tell a reader to do are methodology statements rather than formatting ones,
 * and they are authored alongside the methodology.
 *
 * TODO-COPY(Al): one sentence per flag in the twelve-value enum, written for a
 * protocol engineer deciding a collateral parameter, saying what the flag being
 * triggered implies about the asset.
 *
 * TODO-COPY(Al): one sentence saying what `bandConfidence: "partial"` means for how
 * far a reader should trust the band, given that it is currently the value on every
 * monitored asset.
 *
 * TODO-COPY(Al): one sentence distinguishing a triggered flag from an unevaluated one,
 * for the heading that sits above the two groups.
 */
