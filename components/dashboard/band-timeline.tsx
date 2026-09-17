import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import type { HistoryPoint } from '@/lib/keel/api/types';
import type { Band } from '@/lib/keel/format/flags';
import { cn } from '@/lib/keel/utils';

/**
 * The band at each stored reading, as a strip.
 *
 * A single reading cannot tell a thin asset from one that just got thin, and this is
 * the cheapest view that can: the strip changes colour where the engine's verdict
 * changed. It uses the status palette because a band IS a status, and it is the one
 * place that palette is correct for a time series.
 *
 * It is not a line. A band is the worst flag that fired, not a score, so there is
 * nothing between two bands to interpolate and a line would invent it.
 *
 * Colour is not the only channel. The run-length summary beneath names every band that
 * appears and how many readings it holds, so the strip is readable without it.
 */

export interface BandTimelineProps {
  points: readonly HistoryPoint[];
  className?: string;
}

export function BandTimeline({ points, className }: BandTimelineProps) {
  if (points.length === 0) return null;

  const counts = new Map<Band, number>();
  for (const point of points) {
    counts.set(point.band, (counts.get(point.band) ?? 0) + 1);
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        className="flex h-6 w-full overflow-hidden rounded-md border border-[var(--keel-border)]"
        role="img"
        aria-label={`Band at each of ${points.length} readings, oldest first.`}
      >
        {points.map((point, i) => (
          <span
            key={`${point.ledgerSeq}-${i}`}
            className="h-full flex-1"
            style={{ backgroundColor: BAND_TOKENS[point.band].mark }}
            title={`${BAND_TOKENS[point.band].label} at ledger ${point.ledgerSeq}, ${point.ledgerClosedAt}`}
          />
        ))}
      </div>

      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {[...counts.entries()].map(([band, count]) => (
          <div key={band} className="flex items-baseline gap-1.5">
            <dt className="flex items-center gap-1.5 text-[var(--keel-muted)]">
              <span
                aria-hidden="true"
                className="inline-block size-2.5 rounded-xs"
                style={{ backgroundColor: BAND_TOKENS[band].mark }}
              />
              {BAND_TOKENS[band].label}
            </dt>
            <dd className="tabular" style={{ color: BAND_TOKENS[band].ink }}>
              {count} of {points.length}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
