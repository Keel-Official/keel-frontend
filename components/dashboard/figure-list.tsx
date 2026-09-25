import type { KeelValue } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { Value } from './value';

/**
 * A labelled figure list, for the secondary readings on the detail view.
 *
 * The KPI strip opens a page with four large tiles. This is the denser form used
 * inside a section, where a reading is one line and there are more of them than a
 * strip can hold without shrinking the type past legibility.
 *
 * Every numeric row goes through the value component, so a reading the engine did not
 * produce reads as unmeasured rather than as a zero, exactly as it does everywhere
 * else. A row whose reading is a word rather than a decimal — a price source, a data
 * source — passes `text`, and a `null` there still reads as absent instead of
 * collapsing to an empty line.
 */

interface FigureBase {
  readonly key: string;
  readonly label: string;
  /** A short factual note under the reading. */
  readonly note?: React.ReactNode;
}

export interface FigureValueRow extends FigureBase {
  readonly value: KeelValue;
  readonly maxFractionDigits?: number;
}

/**
 * A reading that is a word rather than a decimal. It carries the same three-way
 * distinction the value component makes: a key the response did not send is not the
 * same finding as a key the engine sent as null, and neither is an empty line.
 */
export interface FigureTextRow extends FigureBase {
  readonly text: string | null | undefined;
}

export type FigureRow = FigureValueRow | FigureTextRow;

export interface FigureListProps {
  rows: readonly FigureRow[];
  /** Columns at the widest breakpoint. Two is the default; one suits a narrow column. */
  columns?: 1 | 2;
  className?: string;
}

function isValueRow(row: FigureRow): row is FigureValueRow {
  return 'value' in row;
}

export function FigureList({ rows, columns = 2, className }: FigureListProps) {
  return (
    <dl
      className={cn(
        'grid gap-x-8 gap-y-4',
        columns === 2 ? 'sm:grid-cols-2' : null,
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.key} className="min-w-0">
          <dt className="keel-marker">{row.label}</dt>
          <dd className="mt-0.5 text-base break-words text-[var(--keel-ink-strong)]">
            {isValueRow(row) ? (
              <Value
                value={row.value}
                maxFractionDigits={row.maxFractionDigits}
              />
            ) : row.text === null || row.text === undefined ? (
              <span className="text-sm italic text-[var(--unmeasured)]">
                {row.text === undefined ? 'not reported' : 'not computed'}
              </span>
            ) : (
              <span className="tabular">{row.text}</span>
            )}
            {/* Inside the dd, not beside it: a div within a dl may contain only dt
                and dd, so a sibling <p> makes the list invalid. */}
            {row.note ? (
              <p className="mt-1 text-xs font-normal text-[var(--keel-muted)]">
                {row.note}
              </p>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
