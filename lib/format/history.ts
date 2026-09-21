import Decimal from 'decimal.js';
import daily from '../keel/fixtures/february-evidence.json';

// These are observed trade-leg price spans, not depth estimates or risk bands.
export const februaryPoints = daily.map((row) => ({
  day: row.day!,
  movement:
    row.max_delta_within_leg === null
      ? null
      : new Decimal(row.max_delta_within_leg).times(100).toFixed(),
}));
