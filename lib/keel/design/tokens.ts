/**
 * Typed access to the design tokens declared in the dashboard stylesheet.
 *
 * EVERY VALUE HERE IS A `var()` REFERENCE, NOT A HEX LITERAL, and that is the whole
 * point of the module. Chart and chip code sets colours from JavaScript, through the
 * `style` attribute; a literal baked in at build time cannot follow a theme, so the
 * moment the dashboard gained a second palette a hex here would have pinned every
 * inline-styled mark to the first one. A `var()` in a style attribute resolves against
 * the element's own cascade, so the same token reads correctly in both themes with no
 * component change and no client-side theme plumbing.
 *
 * The literal values, the validator output behind each of them, and the alternatives
 * that were rejected live in `docs/decisions/002-dashboard-theme-tokens.md`.
 * `scripts/check-token-contrast.mjs` is the validator; it holds both palettes and
 * fails on a regression.
 *
 * NOTE ON SVG. These work in a presentation attribute as well as in `style`: a
 * presentation attribute is parsed as a CSS declaration, so `stroke="var(--seq-600)"`
 * resolves against the element's cascade exactly as `style={{ stroke: ... }}` does.
 * Verified in the running page — the trend chart sets `stroke` and `fill` as attributes
 * and both compute to the current theme's value. `style` is still preferred for new
 * code, because it is the form that is obviously correct at a glance.
 */
import type { Band, BandConfidence } from '../format/flags';

export interface BandToken {
  /** The validated hue. Marks only; in the light theme it is not readable as text. */
  readonly mark: string;
  /** Label colour. Clears AA against the page surface and against the chip tint. */
  readonly ink: string;
  /** Tint behind a chip. */
  readonly surface: string;
  /**
   * Lucide icon name. Colour alone never carries the band: MEDIUM against HIGH
   * measures a deuteranope delta E of 5.9 in dark and 11.5 in light, both under the
   * floor of 15, so the icon is a requirement rather than decoration. The four
   * silhouettes are deliberately different shapes, not four colours of one shape.
   */
  readonly icon:
    'circle-check' | 'triangle-alert' | 'octagon-alert' | 'octagon-x';
  /** The word a reader sees. Never omitted. */
  readonly label: string;
  /** Position in the four-segment indicator, worst last. */
  readonly segment: 0 | 1 | 2 | 3;
}

export const BAND_TOKENS: Readonly<Record<Band, BandToken>> = {
  LOW: {
    mark: 'var(--band-low)',
    ink: 'var(--band-low-ink)',
    surface: 'var(--band-low-surface)',
    icon: 'circle-check',
    label: 'Low',
    segment: 0,
  },
  MEDIUM: {
    mark: 'var(--band-medium)',
    ink: 'var(--band-medium-ink)',
    surface: 'var(--band-medium-surface)',
    icon: 'triangle-alert',
    label: 'Medium',
    segment: 1,
  },
  HIGH: {
    mark: 'var(--band-high)',
    ink: 'var(--band-high-ink)',
    surface: 'var(--band-high-surface)',
    icon: 'octagon-alert',
    label: 'High',
    segment: 2,
  },
  CRITICAL: {
    mark: 'var(--band-critical)',
    ink: 'var(--band-critical-ink)',
    surface: 'var(--band-critical-surface)',
    icon: 'octagon-x',
    label: 'Critical',
    segment: 3,
  },
};

/** The four segments in display order, safest first. */
export const BAND_ORDER: readonly Band[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

/**
 * Worst first. This is the order the overview reads in: the monitored set is mostly
 * CRITICAL, and a display that opens on the safest assets buries the finding.
 */
export const BAND_ORDER_SEVERE_FIRST: readonly Band[] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
];

export interface VenueToken {
  readonly mark: string;
  readonly label: string;
}

/**
 * Three categorical slots and there is no fourth: a fourth would put yellow beside
 * orange and fail separation. SDEX and AMM depth are never two numbers to be added;
 * they decompose one combined figure the engine produced through a shared bound.
 */
export const VENUE_TOKENS = {
  sdex: { mark: 'var(--venue-sdex)', label: 'SDEX' },
  amm: { mark: 'var(--venue-amm)', label: 'AMM' },
  third: { mark: 'var(--venue-third)', label: '' },
} as const satisfies Record<string, VenueToken>;

/**
 * Sequential ramp, strictly monotonic in luminance, for magnitude in a chart. It runs
 * light-to-dark in the light theme and dark-to-light in the dark one, so a higher index
 * is always further from the surface it sits on. Never used to encode a band: band is a
 * status palette and is reserved.
 */
export const SEQUENTIAL_RAMP: readonly string[] = [
  'var(--seq-100)',
  'var(--seq-150)',
  'var(--seq-200)',
  'var(--seq-250)',
  'var(--seq-300)',
  'var(--seq-350)',
  'var(--seq-400)',
  'var(--seq-450)',
  'var(--seq-500)',
  'var(--seq-550)',
  'var(--seq-600)',
  'var(--seq-650)',
  'var(--seq-700)',
];

/**
 * A value the engine did not produce is not a low value, so it never takes a step on
 * the risk scale or on the sequential ramp. The hatch class is a second channel
 * besides colour, for greyscale, print, and forced-colors.
 */
export const UNMEASURED_TOKEN = {
  mark: 'var(--unmeasured)',
  surface: 'var(--unmeasured-surface)',
  hatchClassName: 'keel-hatch-unmeasured',
  icon: 'circle-dashed',
} as const;

/**
 * Confidence is orthogonal to band. `partial` is the value on all sixty-one monitored
 * assets today, so it is carried quietly beside each band rather than as an alarm on
 * every row — and the fact that it is universal is stated once, prominently, where it
 * changes how the whole table should be read.
 */
export const CONFIDENCE_TOKENS: Readonly<
  Record<BandConfidence, { readonly ink: string; readonly label: string }>
> = {
  full: { ink: 'var(--confidence-full)', label: 'full confidence' },
  partial: { ink: 'var(--confidence-partial)', label: 'partial confidence' },
};
