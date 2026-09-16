import { classify, type KeelValue } from './value';

/**
 * Reading the served thresholds.
 *
 * The thresholds map is open ended by contract: "new keys can appear without a major
 * API version bump, so consumers are required to read them by key name rather than by
 * position." So nothing here enumerates the keys it expects. Whatever the engine sends
 * is what the page shows, and a key this build has never seen still renders.
 *
 * ONE NAMING CONVENTION IS APPLIED, AND ONLY ONE. The contract states that "every key
 * ending in `Pct` is expressed in percent, not as a fraction". That is the only unit
 * rule the contract gives, so it is the only one used. Inferring a unit from any other
 * suffix would be inventing semantics.
 *
 * `*Delta` keys are the clearest reason not to guess: `liquidationDelta` is 0.1 and
 * matches the depth enum, where deltas are fractions (0.02, 0.05, 0.1), while
 * `manipulationCriticalDelta` is 0.5 and matches the manipulation enum, where they are
 * percentages (0.5, 1, 10, 100). Two scales, one suffix. Neither gets a unit here.
 */

/** A threshold whose value names an asset, as `CODE:ISSUER`. */
export interface AssetIdValue {
  readonly kind: 'assetId';
  readonly code: string;
  readonly issuer: string;
  readonly raw: string;
}

/** A decimal string, or a JSON number for the fields the contract sends as numbers. */
export interface NumericValue {
  readonly kind: 'numeric';
  readonly value: KeelValue;
}

/** Anything else the engine sends, shown as served rather than dropped. */
export interface OpaqueValue {
  readonly kind: 'opaque';
  readonly text: string;
}

export type ThresholdValue = AssetIdValue | NumericValue | OpaqueValue;

export interface Threshold {
  readonly key: string;
  readonly value: ThresholdValue;
}

const ASSET_ID_PATTERN = /^([A-Za-z0-9]{1,12}):([A-Z0-9]{56})$/;

/** The contract's one stated convention. `thinDepth5PctAbsolute` does not end in Pct. */
function unitFor(key: string): string | null {
  return key.endsWith('Pct') ? '%' : null;
}

function readValue(key: string, raw: unknown, unitOverride?: string | null): ThresholdValue {
  if (typeof raw === 'string') {
    const asset = ASSET_ID_PATTERN.exec(raw);
    if (asset) {
      return { kind: 'assetId', code: asset[1], issuer: asset[2], raw };
    }
    const value = classify(raw, unitOverride ?? unitFor(key));
    // `classify` reports a non-decimal string as unknown, which would hide the value.
    // Anything that is not a decimal is shown as served instead.
    if (value.state === 'unknown') return { kind: 'opaque', text: raw };
    return { kind: 'numeric', value };
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    // Sent as a JSON number by the contract for day counts, window seconds, and the
    // deltas. `String` on a number the engine chose to send as a number is not a
    // conversion of a monetary value.
    return {
      kind: 'numeric',
      value: classify(String(raw), unitOverride ?? unitFor(key)),
    };
  }

  if (raw === null) return { kind: 'opaque', text: 'null' };
  return { kind: 'opaque', text: JSON.stringify(raw) ?? String(raw) };
}

export interface ThresholdGroup {
  /** The shared prefix, for a pair like `manipulationCheapAbsolute` + `…Unit`. */
  readonly key: string;
  readonly value: ThresholdValue;
  /**
   * The asset a bare figure is denominated in, when the engine sent a matching `*Unit`
   * key. An absolute threshold without its unit is ambiguous in exactly the way a cost
   * without reachability is, so the two are never shown apart.
   */
  readonly denominatedIn: AssetIdValue | null;
}

const ABSOLUTE_SUFFIX = 'Absolute';
const UNIT_SUFFIX = 'Unit';

/**
 * Pairs each `*Absolute` threshold with its `*Unit` sibling and returns everything else
 * as it came. A `*Unit` key that has been absorbed into its pair is not repeated as a
 * row of its own; one that has no sibling still appears, because dropping a served
 * value would hide it.
 */
export function readThresholds(
  thresholds: Readonly<Record<string, unknown>>,
): ThresholdGroup[] {
  const units = new Map<string, AssetIdValue>();

  for (const [key, raw] of Object.entries(thresholds)) {
    if (!key.endsWith(UNIT_SUFFIX)) continue;
    const value = readValue(key, raw);
    if (value.kind === 'assetId') {
      units.set(key.slice(0, -UNIT_SUFFIX.length), value);
    }
  }

  const absorbed = new Set<string>();
  const groups: ThresholdGroup[] = [];

  for (const [key, raw] of Object.entries(thresholds)) {
    if (key.endsWith(UNIT_SUFFIX)) continue;

    if (key.endsWith(ABSOLUTE_SUFFIX)) {
      const base = key.slice(0, -ABSOLUTE_SUFFIX.length);
      const unit = units.get(base) ?? null;
      if (unit) absorbed.add(`${base}${UNIT_SUFFIX}`);
      groups.push({
        key,
        // The figure carries the asset CODE so it reads as a quantity of something,
        // while `denominatedIn` carries the full pair beside it. Putting the whole
        // 56-character issuer inline would state the pair twice in one row and push
        // the figure off the side; omitting the asset entirely would leave a bare
        // number, which is the ambiguity this pairing exists to remove.
        value: readValue(key, raw, unit ? unit.code : undefined),
        denominatedIn: unit,
      });
      continue;
    }

    groups.push({ key, value: readValue(key, raw), denominatedIn: null });
  }

  // Any `*Unit` key that was not absorbed into a pair is still a served value.
  for (const [key, raw] of Object.entries(thresholds)) {
    if (!key.endsWith(UNIT_SUFFIX) || absorbed.has(key)) continue;
    groups.push({ key, value: readValue(key, raw), denominatedIn: null });
  }

  return groups.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * `calibrated` is false in v1 and the note says why. A dashboard that hides that is
 * overclaiming, so this exists to make the absence of a note visible too rather than
 * letting it render as nothing.
 */
export function calibrationStatement(
  calibrated: boolean,
  note: string | undefined,
): { heading: string; note: string | null } {
  return {
    heading: calibrated
      ? 'These thresholds are calibrated'
      : 'These thresholds are chosen, not calibrated',
    note: note ?? null,
  };
}
