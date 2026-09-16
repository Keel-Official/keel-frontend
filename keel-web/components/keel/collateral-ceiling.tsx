import { ArrowDownToLine, TriangleAlert } from 'lucide-react';

import { BINDING_WORDS, type CollateralCeiling } from '@/lib/format/collateral';
import { cn } from '@/lib/utils';

import { Value } from './value';

/**
 * The ceiling, and the term that produced it, on one line of sight.
 *
 * The ceiling is the minimum of two terms and the contract sends both, because "the
 * minimum alone hides WHICH limit binds, and that is the part a lender acts on". So
 * the binding term is marked rather than left to be worked out by comparing two
 * figures that may differ in the twentieth decimal place.
 *
 * The two terms sit beside the ceiling rather than behind a disclosure. A reader who
 * has to open something to learn that a position is limited by manipulation cost and
 * not by liquidation depth is a reader who will not open it.
 *
 * A NULL MANIPULATION TERM BESIDE A COMPUTED CEILING IS NOT A GAP. It means the
 * critical target cannot be reached through the order book, so the term does not apply
 * and the ceiling is the liquidation term alone. That is a complete answer, and it is
 * labelled as not applicable rather than as not computed — the engine's own `warnings`
 * entry carries the reason and is rendered verbatim elsewhere on the page.
 *
 * A null term beside a null ceiling is a different thing entirely and gets a different
 * sentence. See {@link MANIPULATION_TERM_DETAIL}.
 */

export interface CollateralCeilingProps {
  ceiling: CollateralCeiling;
  className?: string;
}

export function CollateralCeilingPanel({ ceiling, className }: CollateralCeilingProps) {
  const { binding } = ceiling;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div>
        <p className="text-3xl leading-tight font-semibold text-[var(--keel-ink-strong)]">
          <Value value={ceiling.ceiling} maxFractionDigits={2} />
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--keel-ink)]">
          {binding === 'liquidation' || binding === 'manipulation' || binding === 'both' ? (
            <ArrowDownToLine
              aria-hidden="true"
              className="size-4 shrink-0 text-[var(--keel-muted)]"
            />
          ) : null}
          {BINDING_WORDS[binding]}
        </p>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-lg border border-[var(--keel-border)] bg-[var(--keel-border)] sm:grid-cols-2">
        <Term
          label="Liquidation term"
          binds={binding === 'liquidation' || binding === 'both'}
          detail="Sell-side depth at the liquidation delta, times the haircut."
        >
          <Value value={ceiling.liquidation} maxFractionDigits={2} />
        </Term>

        <Term
          label="Manipulation term"
          binds={binding === 'manipulation' || binding === 'both'}
          detail={MANIPULATION_TERM_DETAIL[ceiling.manipulationTerm]}
        >
          {ceiling.manipulationTerm === 'not-applicable' ? (
            // Deliberately not the unmeasured treatment. The term is inapplicable, not
            // unknown, and it is certainly not zero: zero would say the attack is free.
            <span className="text-base text-[var(--keel-muted)]">not applicable</span>
          ) : (
            <Value value={ceiling.manipulation} maxFractionDigits={2} />
          )}
        </Term>
      </dl>

      {binding === 'unmatched' ? (
        <Breach>
          The engine served a ceiling that equals neither term. The contract defines the
          ceiling as the minimum of the two, so one of the three figures on this page
          disagrees with the others. None of them has been adjusted here.
        </Breach>
      ) : null}

      {ceiling.missingLiquidationTerm ? (
        <Breach>
          The engine served a ceiling with no liquidation term. The contract says the
          liquidation term is always present when the ceiling is.
        </Breach>
      ) : null}
    </div>
  );
}

/**
 * The reason a term reads the way it does, and no reason it does not have.
 *
 * The inapplicable sentence is the contract's own account of a null manipulation term,
 * and it only holds when the engine still produced a ceiling. When nothing was computed
 * — an asset with no executable price — the term is missing for the same reason
 * everything else is, and attaching the unreachable-target explanation there would put
 * a cause on screen that this response never gave.
 */
const MANIPULATION_TERM_DETAIL: Readonly<
  Record<CollateralCeiling['manipulationTerm'], string>
> = {
  applied:
    'Order-book-only manipulation cost at the critical delta, times the safety margin.',
  'not-applicable':
    'Not applied: the critical target is not reachable through the order book.',
  unmeasured: 'Not computed, along with the ceiling itself. See the engine notes below.',
};

function Term({
  label,
  binds,
  detail,
  children,
}: {
  label: string;
  binds: boolean;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--keel-surface)] px-4 py-3">
      <dt className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-[var(--keel-muted)] uppercase">
        {label}
        {binds ? (
          <span className="rounded-sm bg-[var(--keel-surface-subtle)] px-1.5 py-0.5 text-[10px] font-semibold tracking-normal text-[var(--keel-ink-strong)] normal-case">
            binds
          </span>
        ) : null}
      </dt>
      <dd
        className={cn(
          'mt-1 text-xl break-words',
          binds
            ? 'font-semibold text-[var(--keel-ink-strong)]'
            : 'text-[var(--keel-ink)]',
        )}
      >
        {children}
      </dd>
      <p className="mt-1 text-xs text-[var(--keel-muted)]">{detail}</p>
    </div>
  );
}

function Breach({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex gap-2 rounded-md border border-[var(--band-critical)]/35 bg-[var(--band-critical-surface)] px-3 py-2 text-sm text-[var(--band-critical-ink)]"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
