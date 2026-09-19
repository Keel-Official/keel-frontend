import type { AssetSummary } from '../api/types';
import { BAND_ORDER_SEVERE_FIRST } from '../design/tokens';
import type { Band } from '../format/flags';
import type { AssetQuery } from '../url/asset-query';

import { sortAssets } from './list';

/**
 * The monitored set cut into its bands.
 *
 * The band is the only classification the engine makes — `GET /assets` takes `band`,
 * `hasFlag`, `limit` and `offset` and nothing else — so it is the only grouping this
 * page can draw without inventing a taxonomy the backend never published.
 *
 * EVERY BAND IS RETURNED, INCLUDING AN EMPTY ONE. A band holding nothing at this ledger
 * is a finding about the scan, and returning it makes that a rendered, testable state
 * rather than a section that silently is not there.
 */

/** Rows shown per band before the link to that band's own view. Layout, not URL state. */
export const PREVIEW_SIZE = 4;

export interface BandGroup {
  readonly band: Band;
  /** Every row of this band, after the band, flag and text filters. */
  readonly rows: readonly AssetSummary[];
  /** The rows actually rendered. Equals `rows` when nothing is held back. */
  readonly preview: readonly AssetSummary[];
  /** How many rows the preview leaves out. Zero when it shows everything. */
  readonly hidden: number;
  /** Rows whose band is a floor rather than a verdict. Counting, not arithmetic. */
  readonly partial: number;
}

/**
 * The order inside one section.
 *
 * `sort: 'band'` is the default and says nothing once the rows are already grouped by
 * band, so it falls back to the thinnest market first — which is what four rows out of
 * thirty-nine should lead with. Any other ordering the reader chose is kept.
 */
export function previewOrder(
  rows: readonly AssetSummary[],
  query: AssetQuery,
): readonly AssetSummary[] {
  if (query.sort !== 'band') return rows;
  return sortAssets(rows, 'depth', 'asc');
}

export function groupByBand(
  rows: readonly AssetSummary[],
  query: AssetQuery,
  options: { previewSize?: number } = {},
): readonly BandGroup[] {
  const previewSize = options.previewSize ?? PREVIEW_SIZE;

  return BAND_ORDER_SEVERE_FIRST.map((band) => {
    const ordered = previewOrder(
      rows.filter((row) => row.band === band),
      query,
    );
    const preview = ordered.slice(0, previewSize);

    return {
      band,
      rows: ordered,
      preview,
      hidden: ordered.length - preview.length,
      partial: ordered.filter((row) => row.bandConfidence === 'partial').length,
    };
  });
}
