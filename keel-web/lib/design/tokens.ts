/**
 * Typed access to the design tokens declared in `app/globals.css`.
 *
 * Chart code needs the values, not just the CSS variables, because an SVG fill is
 * often set from JavaScript. Both are exposed and they are kept in step by
 * `tests/tokens.test.ts`, which fails if a hex here stops matching the stylesheet.
 *
 * The rationale, the validator output, and the rejected alternatives are in
 * `docs/decisions/001-design-tokens.md`.
 */
import type { Band, BandConfidence } from '../format/flags';

export interface BandToken {
  /** The validated hue. Marks only; it is not readable as text. */
  readonly mark: string;
  /** Label colour. Clears AA against the page surface. */
  readonly ink: string;
  /** Tint behind a chip. */
  readonly surface: string;
  /**
   * Lucide icon name. Colour alone never carries the band, and medium against high
   * measures a normal-vision delta E of 13.6 — under the floor — so the icon is a
   * requirement rather than decoration. The four silhouettes are deliberately
   * different shapes, not four colours of the same shape.
   */
  readonly icon: 'circle-check' | 'triangle-alert' | 'octagon-alert' | 'octagon-x';
  /** The word a reader sees. Never omitted. */
  readonly label: string;
  /** Position in the four-segment indicator, worst last. */
  readonly segment: 0 | 1 | 2 | 3;
}

export const BAND_TOKENS: Readonly<Record<Band, BandToken>> = {
  LOW: {
    mark: '#0ca30c',
    ink: '#24664f',
    surface: '#e6f3ea',
    icon: 'circle-check',
    label: 'Low',
    segment: 0,
  },
  MEDIUM: {
    mark: '#fab219',
    ink: '#8a5c14',
    surface: '#fff2d7',
    icon: 'triangle-alert',
    label: 'Medium',
    segment: 1,
  },
  HIGH: {
    mark: '#ec835a',
    ink: '#9a4b20',
    surface: '#fff0e2',
    icon: 'octagon-alert',
    label: 'High',
    segment: 2,
  },
  CRITICAL: {
    mark: '#d03b3b',
    ink: '#ae3737',
    surface: '#fdf0ee',
    icon: 'octagon-x',
    label: 'Critical',
    segment: 3,
  },
};

/** The four segments in display order, safest first. */
export const BAND_ORDER: readonly Band[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

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
  sdex: { mark: '#2a78d6', label: 'SDEX' },
  amm: { mark: '#eb6834', label: 'AMM' },
  third: { mark: '#1baf7a', label: '' },
} as const satisfies Record<string, VenueToken>;

/**
 * Sequential ramp, light to dark, strictly monotonic in luminance. For magnitude in a
 * heatmap. Never used to encode a band: band is a status palette and is reserved.
 */
export const SEQUENTIAL_RAMP: readonly string[] = [
  '#cde2fb',
  '#b7d3f6',
  '#9ec5f4',
  '#86b6ef',
  '#6da7ec',
  '#5598e7',
  '#3987e5',
  '#2a78d6',
  '#256abf',
  '#1c5cab',
  '#184f95',
  '#104281',
  '#0d366b',
];

/**
 * A value the engine did not produce is not a low value, so it never takes a step on
 * the risk scale or on the sequential ramp. The hatch class is a second channel
 * besides colour, for greyscale, print, and forced-colors.
 */
export const UNMEASURED_TOKEN = {
  mark: '#7b8b93',
  surface: '#f1f3f4',
  hatchClassName: 'keel-hatch-unmeasured',
  icon: 'circle-dashed',
} as const;

/**
 * Confidence is orthogonal to band. `partial` is the value on every monitored asset
 * today, so it is carried quietly beside the band rather than as an alarm on every
 * row, and stated in full on the detail view.
 */
export const CONFIDENCE_TOKENS: Readonly<
  Record<BandConfidence, { readonly ink: string; readonly label: string }>
> = {
  full: { ink: '#193440', label: 'full confidence' },
  partial: { ink: '#536a72', label: 'partial confidence' },
};
