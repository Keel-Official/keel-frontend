/**
 * Validator for the dashboard's colour tokens.
 *
 * Every number in `app/(dashboard)/dashboard/dashboard.css` that this file names is
 * checked here rather than asserted in a comment. Run it after touching a token:
 *
 *   node scripts/check-token-contrast.mjs
 *
 * Two properties are checked, and they are different questions:
 *
 *   CONTRAST  WCAG 2.2 relative luminance ratio. Text must clear 4.5:1 against the
 *             surface it sits on, 3:1 for large text and for a non-text mark that
 *             carries meaning.
 *   SEPARATION CIE76 delta E between two marks that a reader has to tell apart,
 *             under normal vision and under a deuteranope simulation. The floor is
 *             15; below it colour alone cannot carry the distinction and a second
 *             channel — an icon, a label, a hatch — is mandatory rather than
 *             decorative.
 *
 * A failure is printed and exits non-zero. A distinction that is BELOW the floor on
 * purpose is declared in `TOLERATED` with the second channel that carries it, so the
 * exemption is a statement in this file rather than a silence.
 */

/* --- colour maths ------------------------------------------------------- */

function srgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const linear = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminance(hex) {
  const [r, g, b] = srgb(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** sRGB → CIE Lab, D65. */
function lab(hex) {
  const [r, g, b] = srgb(hex).map(linear);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a, b) {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** Brettel-style deuteranope simulation, sufficient for a separation floor. */
function deuteranope(hex) {
  const [r, g, b] = srgb(hex).map(linear);
  const sim = [
    0.625 * r + 0.7 * g + 0.0 * b,
    0.7 * r + 0.3 * g + 0.0 * b,
    0.0 * r + 0.3 * g + 0.7 * b,
  ];
  const back = (v) => {
    const c = Math.min(1, Math.max(0, v));
    const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(s * 255);
  };
  return `#${sim
    .map(back)
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;
}

/* --- the tokens under test ---------------------------------------------- */

const THEMES = {
  light: {
    bg: '#fbfcfc',
    surface: '#ffffff',
    surfaceSubtle: '#f1f6f5',
    ink: '#193440',
    inkStrong: '#102d3b',
    muted: '#536a72',
    border: '#dbe5e3',
    borderStrong: '#c3d3d0',
    accent: '#216c5d',
    accentSoft: '#e7f3ed',
    brandInk: '#102e3c',
    band: {
      LOW: { mark: '#0ca30c', ink: '#24664f', surface: '#e6f3ea' },
      MEDIUM: { mark: '#fab219', ink: '#8a5c14', surface: '#fff2d7' },
      HIGH: { mark: '#ec835a', ink: '#9a4b20', surface: '#fff0e2' },
      CRITICAL: { mark: '#d03b3b', ink: '#ae3737', surface: '#fdf0ee' },
    },
    venue: { sdex: '#2a78d6', amm: '#eb6834' },
    unmeasured: { mark: '#626f77', surface: '#f1f3f4' },
    confidence: { full: '#193440', partial: '#536a72' },
  },
  dark: {
    bg: '#0a1215',
    surface: '#101c21',
    surfaceSubtle: '#16252b',
    ink: '#d5e3e7',
    inkStrong: '#f2f8f9',
    muted: '#9bb0b8',
    border: '#22333a',
    borderStrong: '#375059',
    accent: '#53c7a5',
    accentSoft: '#123028',
    brandInk: '#9fe3cd',
    band: {
      LOW: { mark: '#2fb862', ink: '#6bdc9b', surface: '#0f2a20' },
      MEDIUM: { mark: '#efb02a', ink: '#f2c257', surface: '#2e2309' },
      HIGH: { mark: '#f0834a', ink: '#f9a175', surface: '#33200f' },
      CRITICAL: { mark: '#e5514f', ink: '#ff8b86', surface: '#381718' },
    },
    venue: { sdex: '#68a8f0', amm: '#ff8d51' },
    unmeasured: { mark: '#8ba0a8', surface: '#1a272d' },
    confidence: { full: '#f2f8f9', partial: '#9bb0b8' },
  },
};

/**
 * Checks that do not clear their floor, and the second channel that carries the
 * distinction instead. Colour is never the only signal for any of these, so each
 * entry names what does the carrying. An entry here is a design statement, not a
 * waiver: remove the second channel and the exemption stops being true.
 *
 * The three light-theme entries are properties of the inherited light palette, not
 * of the dark one added beside it. The dark theme clears 3:1 on all four band marks.
 */
const TOLERATED = {
  'light:band MEDIUM mark on surface':
    'the band word and its own icon silhouette; the hue never appears without both',
  'light:band HIGH mark on surface':
    'the band word and its own icon silhouette; the hue never appears without both',
  'light:band MEDIUM/HIGH mark':
    'a different icon silhouette and the band word',
  'light:band HIGH/CRITICAL mark':
    'a different icon silhouette and the band word',
  'dark:band MEDIUM/HIGH mark': 'a different icon silhouette and the band word',
  'dark:band HIGH/CRITICAL mark':
    'a different icon silhouette and the band word',
};

const SEPARATION_FLOOR = 15;

/**
 * A structural hairline — a table rule, a card edge — is decoration under WCAG 1.4.11,
 * which governs marks that identify a UI COMPONENT or carry data. Holding a rule to
 * 3:1 would force near-black lines through a table of sixty-one rows and make the grid
 * shout louder than the figures in it. So it gets a floor of our own: visible against
 * its surface, and nothing is ever communicated by a border alone.
 */
const BOUNDARY_FLOOR = 1.5;

const failures = [];
const rows = [];

function checkContrast(theme, name, fg, bg, floor) {
  const ratio = contrast(fg, bg);
  const tolerated = Object.hasOwn(TOLERATED, `${theme}:${name}`);
  const ok = ratio >= floor || tolerated;
  rows.push([
    theme,
    'contrast',
    name,
    `${ratio.toFixed(2)}:1`,
    tolerated ? 'second channel' : `>=${floor}`,
    ok,
  ]);
  if (!ok)
    failures.push(
      `${theme}: ${name} is ${ratio.toFixed(2)}:1, needs ${floor}:1`,
    );
}

function checkSeparation(theme, name, a, b) {
  const normal = deltaE(a, b);
  const deutan = deltaE(deuteranope(a), deuteranope(b));
  const worst = Math.min(normal, deutan);
  const tolerated = Object.hasOwn(TOLERATED, `${theme}:${name}`);
  const ok = worst >= SEPARATION_FLOOR || tolerated;
  rows.push([
    theme,
    'separation',
    name,
    `dE ${normal.toFixed(1)} / deutan ${deutan.toFixed(1)}`,
    tolerated ? 'second channel' : `>=${SEPARATION_FLOOR}`,
    ok,
  ]);
  if (!ok)
    failures.push(`${theme}: ${name} separates by only ${worst.toFixed(1)}`);
}

for (const [theme, t] of Object.entries(THEMES)) {
  // Body and heading text on both surfaces a page uses.
  checkContrast(theme, 'ink on bg', t.ink, t.bg, 4.5);
  checkContrast(theme, 'ink on surface', t.ink, t.surface, 4.5);
  checkContrast(theme, 'ink-strong on surface', t.inkStrong, t.surface, 4.5);
  checkContrast(theme, 'muted on bg', t.muted, t.bg, 4.5);
  checkContrast(theme, 'muted on surface', t.muted, t.surface, 4.5);
  checkContrast(
    theme,
    'muted on surface-subtle',
    t.muted,
    t.surfaceSubtle,
    4.5,
  );
  checkContrast(theme, 'accent on surface', t.accent, t.surface, 4.5);
  // The wordmark and the active nav item. `--keel-brand` is a SURFACE colour and is
  // unreadable as text in dark, which is why this is a token of its own.
  checkContrast(theme, 'brand-ink on surface', t.brandInk, t.surface, 4.5);
  checkContrast(
    theme,
    'brand-ink on accent-soft',
    t.brandInk,
    t.accentSoft,
    4.5,
  );
  // A hairline is decoration; see BOUNDARY_FLOOR for why it is not held to 3:1.
  checkContrast(
    theme,
    'border-strong on surface',
    t.borderStrong,
    t.surface,
    BOUNDARY_FLOOR,
  );
  checkContrast(theme, 'border on surface', t.border, t.surface, 1.1);

  for (const [band, token] of Object.entries(t.band)) {
    // A band label sits on its own tint inside a chip, and on the plain surface when
    // it is a figure rather than a chip. Both have to be readable.
    checkContrast(
      theme,
      `band ${band} ink on its surface`,
      token.ink,
      token.surface,
      4.5,
    );
    checkContrast(
      theme,
      `band ${band} ink on surface`,
      token.ink,
      t.surface,
      4.5,
    );
    // The mark is a non-text carrier of meaning: the treemap tile, the chip icon.
    checkContrast(
      theme,
      `band ${band} mark on surface`,
      token.mark,
      t.surface,
      3,
    );
  }

  const bands = Object.entries(t.band);
  for (let i = 0; i < bands.length - 1; i += 1) {
    checkSeparation(
      theme,
      `band ${bands[i][0]}/${bands[i + 1][0]} mark`,
      bands[i][1].mark,
      bands[i + 1][1].mark,
    );
  }

  checkSeparation(theme, 'venue SDEX/AMM', t.venue.sdex, t.venue.amm);
  checkContrast(theme, 'venue SDEX on surface', t.venue.sdex, t.surface, 3);
  checkContrast(theme, 'venue AMM on surface', t.venue.amm, t.surface, 3);

  checkContrast(
    theme,
    'unmeasured mark on surface',
    t.unmeasured.mark,
    t.surface,
    3,
  );
  checkContrast(
    theme,
    'confidence partial on surface',
    t.confidence.partial,
    t.surface,
    4.5,
  );
  checkContrast(
    theme,
    'confidence full on surface',
    t.confidence.full,
    t.surface,
    4.5,
  );
}

/* --- report -------------------------------------------------------------- */

const width = (i) => Math.max(...rows.map((r) => String(r[i]).length));
const w = [0, 1, 2, 3, 4].map(width);
for (const r of rows) {
  const mark = r[5] ? 'ok  ' : 'FAIL';
  console.log(
    `${mark} ${String(r[0]).padEnd(w[0])}  ${String(r[1]).padEnd(w[1])}  ${String(r[2]).padEnd(w[2])}  ${String(r[3]).padEnd(w[3])}  ${String(r[4]).padEnd(w[4])}`,
  );
}

console.log('');
for (const [name, channel] of Object.entries(TOLERATED)) {
  console.log(`tolerated: ${name} — carried by ${channel}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('\nEvery token clears its floor.');
