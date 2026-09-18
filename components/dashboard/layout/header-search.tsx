import Link from 'next/link';
import { Search } from 'lucide-react';

import { flagCopy } from '@/lib/keel/format/glossary';
import { DASHBOARD_BASE } from '@/lib/keel/routes';
import {
  DEFAULT_QUERY,
  FLAGS,
  assetHref,
  isFiltered,
  type AssetQuery,
} from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

/**
 * Search and the flag filter, behind one icon in the header.
 *
 * These used to be a row of controls above the table: a select wide enough to hold the
 * longest flag sentence, a text box, an Apply button and a Clear link. Four controls
 * sitting permanently above the data, for something a reader does occasionally. Collapsed
 * to an icon they cost nothing until wanted, and the header is where anyone looks for a
 * search.
 *
 * IT IS A `<details>`, SO IT WORKS WITH NO JAVASCRIPT. The panel is a real GET form
 * submitting to `/dashboard`, exactly as the row it replaces was — no client state, no
 * fetch, no controlled inputs. `<details>` is flow content and so would be invalid
 * inside a paragraph or a heading, but a header is neither, so the disclosure that was
 * wrong for a term tooltip is right here.
 *
 * EVERY OTHER VIEW CHOICE RIDES THROUGH AS A HIDDEN INPUT. A GET form replaces the whole
 * query string with its own fields, so a band filter, an ordering and a trend window
 * would all be silently dropped by a search if they were not carried across. That was
 * already true of the row this replaces for band, sort and direction; the trend window
 * is newer and is carried here too.
 *
 * It is rendered on every dashboard page, so a search from an asset detail page lands on
 * the filtered set. Those pages have no query of their own, hence the default.
 */

export function HeaderSearch({
  query = DEFAULT_QUERY,
  className,
}: {
  query?: AssetQuery;
  className?: string;
}) {
  const filtered = isFiltered(query);

  return (
    <details className={cn('keel-search', className)}>
      <summary
        aria-label={
          filtered
            ? 'Search and filter assets — filters are active'
            : 'Search and filter assets'
        }
        className="keel-search-trigger"
      >
        <Search aria-hidden="true" className="size-4" />
        {/* A dot rather than a count: the number of active filters is not something a
            reader needs from the header, but whether any are on changes how they read
            every figure on the page. */}
        {filtered ? (
          <span aria-hidden="true" className="keel-search-dot" />
        ) : null}
      </summary>

      <div className="keel-search-panel">
        <form
          action={DASHBOARD_BASE}
          method="get"
          className="flex flex-col gap-3"
        >
          {query.band === null ? null : (
            <input type="hidden" name="band" value={query.band} />
          )}
          {query.range === DEFAULT_QUERY.range ? null : (
            <input type="hidden" name="range" value={query.range} />
          )}
          <input type="hidden" name="sort" value={query.sort} />
          <input type="hidden" name="dir" value={query.dir} />

          <label className="flex min-w-0 flex-col gap-1 text-xs text-[var(--keel-muted)]">
            <span className="font-medium tracking-wide uppercase">
              Code or issuer
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query.q}
              placeholder="USTRY, or GCRY…"
              className="min-h-11 w-full rounded-md border border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-2.5 py-2 text-sm text-[var(--keel-ink)]"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs text-[var(--keel-muted)]">
            <span className="font-medium tracking-wide uppercase">
              Triggered flag
            </span>
            {/* A fixed width, not a minimum: a select sizes itself to its longest
                option, and these carry a sentence and an enum value. */}
            <select
              name="hasFlag"
              defaultValue={query.hasFlag ?? ''}
              className="min-h-11 w-full max-w-full rounded-md border border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-2 py-2 text-sm text-[var(--keel-ink)]"
            >
              <option value="">Any</option>
              {/* The plain label leads and the enum value follows it, so a reader can
                  find the check they mean and still see the code they will meet in the
                  API and in the shared URL. */}
              {FLAGS.map((flag) => (
                <option key={flag} value={flag}>
                  {`${flagCopy(flag).label} — ${flag}`}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="min-h-11 flex-1 rounded-md bg-[var(--keel-accent)] px-4 py-2 text-sm font-medium text-[var(--keel-bg)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
            >
              Apply
            </button>

            {filtered ? (
              <Link
                href={assetHref(query, { band: null, hasFlag: null, q: '' })}
                className="inline-flex min-h-11 items-center text-sm text-[var(--keel-muted)] underline underline-offset-2 hover:text-[var(--keel-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </div>
    </details>
  );
}
