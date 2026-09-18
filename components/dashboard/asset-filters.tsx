import Link from 'next/link';

import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import {
  assetHref,
  BANDS,
  FLAGS,
  isFiltered,
  type AssetQuery,
} from '@/lib/keel/url/asset-query';
import { DASHBOARD_BASE } from '@/lib/keel/routes';
import { cn } from '@/lib/keel/utils';

/**
 * Filters in one row above the table, and every one of them is in the URL.
 *
 * Band is a set of links, so a filtered view is something a reviewer can send to
 * someone. Flag and free text sit in a plain GET form: a select of twelve flags and a
 * text box are not links, and a native form keeps both working with no JavaScript at
 * all. Hidden inputs carry the rest of the state through the submit.
 *
 * Band and flag are applied by the engine, not here — both are query parameters on
 * `/dashboard`, so `total` describes the filtered set rather than a page of it.
 */

export function AssetFilters({ query }: { query: AssetQuery }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[var(--keel-border)] bg-[var(--keel-surface)] p-3">
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

      <form
        action={DASHBOARD_BASE}
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        {query.band === null ? null : (
          <input type="hidden" name="band" value={query.band} />
        )}
        <input type="hidden" name="sort" value={query.sort} />
        <input type="hidden" name="dir" value={query.dir} />

        <label className="flex flex-col gap-1 text-xs text-[var(--keel-muted)]">
          <span className="font-medium tracking-wide uppercase">
            Triggered flag
          </span>
          <select
            name="hasFlag"
            defaultValue={query.hasFlag ?? ''}
            className="min-h-11 min-w-56 rounded-md border border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-2 py-2 text-sm text-[var(--keel-ink)]"
          >
            <option value="">Any</option>
            {FLAGS.map((flag) => (
              <option key={flag} value={flag}>
                {flag}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-[var(--keel-muted)]">
          <span className="font-medium tracking-wide uppercase">
            Code or issuer
          </span>
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder="USTRY, or GCRY…"
            className="min-h-11 min-w-48 rounded-md border border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-2 py-2 text-sm text-[var(--keel-ink)]"
          />
        </label>

        <button
          type="submit"
          className="min-h-11 rounded-md bg-[var(--keel-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--keel-brand-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
        >
          Apply
        </button>

        {isFiltered(query) ? (
          <Link
            href={assetHref(query, { band: null, hasFlag: null, q: '' })}
            className="inline-flex min-h-11 items-center text-sm text-[var(--keel-muted)] underline underline-offset-2 hover:text-[var(--keel-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
          >
            Clear filters
          </Link>
        ) : null}
      </form>
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
