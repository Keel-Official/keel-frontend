import Link from 'next/link';
import { ArrowRight, CircleDashed } from 'lucide-react';

import type { BandGroup } from '@/lib/keel/assets/band-groups';
import { HISTORY_RANGES } from '@/lib/keel/assets/history-range';
import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import { bandCopy } from '@/lib/keel/format/glossary';
import { assetHref, type AssetQuery } from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

import { AssetTable, type AssetTableTrend } from './asset-table';
import { BandChip } from './band-chip';

/**
 * One band, as a section of the monitored set.
 *
 * The page used to be a single table behind a row of filter chips, which meant the
 * shape of the market — thirty-eight critical against two low — was a thing a reader
 * could only reconstruct by clicking through four filters. Four sections say it on
 * arrival, and each one opens with a sentence about what the band means rather than
 * leaving the word to carry it.
 *
 * AN EMPTY BAND IS STILL A SECTION. "No monitored asset is in this band at this ledger"
 * is a statement about this scan, and it is a different statement from a section that is
 * not on the page. It is deliberately not phrased as good news.
 *
 * The window columns are not here in preview. They cost one request per row, the whole
 * audience shares sixty a minute because every read is made from the server, and four
 * previews would spend sixteen of them on a view where nothing was asked for yet. They
 * arrive on the band's own view, which is what the link at the foot of the section
 * promises.
 */

export interface BandSectionProps {
  group: BandGroup;
  query: AssetQuery;
  trend?: AssetTableTrend;
  /** Pagination, on the band's own view. */
  children?: React.ReactNode;
  className?: string;
}

export function BandSection({
  group,
  query,
  trend,
  children,
  className,
}: BandSectionProps) {
  const copy = bandCopy(group.band);
  const token = BAND_TOKENS[group.band];
  const headingId = `band-${group.band.toLowerCase()}`;
  const count = group.rows.length;

  return (
    <section
      aria-labelledby={headingId}
      className={cn('min-w-0 scroll-mt-20', className)}
      id={headingId.replace('band-', 'band-section-')}
    >
      {/* A hairline across the column opens each band, as a rule separates the
          sections of the landing page: the bands are four readings, not four cards. */}
      <header className="mb-4 flex flex-col gap-1.5 border-t border-[var(--keel-border-strong)] pt-4">
        {/* h3: these sit under the section that names the whole monitored set, which
            keeps the page at one h1, h2s for its parts, and h3s for the bands. */}
        <h3
          id={headingId}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg font-semibold tracking-tight text-[var(--keel-ink-strong)]"
        >
          <BandChip band={group.band} />
          <span className="keel-marker">
            {count === 1 ? '1 asset' : `${count} assets`}
          </span>
        </h3>
        <p className="max-w-3xl text-sm text-[var(--keel-muted)]">
          {copy.sentence}
        </p>
        {/* `partial` is true of every monitored asset today. On the overview the
            attention card states that once for the whole set, and four copies of it
            would be the repetition this dashboard already decided against; on a band's
            own view there is no other copy, so it is said here. */}
        {group.partial > 0 && trend !== undefined ? (
          <p className="flex items-start gap-1.5 text-xs text-[var(--keel-muted)]">
            <CircleDashed
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-[var(--unmeasured)]"
            />
            <span>
              {group.partial === count
                ? 'Every band here is a floor, not a verdict:'
                : `${group.partial} of these bands are floors, not verdicts:`}{' '}
              at least one severe check could not be evaluated, so the real risk
              can only be worse than shown, never better.
            </span>
          </p>
        ) : null}
      </header>

      {count === 0 ? (
        <p
          className="rounded-lg border border-dashed border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-4 py-6 text-sm text-[var(--keel-muted)]"
          style={{ borderLeftColor: token.mark, borderLeftWidth: 3 }}
        >
          {copy.empty}
        </p>
      ) : (
        <>
          <AssetTable
            items={group.preview}
            query={query}
            trend={trend}
            bandSort={false}
            regionLabel={`${copy.heading} assets, scrollable`}
          />

          {children}

          {group.hidden > 0 ? (
            <Link
              href={assetHref(query, { band: group.band })}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--keel-accent)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
            >
              {`See all ${count} ${copy.heading.toLowerCase()}, with the ${HISTORY_RANGES[
                query.range
              ].label.toLowerCase()}`}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}
