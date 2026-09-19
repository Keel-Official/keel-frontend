import type { Fetched } from '../api/server';
import type { HistoryPoint, HistoryResponse } from '../api/types';
import type { Gap } from '../chart/geometry';
import type { DataSource } from '../format/flags';

import type { HistoryRangeKey, HistoryResolution } from './history-range';
import {
  bandMix,
  summariseWindow,
  type BandMix,
  type WindowSummary,
} from './window-summary';

/**
 * One row's stored series, as five states a cell can render.
 *
 * The sixth state is the absence of an entry in the map: this view did not ask for a
 * series for this row. That is NOT `empty`, which means the engine answered and holds
 * nothing in this window, and neither is a zero. A window cell that rendered any of the
 * three the same way would be the false-confidence bug this product exists to prevent.
 */
export type RowSeries =
  | { readonly state: 'pending' }
  | { readonly state: 'ready'; readonly window: RowWindow }
  | { readonly state: 'empty' }
  | { readonly state: 'failed'; readonly message: string };

export interface RowWindow {
  readonly range: HistoryRangeKey;
  readonly resolution: HistoryResolution;
  /** One request is one source, and the response names it back. */
  readonly source: DataSource;
  readonly points: readonly HistoryPoint[];
  readonly gaps: readonly Gap[];
  /** The 5% buy side, which is the figure the snapshot column already shows. */
  readonly depth: WindowSummary;
  readonly bands: BandMix;
}

export function readRowSeries(
  fetched: Fetched<HistoryResponse>,
  range: HistoryRangeKey,
): RowSeries {
  // The engine's own message, verbatim. A row does not paraphrase a failure.
  if (fetched.failure !== null) {
    return { state: 'failed', message: fetched.failure.message };
  }
  const data = fetched.data;
  if (data === null) return { state: 'failed', message: 'No response body.' };

  const points = data.points ?? [];
  if (points.length === 0) return { state: 'empty' };

  const gaps = data.gaps ?? [];

  return {
    state: 'ready',
    window: {
      range,
      resolution: data.resolution,
      source: data.dataSource,
      points,
      gaps,
      depth: summariseWindow(points, (point) => point.depth5PctBuySide, {
        gaps,
      }),
      bands: bandMix(points),
    },
  };
}
