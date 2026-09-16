import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  BAND_ORDER,
  BAND_TOKENS,
  CONFIDENCE_TOKENS,
  SEQUENTIAL_RAMP,
  UNMEASURED_TOKEN,
  VENUE_TOKENS,
} from '../lib/design/tokens';
import type { Band } from '../lib/format/flags';

const css = readFileSync('app/globals.css', 'utf8');

/** Reads a custom property's literal value out of the stylesheet. */
function cssVar(name: string): string | null {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8});`).exec(css);
  return match?.[1]?.toLowerCase() ?? null;
}

describe('tokens stay in step with the stylesheet', () => {
  const slugs: Record<Band, string> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  };

  it.each(BAND_ORDER)('%s mark, ink, and surface match globals.css', (band) => {
    const token = BAND_TOKENS[band];
    const slug = slugs[band];
    expect(cssVar(`band-${slug}`)).toBe(token.mark.toLowerCase());
    expect(cssVar(`band-${slug}-ink`)).toBe(token.ink.toLowerCase());
    expect(cssVar(`band-${slug}-surface`)).toBe(token.surface.toLowerCase());
  });

  it('venue marks match globals.css', () => {
    expect(cssVar('venue-sdex')).toBe(VENUE_TOKENS.sdex.mark.toLowerCase());
    expect(cssVar('venue-amm')).toBe(VENUE_TOKENS.amm.mark.toLowerCase());
    expect(cssVar('venue-third')).toBe(VENUE_TOKENS.third.mark.toLowerCase());
  });

  it('the unmeasured token matches globals.css and its hatch class exists', () => {
    expect(cssVar('unmeasured')).toBe(UNMEASURED_TOKEN.mark.toLowerCase());
    expect(cssVar('unmeasured-surface')).toBe(UNMEASURED_TOKEN.surface.toLowerCase());
    expect(css).toContain(`.${UNMEASURED_TOKEN.hatchClassName}`);
  });

  it('every sequential step is declared', () => {
    const declared = [...css.matchAll(/--seq-\d+:\s*(#[0-9a-fA-F]{6});/g)].map((m) =>
      m[1].toLowerCase(),
    );
    expect(declared).toEqual(SEQUENTIAL_RAMP.map((hex) => hex.toLowerCase()));
  });
});

describe('band is never carried by colour alone', () => {
  it('gives every band an icon and a word', () => {
    for (const band of BAND_ORDER) {
      const token = BAND_TOKENS[band];
      expect(token.icon, band).toBeTruthy();
      expect(token.label.length, band).toBeGreaterThan(0);
    }
  });

  it('uses four different silhouettes, not one shape in four colours', () => {
    const icons = BAND_ORDER.map((band) => BAND_TOKENS[band].icon);
    expect(new Set(icons).size).toBe(4);
  });

  it('covers every band exactly once, in severity order', () => {
    expect(BAND_ORDER).toEqual(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
    expect(BAND_ORDER.map((b) => BAND_TOKENS[b].segment)).toEqual([0, 1, 2, 3]);
  });
});

describe('the status palette is reserved', () => {
  const bandMarks = BAND_ORDER.map((band) => BAND_TOKENS[band].mark.toLowerCase());

  it('never reuses a band hue for a venue series', () => {
    for (const venue of Object.values(VENUE_TOKENS)) {
      expect(bandMarks, venue.label).not.toContain(venue.mark.toLowerCase());
    }
  });

  it('never puts a band hue on the sequential ramp', () => {
    for (const step of SEQUENTIAL_RAMP) {
      expect(bandMarks).not.toContain(step.toLowerCase());
    }
  });

  it('keeps the unmeasured state off both scales', () => {
    const mark = UNMEASURED_TOKEN.mark.toLowerCase();
    expect(bandMarks).not.toContain(mark);
    expect(SEQUENTIAL_RAMP.map((s) => s.toLowerCase())).not.toContain(mark);
  });
});

const HEX_DIGITS = '0123456789abcdef';

/**
 * Reads one colour channel. Written without `parseInt` on purpose: the repository
 * bans the numeric conversion functions outright, and a colour channel is not a
 * good enough reason to carve an exception that a monetary value could later slip
 * through. Nothing from the API passes through this file.
 */
function channelByte(hex: string, index: number): number {
  const high = HEX_DIGITS.indexOf(hex[index].toLowerCase());
  const low = HEX_DIGITS.indexOf(hex[index + 1].toLowerCase());
  return high * 16 + low;
}

describe('the sequential ramp is ordered', () => {
  /** Relative luminance, for checking the ramp only. */
  function luminance(hex: string): number {
    const value = hex.replace('#', '');
    const channel = (index: number): number => {
      const c = channelByte(value, index) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  }

  it('gets strictly darker, so a reader can rank it', () => {
    const lums = SEQUENTIAL_RAMP.map(luminance);
    for (let i = 0; i < lums.length - 1; i += 1) {
      expect(lums[i], `${SEQUENTIAL_RAMP[i]} vs ${SEQUENTIAL_RAMP[i + 1]}`).toBeGreaterThan(
        lums[i + 1],
      );
    }
  });

  it('is one hue rather than a rainbow', () => {
    // Every step is blue-dominant: a rainbow ramp cannot be ranked by eye.
    for (const step of SEQUENTIAL_RAMP) {
      const value = step.replace('#', '');
      expect(channelByte(value, 4), step).toBeGreaterThan(channelByte(value, 0));
    }
  });
});

describe('confidence', () => {
  it('names both values without using a band hue', () => {
    const bandMarks = BAND_ORDER.map((band) => BAND_TOKENS[band].mark.toLowerCase());
    for (const token of Object.values(CONFIDENCE_TOKENS)) {
      expect(token.label.length).toBeGreaterThan(0);
      expect(bandMarks).not.toContain(token.ink.toLowerCase());
    }
  });
});
