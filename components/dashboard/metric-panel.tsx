import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import type { HistoryPoint } from '@/lib/keel/api/types';
import type { HistoryMetric } from '@/lib/keel/assets/history-range';
import { summariseWindow } from '@/lib/keel/assets/window-summary';
import type { Gap } from '@/lib/keel/chart/geometry';
import { cn } from '@/lib/keel/utils';

import { TrendChart, type TrendSeries } from './trend-chart';

/**
 * An asset's stored series: one full-size chart, and a switch for which measure it draws.
 *
 * The four measures used to sit in a two-by-two grid of small charts, and then on a row
 * of tabs that each printed a figure. Those figures were the last reading in the WINDOW,
 * which on a daily resolution could be a day older than the current reading printed at
 * the top of the page — two numbers under one name. The current figures now live only
 * in the verdict above; this panel is about movement, and says so.
 *
 * Nothing here computes a financial value. The direction is settled by comparing the
 * first and last served strings digit by digit — see `summariseWindow`.
 */

export interface MetricDefinition {
  readonly key: HistoryMetric;
  /** What the switch says. Short: four of these share a row. */
  readonly label: string;
  /** The chart's own heading when this measure is chosen. */
  readonly title: string;
  /** One short sentence on what the measure is, or what it is not. */
  readonly note: string;
  /** The series the direction is read from. For several rungs, the one it ranks on. */
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
  const { direction } = summariseWindow(points, chosen.pick, { gaps });

  return (
    <section
      aria-labelledby="metric-title"
      className={cn('keel-panel min-w-0 p-4 sm:p-5', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h3
            id="metric-title"
            className="text-base font-semibold tracking-[-0.01em] text-[var(--keel-ink-strong)]"
          >
            {chosen.title}
          </h3>
          <p className="mt-0.5 max-w-2xl text-sm text-[var(--keel-muted)]">
            {chosen.note}
          </p>
        </div>

        <nav aria-label="Measure">
          <ul className="flex flex-wrap items-center gap-0.5 rounded-md border border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] p-0.5">
            {metrics.map((metric) => {
              const on = metric.key === chosen.key;
              return (
                <li key={metric.key}>
                  <Link
                    href={href(metric.key)}
                    scroll={false}
                    aria-current={on ? 'true' : undefined}
                    className={cn(
                      'inline-flex min-h-8 items-center rounded-sm px-2.5 text-xs transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
                      on
                        ? 'bg-[var(--keel-surface)] font-bold text-[var(--keel-ink-strong)] shadow-[var(--keel-shadow)]'
                        : 'font-medium text-[var(--keel-muted)] hover:text-[var(--keel-ink-strong)]',
                    )}
                  >
                    {metric.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <Direction direction={direction} />

      <TrendChart
        className="mt-4"
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
    </section>
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
      <p className="mt-3 text-sm text-[var(--unmeasured)] italic">
        Too few readings in this window to show a direction.
      </p>
    );
  }

  const Icon =
    direction > 0 ? ArrowUpRight : direction < 0 ? ArrowDownRight : ArrowRight;
  const word = direction > 0 ? 'Higher' : direction < 0 ? 'Lower' : 'Unchanged';

  return (
    <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--keel-muted)]">
      <Icon
        aria-hidden="true"
        className="size-4 shrink-0 text-[var(--keel-ink)]"
      />
      <span>
        <span className="font-semibold text-[var(--keel-ink-strong)]">
          {word}
        </span>
        {direction === 0
          ? ' across the window'
          : ' at the end of the window than at its start'}
      </span>
    </p>
  );
}
