import Link from 'next/link';
import { History } from 'lucide-react';

import type { AssetRisk, Reconstruction } from '@/lib/keel/api/types';
import { HISTORY_SOURCES } from '@/lib/keel/assets/history-range';
import { classifyCount } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { Value } from './value';

/**
 * The frame around a reading taken at a past ledger.
 *
 * A reconstructed row is not a measurement of a live book. It is a book rebuilt from
 * the operation stream, and every gap the rebuild knows about REMOVES offers, so the
 * book is too thin and never too deep: its depth is a lower bound and its risk an upper
 * bound. Contract 1.7.0 says a page that renders such a row identically to a live
 * reading is wrong in the way that matters most here — nothing fails, the numbers still
 * draw, only their meaning is different. So this panel sits above every figure on the
 * page and says so, and it carries the engine's own counters rather than a summary of
 * them, because "28 missing offers of 65 accounts walked" is the statement a reviewer
 * can check and "some gaps" is not.
 *
 * A past reading from `horizon` would carry no `reconstruction` object. The panel
 * still frames it as a past reading, and simply has no counters to show.
 */

export interface ReconstructionPanelProps {
  risk: Pick<
    AssetRisk,
    'ledgerSeq' | 'ledgerClosedAt' | 'dataSource' | 'reconstruction'
  >;
  /** Where the live reading of the same asset lives. */
  liveHref: string;
  className?: string;
}

const COUNTERS: readonly {
  key: keyof Reconstruction;
  label: string;
  note: string;
}[] = [
  {
    key: 'missingOffers',
    label: 'Offers never seen created',
    note: 'A later trade named them as resting; the walk never saw them posted',
  },
  {
    key: 'stoppedAtFloor',
    label: 'Walks stopped at the floor',
    note: 'An offer created before the floor ledger is invisible to this row',
  },
  {
    key: 'truncated',
    label: 'Walks that hit the page cap',
    note: 'The account had more operations than the walk read',
  },
  {
    key: 'failed',
    label: 'Walks that failed',
    note: 'Contributed no offers at all',
  },
  {
    key: 'unsizable',
    label: 'Unsizable results',
    note: 'Operation results whose remaining amount could not be read',
  },
];

export function ReconstructionPanel({
  risk,
  liveHref,
  className,
}: ReconstructionPanelProps) {
  const rec = risk.reconstruction;
  const source = HISTORY_SOURCES[risk.dataSource];

  return (
    <section
      aria-labelledby="past-reading-heading"
      className={cn(
        'rounded-lg border border-[var(--keel-border-strong)] bg-[var(--keel-surface-subtle)] p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <History
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-[var(--keel-ink-strong)]"
        />
        <div className="min-w-0 flex-1">
          <h2
            id="past-reading-heading"
            className="font-medium text-[var(--keel-ink-strong)]"
          >
            A past reading, at ledger{' '}
            <span className="tabular">{risk.ledgerSeq}</span>
            {' — '}
            <span className="tabular">{risk.ledgerClosedAt}</span>
          </h2>
          <p className="mt-1 text-sm text-[var(--keel-ink)]">
            Source: <span className="tabular">{risk.dataSource}</span> (
            {source.note.toLowerCase()}).{' '}
            {rec ? (
              <strong className="font-medium">
                This book was rebuilt, not observed. Read every depth below as a
                lower bound and every risk as an upper bound.
              </strong>
            ) : (
              'Every figure below describes the market at that ledger, not today.'
            )}
          </p>
          <p className="mt-2 text-sm">
            <Link
              href={liveHref}
              className="underline underline-offset-2 text-[var(--keel-ink-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
            >
              Back to the live reading
            </Link>
          </p>
        </div>
      </div>

      {rec ? (
        <div className="mt-4 border-t border-[var(--keel-border)] pt-4">
          <h3 className="keel-marker">
            What the reconstruction reports about itself
          </h3>
          <p className="mt-1 text-xs text-[var(--keel-muted)]">
            Out of <span className="tabular">{rec.accountsWalked}</span>{' '}
            {rec.accountsWalked === 1 ? 'account' : 'accounts'} walked
            {rec.floorLedger > 0 ? (
              <>
                , with an operation floor at ledger{' '}
                <span className="tabular">{rec.floorLedger}</span>
              </>
            ) : (
              ', with no operation floor'
            )}
            .
          </p>
          <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTERS.map((c) => (
              <div key={c.key} className="min-w-0">
                <dt className="text-xs font-medium text-[var(--keel-muted)]">
                  {c.label}
                </dt>
                <dd className="mt-0.5 text-base text-[var(--keel-ink-strong)]">
                  <Value value={classifyCount(rec[c.key])} showUnit={false} />
                  <p className="mt-0.5 text-xs font-normal text-[var(--keel-muted)]">
                    {c.note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
