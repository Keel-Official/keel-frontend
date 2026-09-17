import type { HistoryPoint } from '@/lib/api/types';
import type { Flag } from '@/lib/format/flags';
import { BAND_TOKENS, UNMEASURED_TOKEN } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';

/**
 * When each check started and stopped firing.
 *
 * The detail view answers "which checks fired" for one reading. This answers something
 * a single reading cannot: whether a flag has been firing all along or started on
 * Tuesday. For an asset being considered as collateral those are different facts.
 *
 * Only flags that fired at least once in the window get a row. A row of nothing for
 * every flag in the enum would bury the ones that matter, and a flag that never fired
 * here is NOT a flag that came back clear — the list endpoint does not report what
 * could not be evaluated, and neither does a history point, so absence from this view
 * means "not in this window's flag lists" and nothing stronger.
 */

export interface FlagTimelineProps {
  points: readonly HistoryPoint[];
  className?: string;
}

export function FlagTimeline({ points, className }: FlagTimelineProps) {
  const everFired: Flag[] = [];
  for (const point of points) {
    for (const flag of point.flags) {
      if (!everFired.includes(flag)) everFired.push(flag);
    }
  }

  if (everFired.length === 0) {
    return (
      <p className={cn('text-sm text-[var(--keel-muted)]', className)}>
        No check fired at any reading in this window. That is not the same as every
        check having run: a history point lists what fired, not what could not be
        evaluated.
      </p>
    );
  }

  // Firing on the most readings first: the persistent findings lead.
  const rows = everFired
    .map((flag) => ({
      flag,
      firing: points.map((point) => point.flags.includes(flag)),
      count: points.filter((point) => point.flags.includes(flag)).length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {rows.map((row) => (
        <div
          key={row.flag}
          className="grid grid-cols-[minmax(0,14rem)_1fr_auto] items-center gap-3"
        >
          <code className="tabular truncate text-xs text-[var(--keel-ink)]" title={row.flag}>
            {row.flag}
          </code>

          <div
            className="flex h-3 overflow-hidden rounded-xs border border-[var(--keel-border)]"
            role="img"
            aria-label={`${row.flag} fired at ${row.count} of ${points.length} readings`}
          >
            {row.firing.map((on, i) => (
              <span
                key={i}
                className="h-full flex-1"
                style={{
                  backgroundColor: on
                    ? BAND_TOKENS.HIGH.mark
                    : 'var(--keel-surface-subtle)',
                }}
              />
            ))}
          </div>

          <span
            className="tabular text-xs whitespace-nowrap"
            style={{
              color:
                row.count === points.length
                  ? BAND_TOKENS.HIGH.ink
                  : UNMEASURED_TOKEN.mark,
            }}
          >
            {row.count === points.length
              ? 'throughout'
              : `${row.count} of ${points.length}`}
          </span>
        </div>
      ))}
    </div>
  );
}
