import { classifyCount } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { Value } from './value';

/**
 * Every view carries the ledger it was computed at and the methodology version that
 * produced it, on screen rather than in a tooltip or a footer. A screenshot of any
 * page has to be enough to re-verify the number it shows.
 *
 * Staleness is surfaced rather than hidden. It is not available everywhere: the API
 * sends `X-Keel-Staleness-Seconds` on `/assets` and `/asset/{id}/depth` but not on
 * `/health` or `/methodology`, so a screen built on those two has nothing to show and
 * says so instead of showing a zero.
 */

export interface ProvenanceProps {
  methodologyVersion: string | null;
  ledgerSeq?: number | null;
  stalenessSeconds?: string | null;
  className?: string;
}

export function Provenance({
  methodologyVersion,
  ledgerSeq,
  stalenessSeconds,
  className,
}: ProvenanceProps) {
  return (
    <dl
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--keel-muted)]',
        className,
      )}
    >
      <Item label="Ledger">
        <Value value={classifyCount(ledgerSeq)} showUnit={false} />
      </Item>
      <Item label="Methodology">
        {methodologyVersion === null ? (
          <span className="italic text-[var(--unmeasured)]">not reported</span>
        ) : (
          <span className="tabular">{methodologyVersion}</span>
        )}
      </Item>
      <Item label="Age">
        {stalenessSeconds === null || stalenessSeconds === undefined ? (
          <span className="italic text-[var(--unmeasured)]">not reported</span>
        ) : (
          <span className="tabular">{stalenessSeconds}s</span>
        )}
      </Item>
    </dl>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[var(--keel-muted)]">{label}</dt>
      <dd className="text-[var(--keel-ink)]">{children}</dd>
    </div>
  );
}
