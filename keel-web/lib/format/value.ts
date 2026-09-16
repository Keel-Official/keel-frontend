/**
 * Every value-bearing field from the Keel API passes through here before a component
 * sees it.
 *
 * The API distinguishes states that a template collapses into one, and collapsing
 * them makes a claim the engine explicitly refuses to make. A field can arrive
 * absent, `null`, as a computed `"0"`, or as a figure, and those are four different
 * findings:
 *
 *   absent   the response did not carry the key
 *   unknown  the key is there and the engine could not compute a value
 *   zero     the engine computed a value and it is zero
 *   present  the engine computed a figure
 *
 * `maxSafeCollateral: null` means it could not be computed. `maxSafeCollateral: "0"`
 * means the engine computed zero, which is a finding about the asset. Those two must
 * not look alike on screen, and they must not be `-` or an empty cell either.
 *
 * Nothing here does arithmetic. Values stay as the strings the engine served.
 */

export type ValueState = 'absent' | 'unknown' | 'zero' | 'present';

export interface KeelValue {
  readonly state: ValueState;
  /**
   * The string exactly as served, for `state` of `zero` or `present`. This is what a
   * label, tooltip, table cell, or copy action must use. It is never reconstructed
   * from a formatted or converted form.
   */
  readonly exact: string | null;
  /**
   * The quote asset the figure is denominated in, when the caller knows it. Keel
   * quotes in an asset, not in an abstract currency, so a bare number is ambiguous.
   */
  readonly unit: string | null;
}

/** Matches a plain decimal string. The API does not use exponent notation. */
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

/** True when every digit is zero, by inspection rather than by conversion. */
export function isZeroString(value: string): boolean {
  return /^-?0+(\.0+)?$/.test(value);
}

export function classify(
  raw: string | null | undefined,
  unit: string | null = null,
): KeelValue {
  if (raw === undefined) return { state: 'absent', exact: null, unit };
  if (raw === null) return { state: 'unknown', exact: null, unit };
  if (!DECIMAL_PATTERN.test(raw)) {
    // A value that is not a plain decimal is not something to guess at. Treat it as
    // unknown and keep the original out of the display rather than render a string
    // the rest of the layer cannot reason about.
    return { state: 'unknown', exact: null, unit };
  }
  return { state: isZeroString(raw) ? 'zero' : 'present', exact: raw, unit };
}

/** True when the engine produced a figure or an explicit zero. */
export function isMeasured(value: KeelValue): boolean {
  return value.state === 'zero' || value.state === 'present';
}

/**
 * Integer-valued fields such as `ledgerSeq` arrive as JSON numbers by contract, so
 * they are not decimal strings and do not go through {@link classify}.
 */
export function classifyCount(raw: number | null | undefined): KeelValue {
  if (raw === undefined) return { state: 'absent', exact: null, unit: null };
  if (raw === null) return { state: 'unknown', exact: null, unit: null };
  const exact = String(raw);
  return { state: raw === 0 ? 'zero' : 'present', exact, unit: null };
}
