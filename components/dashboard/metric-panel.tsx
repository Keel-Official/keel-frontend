import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import type { HistoryPoint } from '@/lib/keel/api/types';
import type { HistoryMetric } from '@/lib/keel/assets/history-range';
import { summariseWindow } from '@/lib/keel/assets/window-summary';
import type { Gap } from '@/lib/keel/chart/geometry';
import { classify } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { TrendChart, type TrendSeries } from './trend-chart';
import { Value } from './value';

/**
 * An asset's stored series, as a row of measures over one full-size chart.
 *
 * The four measures used to sit in a two-by-two grid of small charts, each with its own
 * heading, note, legend and footer. Every one of them was legible and none of them was
 * readable at a glance. This is the analytics pattern instead: each measure is a tab
 * that states its latest served figure and which way it moved, and the one a reader
 * picks gets the whole width. The tabs are links, so the chart in front of a reader is
 * still a URL they can send.
 *
 * Nothing here computes a financial value. The figure on a tab is the last reading the
 * engine served for that measure, and the direction is settled by comparing the first
 * and last served strings digit by digit — see `summariseWindow`.
 */

export interface MetricDefinition {
  readonly key: HistoryMetric;
  /** What the tab says. Short: four of these share a row. */
  readonly label: string;
  /** The chart's own heading when this tab is chosen. */
  readonly title: string;
  /** One sentence on what the measure is, or what it is not. */
  readonly note: string;
  /** The figure the tab reports. For a chart of several rungs, the one it ranks on. */
  readonly pick: (point: HistoryPoint) => string | null | undefined;
  readonly series: readonly TrendSeries[];
  readonly maxFractionDigits?: number;
}

export interface MetricPanelProps {
  metrics: readonly MetricDefinition[];
  active: HistoryMetric;
  href: (key: HistoryMetric) => string;
  points: readonly HistoryPoint[];
  gaps: readonly Gap[];
  unit: string;
  fromLabel: string;
  toLabel: string;
  /** Said under the chart: how many readings, from which source. */
  footer?: React.ReactNode;
  className?: string;
}

export function MetricPanel({
  metrics,
  active,
  href,
  points,
  gaps,
  unit,
  fromLabel,
  toLabel,
  footer,
  className,
}: MetricPanelProps) {
  const chosen = metrics.find((m) => m.key === active) ?? metrics[0];

  return (
    <section
      aria-labelledby="metric-title"
      className={cn('keel-panel min-w-0', className)}
    >
      <nav
        aria-label="Measure"
        className="grid grid-cols-2 gap-1.5 rounded-t-[var(--radius)] border-b border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] p-1.5 lg:grid-cols-4"
      >
        {metrics.map((metric) => (
          <MetricTab
            key={metric.key}
            metric={metric}
            active={metric.key === chosen.key}
            href={href(metric.key)}
            points={points}
            gaps={gaps}
            unit={unit}
          />
        ))}
      </nav>

      <div className="p-4 sm:p-5">
        <h3
          id="metric-title"
          className="text-base font-semibold tracking-[-0.01em] text-[var(--keel-ink-strong)]"
        >
          {chosen.title}
        </h3>
        <p className="mt-0.5 max-w-3xl text-sm text-[var(--keel-muted)]">
          {chosen.note}
        </p>

        <TrendChart
          className="mt-5"
          framed={false}
          unit={unit}
          gaps={gaps}
          fromLabel={fromLabel}
          toLabel={toLabel}
          maxFractionDigits={chosen.maxFractionDigits}
          series={chosen.series}
        />

        {footer ? (
          <div className="mt-4 border-t border-[var(--keel-border)] pt-3 text-xs text-[var(--keel-muted)]">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MetricTab({
  metric,
  active,
  href,
  points,
  gaps,
  unit,
}: {
  metric: MetricDefinition;
  active: boolean;
  href: string;
  points: readonly HistoryPoint[];
  gaps: readonly Gap[];
  unit: string;
}) {
  const summary = summariseWindow(points, metric.pick, { gaps });

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex min-w-0 flex-col gap-1.5 rounded-md border px-3 py-2.5 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
        active
          ? 'border-[var(--keel-border)] bg-[var(--keel-surface)] shadow-[var(--keel-shadow)]'
          : 'border-transparent hover:bg-[var(--keel-surface)]/60',
      )}
    >
      <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <span
          className={cn(
            'text-xs',
            active
              ? 'font-semibold text-[var(--keel-ink-strong)]'
              : 'text-[var(--keel-muted)]',
          )}
        >
          {metric.label}
        </span>
        <Direction direction={summary.direction} />
      </span>
      <span className="text-base leading-tight font-bold break-all text-[var(--keel-ink-strong)] sm:text-lg">
        <Value
          value={classify(summary.last?.value ?? null, unit)}
          // The chart's own default, so the tab and the legend under the chart print
          // the same served figure the same way.
          maxFractionDigits={metric.maxFractionDigits ?? 2}
        />
      </span>
    </Link>
  );
}

/**
 * Which way the measure moved across the window, in words as well as an arrow.
 *
 * Deliberately neutral in colour. Higher depth is good news and a higher price is no
 * news at all, so green-for-up would be a verdict this component has no standing to
 * give.
 */
function Direction({ direction }: { direction: -1 | 0 | 1 | null }) {
  if (direction === null) {
    return (
      <span className="shrink-0 text-xs text-[var(--unmeasured)] italic">
        too few readings
      </span>
    );
  }

  const Icon =
    direction > 0 ? ArrowUpRight : direction < 0 ? ArrowDownRight : ArrowRight;
  const word = direction > 0 ? 'higher' : direction < 0 ? 'lower' : 'flat';

  return (
    <span className="flex shrink-0 items-center gap-0.5 text-xs text-[var(--keel-muted)]">
      <Icon aria-hidden="true" className="size-3.5" />
      <span>{word}</span>
      <span className="sr-only"> than at the start of the window</span>
    </span>
  );
}
