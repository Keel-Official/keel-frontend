import type { KeelValue } from '@/lib/format/value';
import { cn } from '@/lib/utils';

import { Value } from './value';

/**
 * The row of figures a page opens with.
 *
 * Every numeric tile goes through the value component, so a KPI the engine did not
 * produce reads as unmeasured rather than as a zero. A strip of large confident zeros
 * is exactly the failure this product exists to report.
 *
 * A tile is a number and its name, not a chart. There is no sparkline, no delta arrow,
 * and no comparison against a previous period: the API serves neither a previous
 * period nor a change, and deriving one here would be arithmetic on a value the engine
 * owns.
 */

interface KpiBase {
  readonly key: string;
  readonly label: string;
  /** A short factual note under the figure, such as where it came from. */
  readonly note?: string;
}

/** A figure the engine computed. */
export interface KpiValueItem extends KpiBase {
  readonly value: KeelValue;
  readonly maxFractionDigits?: number;
}

/**
 * A non-numeric reading, such as a methodology version or an engine status. It is not
 * a decimal, so it does not go through the decimal formatter; `null` still has to read
 * as absent rather than as an empty tile.
 */
export interface KpiTextItem extends KpiBase {
  readonly text: string | null;
}

export type KpiItem = KpiValueItem | KpiTextItem;

export interface KpiStripProps {
  items: readonly KpiItem[];
  className?: string;
}

function isValueItem(item: KpiItem): item is KpiValueItem {
  return 'value' in item;
}

export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[var(--keel-border)] bg-[var(--keel-border)]',
        'sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.key} className="bg-[var(--keel-surface)] px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-[var(--keel-muted)] uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 text-2xl leading-tight break-words text-[var(--keel-ink-strong)]">
            {isValueItem(item) ? (
              <Value value={item.value} maxFractionDigits={item.maxFractionDigits} />
            ) : item.text === null ? (
              <span className="text-base italic text-[var(--unmeasured)]">
                not reported
              </span>
            ) : (
              <span className="tabular text-xl">{item.text}</span>
            )}
            {/* Inside the dd: a div within a dl may contain only dt and dd, so a
                sibling paragraph makes the definition list invalid. */}
            {item.note ? (
              <p className="mt-1 text-xs text-[var(--keel-muted)]">{item.note}</p>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
