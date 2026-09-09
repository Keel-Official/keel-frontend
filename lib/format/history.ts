import Decimal from 'decimal.js';
import daily from '../api/february-evidence.json';

// These are observed trade-leg price spans, not depth estimates or risk bands.
export const februaryPoints = daily.map((row) => ({
  day: row.day!,
  movement:
    row.max_delta_within_leg === null
      ? null
      : new Decimal(row.max_delta_within_leg).times(100).toFixed(),
}));

export function observationSegments(points: typeof februaryPoints) {
  const segments: (typeof februaryPoints)[] = [];
  let current: typeof februaryPoints = [];
  for (const point of points) {
    if (point.movement === null) {
      if (current.length) segments.push(current);
      current = [];
    } else current.push(point);
  }
  if (current.length) segments.push(current);
  return segments;
}
