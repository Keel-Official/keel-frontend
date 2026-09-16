import { describe, expect, it } from 'vitest';

import { calibrationStatement, readThresholds } from '@/lib/format/methodology';

const USDC = 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

/** The thresholds the live engine served on 17 September 2026. */
const LIVE = {
  genuineTradeStaleDays: 30,
  genuineTradeWarnDays: 7,
  holderTop10HighPct: '80',
  holderTop1ExtremePct: '50',
  liquidationDelta: 0.1,
  liquidationHaircut: '0.5',
  manipulationCheapAbsolute: '10000',
  manipulationCheapUnit: USDC,
  manipulationCriticalDelta: 0.5,
  manipulationMargin: '0.25',
  manipulationRatioLowPct: '0.1',
  oracleWindowSeconds: 900,
  priceDivergencePct: '10',
  spreadExtremePct: '20',
  thinDepth5PctAbsolute: '50000',
  thinDepth5PctUnit: USDC,
  washTradeSuspectedPct: '50',
} as const;

function find(groups: ReturnType<typeof readThresholds>, key: string) {
  const group = groups.find((g) => g.key === key);
  if (!group) throw new Error(`no group for ${key}`);
  return group;
}

describe('readThresholds', () => {
  it('renders every served key rather than a list this build knows about', () => {
    // The map is open ended by contract, so an unrecognised key must still appear.
    const groups = readThresholds({ ...LIVE, somethingAddedLater: '42' });
    expect(groups.map((g) => g.key)).toContain('somethingAddedLater');
  });

  it('pairs an absolute threshold with the asset it is denominated in', () => {
    const groups = readThresholds(LIVE);
    const cheap = find(groups, 'manipulationCheapAbsolute');
    expect(cheap.denominatedIn?.code).toBe('USDC');
    expect(cheap.denominatedIn?.raw).toBe(USDC);
  });

  it('does not repeat a unit key that was absorbed into its pair', () => {
    const keys = readThresholds(LIVE).map((g) => g.key);
    expect(keys).not.toContain('manipulationCheapUnit');
    expect(keys).not.toContain('thinDepth5PctUnit');
  });

  it('still shows a unit key that has no sibling, rather than dropping a served value', () => {
    const keys = readThresholds({ orphanUnit: USDC }).map((g) => g.key);
    expect(keys).toEqual(['orphanUnit']);
  });

  it('applies percent only to keys that END in Pct', () => {
    const groups = readThresholds(LIVE);

    const spread = find(groups, 'spreadExtremePct');
    expect(spread.value.kind).toBe('numeric');
    if (spread.value.kind === 'numeric') expect(spread.value.value.unit).toBe('%');

    // thinDepth5PctAbsolute contains "Pct" but does not end in it: it is an absolute
    // figure in an asset, not a percentage.
    const thin = find(groups, 'thinDepth5PctAbsolute');
    if (thin.value.kind === 'numeric') expect(thin.value.value.unit).toBe('USDC');
    // The full pair stays on the row, beside the figure rather than inside it.
    expect(thin.denominatedIn?.raw).toBe(USDC);
  });

  it('gives no unit to a delta, because one suffix covers two scales', () => {
    // liquidationDelta 0.1 matches the depth enum, where deltas are fractions.
    // manipulationCriticalDelta 0.5 matches the manipulation enum, where they are
    // percentages. Labelling both the same way would be wrong for one of them.
    const groups = readThresholds(LIVE);
    for (const key of ['liquidationDelta', 'manipulationCriticalDelta']) {
      const group = find(groups, key);
      if (group.value.kind === 'numeric') expect(group.value.value.unit, key).toBeNull();
    }
  });

  it('keeps a JSON number exact as served', () => {
    const groups = readThresholds(LIVE);
    const window = find(groups, 'oracleWindowSeconds');
    if (window.value.kind === 'numeric') expect(window.value.value.exact).toBe('900');
  });

  it('recognises an asset id and splits the pair', () => {
    const groups = readThresholds({ someUnit: USDC });
    const value = find(groups, 'someUnit').value;
    expect(value.kind).toBe('assetId');
    if (value.kind === 'assetId') {
      expect(value.code).toBe('USDC');
      expect(value.issuer).toHaveLength(56);
    }
  });

  it('shows a non-decimal string as served instead of hiding it as unknown', () => {
    const value = find(readThresholds({ note: 'see DEC-017' }), 'note').value;
    expect(value.kind).toBe('opaque');
    if (value.kind === 'opaque') expect(value.text).toBe('see DEC-017');
  });

  it('reports a null threshold as null rather than as a missing row', () => {
    const value = find(readThresholds({ maybe: null }), 'maybe').value;
    expect(value.kind).toBe('opaque');
    if (value.kind === 'opaque') expect(value.text).toBe('null');
  });

  it('orders keys so the same response always reads the same way', () => {
    const forward = readThresholds(LIVE).map((g) => g.key);
    const reversed = readThresholds(
      Object.fromEntries(Object.entries(LIVE).reverse()),
    ).map((g) => g.key);
    expect(forward).toEqual(reversed);
  });

  it('handles an empty map', () => {
    expect(readThresholds({})).toEqual([]);
  });
});

describe('calibrationStatement', () => {
  it('says plainly that chosen is not calibrated', () => {
    const statement = calibrationStatement(false, 'Chosen from one incident.');
    expect(statement.heading).toContain('not calibrated');
    expect(statement.note).toBe('Chosen from one incident.');
  });

  it('makes a missing note visible rather than rendering nothing', () => {
    expect(calibrationStatement(false, undefined).note).toBeNull();
  });

  it('changes the heading if the engine ever reports calibrated', () => {
    expect(calibrationStatement(true, undefined).heading).toBe(
      'These thresholds are calibrated',
    );
  });
});
