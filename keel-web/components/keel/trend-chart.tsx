import { plotSeries, sharedExtent, type Gap, type SeriesPoint } from '@/lib/chart/geometry';
import { classify } from '@/lib/format/value';
import { cn } from '@/lib/utils';

import { Value } from './value';

/**
 * A line per metric, one source per chart, gaps drawn as gaps.
 *
 * WHY THE SEQUENTIAL RAMP AND NOT THE CATEGORICAL ONE. The three depth rungs are
 * ordered: two per cent is inside five is inside ten. A categorical palette says "these
 * are different things"; a sequential one says "these are the same thing at increasing
 * magnitude", which is what they are. The categorical slots stay reserved for SDEX and
 * AMM, which really are different venues.
 *
 * Every number a reader sees comes from the served string. The geometry module converts
 * for coordinates only, and nothing converted there is ever printed.
 *
 * No second axis. Two measures of different scale get two charts.
 */

export interface TrendSeries {
  readonly key: string;
  readonly label: string;
  readonly colour: string;
  readonly points: readonly SeriesPoint[];
}

export interface TrendChartProps {
  series: readonly TrendSeries[];
  gaps?: readonly Gap[];
  /** The unit every series on this chart is denominated in. */
  unit: string | null;
  /** Taken from the first and last point that came back, never from the range asked for. */
  fromLabel: string;
  toLabel: string;
  className?: string;
}

const WIDTH = 720;
const HEIGHT = 180;
const PAD = 6;

export function TrendChart({
  series,
  gaps,
  unit,
  fromLabel,
  toLabel,
  className,
}: TrendChartProps) {
  // One extent across every series on the chart, so the lines are comparable.
  const extent = sharedExtent(series.map((s) => s.points));
  if (extent === null) {
    return (
      <p className={cn('text-sm text-[var(--unmeasured)] italic', className)}>
        No point in this range carried a value.
      </p>
    );
  }

  const plotted = series.map((s) => ({
    ...s,
    plot: plotSeries(s.points, { gaps, min: extent.min, max: extent.max }),
    latest: [...s.points].reverse().find((p) => p.value !== null && p.value !== undefined),
  }));

  const toX = (x: number): number => PAD + x * (WIDTH - PAD * 2);
  const toY = (y: number): number => HEIGHT - PAD - y * (HEIGHT - PAD * 2);

  return (
    <figure className={cn('m-0', className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full rounded-md border border-[var(--keel-border)] bg-[var(--keel-surface)]"
        role="img"
        aria-label={`Trend from ${fromLabel} to ${toLabel}. Values are listed beneath the chart.`}
      >
        {/* Recessive gridlines: they orient, they do not compete with the data. */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={PAD}
            x2={WIDTH - PAD}
            y1={toY(t)}
            y2={toY(t)}
            stroke="var(--keel-border)"
            strokeWidth={1}
          />
        ))}

        {plotted.map((s) =>
          s.plot.segments.map((segment, i) => (
            <polyline
              key={`${s.key}-${i}`}
              points={segment.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ')}
              fill="none"
              stroke={s.colour}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )),
        )}

        {/* A single-point run has no line to draw, so it gets a dot instead of vanishing. */}
        {plotted.map((s) =>
          s.plot.segments
            .filter((segment) => segment.length === 1)
            .map((segment, i) => (
              <circle
                key={`${s.key}-dot-${i}`}
                cx={toX(segment[0].x)}
                cy={toY(segment[0].y)}
                r={3}
                fill={s.colour}
              />
            )),
        )}
      </svg>

      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-[var(--keel-muted)]">
        <span className="tabular">
          {fromLabel} — {toLabel}
        </span>
        <span>
          {series.length === 1 ? null : 'One scale across every line on this chart'}
        </span>
      </figcaption>

      {/* Identity is never colour alone: each series is named, with its latest value. */}
      <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {plotted.map((s) => (
          <div key={s.key} className="flex items-baseline gap-2">
            <dt className="flex items-center gap-1.5 text-[var(--keel-muted)]">
              <span
                aria-hidden="true"
                className="inline-block size-2.5 rounded-xs"
                style={{ backgroundColor: s.colour }}
              />
              {s.label}
            </dt>
            <dd>
              <Value value={classify(s.latest?.value, unit)} maxFractionDigits={2} />
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
