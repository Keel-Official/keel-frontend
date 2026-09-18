import { Ban, Check } from 'lucide-react';

import type { ManipulationCost } from '@/lib/keel/api/types';
import {
  classifyManipulation,
  type ManipulationOutcome,
} from '@/lib/keel/format/cost';
import { UNMEASURED_TOKEN } from '@/lib/keel/design/tokens';
import { cn } from '@/lib/keel/utils';

import { Value } from './value';

/**
 * A table, not a chart.
 *
 * Cost spans several orders of magnitude across the four deltas, so a bar chart of it
 * communicates nothing: one bar fills the row and three are invisible.
 *
 * Reachability is a column, never a footnote. `cost: "0"` with `reachable: true` means
 * the target is free to reach; `cost: "0"` with `reachable: false` means there is no
 * liquidity at all. Those are opposite findings. And a figure on an unreachable rung is
 * how far the book goes, not what the move costs, so it is not typeset as a price.
 *
 * `manipulationCostOrderbookOnly` is bounded above by `manipulationCostCombined`: more
 * venues can only absorb an order at the same price or better. Both are shown so a
 * reader can see how much of the resistance comes from the pool.
 */

export interface ManipulationTableProps {
  combined: readonly ManipulationCost[];
  orderbookOnly: readonly ManipulationCost[];
  quoteCode: string;
  className?: string;
}

export function ManipulationTable({
  combined,
  orderbookOnly,
  quoteCode,
  className,
}: ManipulationTableProps) {
  const orderbookByDelta = new Map(
    orderbookOnly.map((rung) => [rung.delta, rung]),
  );

  return (
    // `relative` is load-bearing, not decoration. Every figure in this table carries an
    // absolutely positioned screen-reader note, and an absolutely positioned element is
    // NOT clipped by an ancestor's overflow unless that ancestor is its containing
    // block. Without a positioned wrapper those notes resolve against the viewport,
    // sit at the x offset they would have had in a 434px-wide table, and widen the
    // whole page at 360px even though the table itself scrolls correctly.
    <div
      // A region that scrolls has to be reachable by keyboard: a reader who cannot use
      // a pointer has no other way to bring the right-hand columns into view. The role
      // and the label are what make the tab stop announce itself as something other
      // than a stray focusable div.
      tabIndex={0}
      role="region"
      aria-label="Cost to move the price, scrollable"
      className={cn(
        'relative overflow-x-auto rounded-lg border border-[var(--keel-border)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Cost to move the price by each delta, through all venues and through
          the order book alone, with whether the target is reachable at all.
        </caption>
        <thead>
          <tr className="border-b border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] text-[var(--keel-muted)]">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Move
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Target price
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Cost, all venues
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Cost, order book only
            </th>
          </tr>
        </thead>
        <tbody>
          {combined.map((rung) => {
            const all = classifyManipulation(rung, quoteCode);
            const book = orderbookByDelta.get(rung.delta);

            return (
              <tr
                key={rung.delta}
                className="border-b border-[var(--keel-border)] last:border-0"
              >
                <th
                  scope="row"
                  className="px-3 py-2 text-left font-medium tabular"
                >
                  {formatDelta(rung.delta)}
                </th>
                <td className="px-3 py-2 text-right">
                  <Value value={all.targetPrice} maxFractionDigits={6} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Outcome outcome={all} />
                </td>
                <td className="px-3 py-2 text-right">
                  {book === undefined ? (
                    <span className="italic text-[var(--unmeasured)]">
                      not reported
                    </span>
                  ) : (
                    <Outcome outcome={classifyManipulation(book, quoteCode)} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Outcome({ outcome }: { outcome: ManipulationOutcome }) {
  if (outcome.kind === 'unreachable') {
    return (
      <span className="inline-flex flex-col items-end gap-0.5">
        <span
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: UNMEASURED_TOKEN.mark }}
        >
          <Ban aria-hidden="true" className="size-3.5" />
          unreachable
        </span>
        <span className="text-xs text-[var(--keel-muted)]">
          book ends at <Value value={outcome.cost} maxFractionDigits={2} />
        </span>
      </span>
    );
  }

  if (outcome.kind === 'free') {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-[var(--band-critical-ink)]">
        <Check aria-hidden="true" className="size-3.5" />
        free to reach
      </span>
    );
  }

  return <Value value={outcome.cost} maxFractionDigits={2} />;
}

/** The delta is a contract enum: 0.5, 1, 10 or 100 per cent. */
function formatDelta(delta: ManipulationCost['delta']): string {
  return `${delta}%`;
}
