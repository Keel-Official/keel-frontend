import { CircleDashed } from 'lucide-react';

import type { RowSeries } from '@/lib/keel/assets/row-series';
import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import { classify } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { RowSparkline } from './row-sparkline';
import { Value } from './value';

/**
 * The three cells a window adds to a row, and the five states each of them can be in.
 *
 * They are one module because they share the states, and they are shared by the table
 * and the card list because a state rendered two ways is a state that will drift.
 *
 * NOTHING HERE EVER SHOWS A ZERO, A DASH OR AN EMPTY CELL for a reading that does not
 * exist. `pending` (the request is in flight), `empty` (the engine answered and holds
 * nothing in this window), `failed` (the engine said why) and absent (this view did not
 * ask) are four different facts, and a row that blurred them would be reporting
 * confidence the engine never gave.
 */

const DIRECTION_WORDS = {
  '-1': 'Thinner',
  '0': 'Unchanged',
  '1': 'Deeper',
} as const;

function Quiet({ children, title }: { children: string; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 text-xs text-[var(--unmeasured)] italic"
    >
      <CircleDashed aria-hidden="true" className="size-3.5 shrink-0" />
      {children}
    </span>
  );
}

/**
 * The non-ready states, said once.
 *
 * Returns null when the series is ready, so each cell reads
 * `const state = <WindowState …/>; if (state) return state;`
 */
function windowState(series: RowSeries | undefined) {
  if (series === undefined) return <Quiet>not read in this view</Quiet>;
  if (series.state === 'pending') return <Quiet>measuring…</Quiet>;
  if (series.state === 'empty') return <Quiet>no readings stored</Quiet>;
  if (series.state === 'failed')
    // The engine's own words, on the element rather than paraphrased into the cell.
    return <Quiet title={series.message}>series unavailable</Quiet>;
  return null;
}

export interface WindowCellProps {
  series: RowSeries | undefined;
  /** The unit the row's figures are denominated in. Never converted. */
  quoteCode: string;
  className?: string;
}

/**
 * How the depth moved across the window.
 *
 * A DIRECTION AND NOT A PERCENTAGE. Naming the ratio would mean subtracting and
 * dividing two decimal strings, which nothing in this codebase does; the two endpoints
 * are compared digit by digit, which settles the direction exactly, and the low and
 * high beside it are the served figures a reader would do the arithmetic with.
 *
 * One reading is not "unchanged". That is a claim about two.
 */
export function WindowTrendCell({
  series,
  className,
}: Omit<WindowCellProps, 'quoteCode'>) {
  const state = windowState(series);
  if (state !== null) return <span className={className}>{state}</span>;
  if (series?.state !== 'ready') return null;

  const { depth } = series.window;
  const word =
    depth.direction === null
      ? null
      : DIRECTION_WORDS[
          String(depth.direction) as keyof typeof DIRECTION_WORDS
        ];

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <RowSparkline window={series.window} />
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-[var(--keel-ink)]">
          {word ?? 'No comparable reading'}
        </span>
        {/* A break in an 88px line is invisible, so it is also said in words. */}
        {depth.broken ? (
          <span className="text-xs text-[var(--unmeasured)] italic">
            reading missing
          </span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * The worst and best readings in the window, as served.
 *
 * This is what replaces the standard deviation the pattern this borrows from prints. A
 * reader sizing a position does not want the dispersion of the week, they want the
 * thinnest the market got, and that is a string the engine sent rather than a figure
 * derived from several.
 */
export function WindowRangeCell({
  series,
  quoteCode,
  className,
}: WindowCellProps) {
  const state = windowState(series);
  if (state !== null) return <span className={className}>{state}</span>;
  if (series?.state !== 'ready') return null;

  const { depth } = series.window;

  return (
    <span
      className={cn(
        'flex flex-col items-end gap-0.5 text-xs whitespace-nowrap',
        className,
      )}
    >
      <span className="flex items-baseline gap-1.5">
        <span className="text-[var(--keel-muted)]">low</span>
        <Value
          value={classify(depth.low?.value ?? null, quoteCode)}
          maxFractionDigits={2}
        />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-[var(--keel-muted)]">high</span>
        <Value
          value={classify(depth.high?.value ?? null, quoteCode)}
          maxFractionDigits={2}
        />
      </span>
    </span>
  );
}

/**
 * What the engine called this asset at each reading in the window.
 *
 * Counting readings per band is integers, not arithmetic on a decimal, so it is a thing
 * this page may say. It is words and counts rather than a strip of colour: MEDIUM
 * against HIGH separates by a deuteranope delta E far under the floor this system
 * holds, which is why every band on this dashboard carries a word and an icon, and a
 * row of three-pixel segments could carry neither.
 */
export function WindowVerdictCell({
  series,
  className,
}: Omit<WindowCellProps, 'quoteCode'>) {
  const state = windowState(series);
  if (state !== null) return <span className={className}>{state}</span>;
  if (series?.state !== 'ready') return null;

  const { bands } = series.window;
  const shown = bands.counts.slice(0, 2);
  const rest = bands.counts.length - shown.length;

  // A verdict that held is the ordinary case — today it is true of nearly every row —
  // so it is said quietly and without repeating the band, which the section heading and
  // the row's own chip already carry. A verdict that MOVED is the exception this cell
  // exists for, and only that case spends colour and two lines on itself.
  if (!bands.changed && shown[0]) {
    return (
      <span className={cn('text-xs text-[var(--keel-muted)]', className)}>
        {`Held at all ${bands.total} readings`}
      </span>
    );
  }

  return (
    <span className={cn('flex flex-col text-xs', className)}>
      <span className="font-medium text-[var(--keel-ink)]">Verdict moved</span>
      {shown.map((entry, index) => (
        <span key={entry.band}>
          <span style={{ color: BAND_TOKENS[entry.band].ink }}>
            {BAND_TOKENS[entry.band].label}
          </span>
          <span className="text-[var(--keel-muted)]">
            {index === 0
              ? ` at ${entry.count} of ${bands.total}`
              : ` at ${entry.count}`}
          </span>
        </span>
      ))}
      {rest > 0 ? (
        <span className="text-[var(--keel-muted)]">{`+${rest} more`}</span>
      ) : null}
    </span>
  );
}
