import Decimal from 'decimal.js';

const Exact = Decimal.clone({ precision: 64, rounding: Decimal.ROUND_HALF_UP });

export function formatAmount(value: string | null, places?: number): string {
  if (value === null) return 'Not available';
  const decimal = new Exact(value);
  const text =
    places === undefined ? decimal.toFixed() : decimal.toFixed(places);
  const [integer, fraction] = text.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function percent(delta: number): string {
  return new Exact(delta).times(100).toFixed();
}

/**
 * A move, as a percentage.
 *
 * Small moves keep three significant digits so they never round to a zero nobody
 * measured; large ones keep two decimals so a hundredfold spike is not rounded into a
 * different number. Shared, because the backtest page and the landing preview of it have
 * to print the same fraction the same way.
 */
export function movePercent(fraction: string): string {
  const value = new Exact(fraction).times(100);
  return value.gte(1)
    ? `${formatAmount(value.toFixed(2))}%`
    : `${value.toSignificantDigits(3).toFixed()}%`;
}

export function sourceContribution(sdex: string, amm: string) {
  const total = new Exact(sdex).plus(amm);
  if (total.isZero()) return null;
  const sdexShare = new Exact(sdex).div(total).times(100).toDecimalPlaces(1);
  return {
    sdex: sdexShare.toFixed(),
    amm: new Exact(100).minus(sdexShare).toFixed(),
  };
}

// Numbers are returned only for CSS/SVG geometry. Labels use source strings.
export function geometryRatio(value: string, maximum: string): number {
  if (new Exact(maximum).isZero()) return 0;
  return new Exact(value).div(maximum).times(100).toNumber();
}

export function manipulationLabel(cost: string, reachable: boolean): string {
  if (!reachable)
    return new Exact(cost).isZero()
      ? 'Not reachable; no liquidity'
      : 'Not reachable; book exhausted';
  return new Exact(cost).isZero() ? 'Reachable at zero cost' : 'Reachable';
}

export function splitHistory<T extends { ledgerSeq: number }>(
  points: T[],
  gaps: { from: number; to: number }[],
): T[][] {
  const segments: T[][] = [];
  for (const point of points) {
    if (
      gaps.some(
        (gap) => point.ledgerSeq >= gap.from && point.ledgerSeq <= gap.to,
      )
    )
      continue;
    const segment = segments.at(-1);
    const previous = segment?.at(-1);
    if (
      !previous ||
      gaps.some(
        (gap) => previous.ledgerSeq < gap.to && point.ledgerSeq > gap.from,
      )
    )
      segments.push([point]);
    else segment!.push(point);
  }
  return segments;
}

export const sourceLabels = {
  horizon: 'Horizon',
  hubble: 'Hubble · historical reading',
  'offers-implied': 'Reconstructed from posted offers',
  'trades-implied': 'Lower bound from executed trades',
} as const;
