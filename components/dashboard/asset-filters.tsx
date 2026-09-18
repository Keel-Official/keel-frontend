import Link from 'next/link';

import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import { assetHref, BANDS, type AssetQuery } from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

/**
 * The band filter, as links above the table.
 *
 * Links rather than a control, so a filtered view is something a reviewer can send to
 * someone, and so the whole thing works with no JavaScript. Band is applied by the
 * engine rather than here — it is a query parameter on `/dashboard`, so `total`
 * describes the filtered set rather than a page of it.
 *
 * Free-text search and the flag filter used to sit beside these in a second row. They
 * are behind the search icon in the header now: four controls parked permanently above
 * the data, for something a reader does occasionally, was the wrong trade.
 */

export function AssetFilters({ query }: { query: AssetQuery }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-xs font-medium tracking-wide text-[var(--keel-muted)] uppercase"
          id="band-filter-label"
        >
          Band
        </span>
        <ul
          aria-labelledby="band-filter-label"
          className="flex flex-wrap gap-1"
        >
          <FilterLink
            href={assetHref(query, { band: null })}
            active={query.band === null}
            label="All"
          />
          {BANDS.map((band) => (
            <FilterLink
              key={band}
              href={assetHref(query, { band })}
              active={query.band === band}
              label={BAND_TOKENS[band].label}
              dotColor={BAND_TOKENS[band].mark}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
  dotColor,
}: {
  href: string;
  active: boolean;
  label: string;
  dotColor?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
          active
            ? 'border-[var(--keel-brand)] bg-[var(--keel-brand)] text-white'
            : 'border-[var(--keel-border-strong)] text-[var(--keel-ink)] hover:bg-[var(--keel-surface-subtle)]',
        )}
      >
        {dotColor ? (
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        ) : null}
        {label}
      </Link>
    </li>
  );
}
