import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import type { Gap } from '@/lib/keel/chart/geometry';
import { compareDecimalStrings } from '@/lib/keel/format/compare';
import { classify, isMeasured } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { TrendChart, type TrendSeries } from './trend-chart';

/**
 * One measure over time, small enough to sit beside three others.
 *
 * The four series on an asset result — price, buy-side depth, manipulation cost and the
 * collateral ceiling — used to run down the page as four full-width charts with a
 * heading, a paragraph and an axis each. Stacked like that they are read one at a time,
 * which is the one thing a reader does not want here: the interesting moment is when
 * depth falls and the collateral ceiling follows it, and that is invisible when the two
 * are eight hundred pixels apart.
 *
 * In a grid they share a row and a date range, so the shapes can be compared directly.
 * The charts themselves are unchanged — the same `TrendChart`, the same served points,
 * the same gaps drawn as gaps — only shorter, with the range stated once by the frame
 * around them rather than four times.
 *
 * THE FOOTER IS A DIRECTION, NOT A PERCENTAGE. The pattern this borrows from prints
 * "trending up by 5.2%". That would mean subtracting and dividing two decimal strings,
 * and nothing in this codebase computes a financial value. The two endpoints are
 * compared digit by digit through `compareDecimalStrings`, which settles the direction
 * exactly, and the legend above already carries the latest served figure, so a reader
 * who wants the ratio has both numbers to do it with.
 */

export interface ChartCardProps {
  title: string;
  /** One line on what the measure is, or what it is not. */
  note?: string;
  series: readonly TrendSeries[];
  gaps?: readonly Gap[];
  unit: string | null;
  fromLabel: string;
  toLabel: string;
  maxFractionDigits?: number;
  className?: string;
}

export function ChartCard({
  title,
  note,
  series,
  gaps,
  unit,
  fromLabel,
  toLabel,
  maxFractionDigits,
  className,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col rounded-xl border border-[var(--keel-border)] bg-[var(--keel-surface)] p-4',
        className,
      )}
    >
      <h4 className="text-sm font-medium text-[var(--keel-ink-strong)]">
        {title}
      </h4>
      {note ? (
        <p className="mt-1 text-xs text-[var(--keel-muted)]">{note}</p>
      ) : null}

      <div className="mt-3 min-w-0 flex-1">
        <TrendChart
          dense
          unit={unit}
          gaps={gaps}
          fromLabel={fromLabel}
          toLabel={toLabel}
          maxFractionDigits={maxFractionDigits}
          series={series}
        />
      </div>

      <Direction series={series} />
    </section>
  );
}

/**
 * Which way the first series moved across the window.
 *
 * The first, not all of them: on a card with three nested depth rungs they move
 * together, and three arrows saying the same thing is three times the ink for none of
 * the information. A reader who needs each rung has the legend directly above.
 */
function Direction({ series }: { series: readonly TrendSeries[] }) {
  const points = series[0]?.points ?? [];
  const first = points.find((p) => isMeasured(classify(p.value)));
  const last = [...points].reverse().find((p) => isMeasured(classify(p.value)));

  if (!first || !last || first === last) {
    return (
      <p className="mt-3 border-t border-[var(--keel-border)] pt-2.5 text-xs text-[var(--keel-muted)]">
        Not enough readings in this window to show a direction.
      </p>
    );
  }

  const moved = compareDecimalStrings(
    last.value as string,
    first.value as string,
  );
  const Icon =
    moved > 0 ? ArrowUpRight : moved < 0 ? ArrowDownRight : ArrowRight;
  const word = moved > 0 ? 'Higher' : moved < 0 ? 'Lower' : 'Unchanged';

  return (
    <p className="mt-3 flex items-center gap-1.5 border-t border-[var(--keel-border)] pt-2.5 text-xs text-[var(--keel-muted)]">
      <Icon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-[var(--keel-accent)]"
      />
      <span>
        <span className="font-medium text-[var(--keel-ink)]">{word}</span>
        {moved === 0
          ? ' across the window'
          : ' than at the start of the window'}
      </span>
    </p>
  );
}
