import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { pageHref, type AssetQuery } from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

/**
 * Which page of the table is showing, and the way to the others.
 *
 * One bordered bar: step controls anchored to the ends, the run of page numbers
 * centred between them. The ends are where a pointer already is after reading a page,
 * and they stay in the same place whatever the run in the middle does.
 *
 * Links, not buttons, for the same reason every other control here is a link: the page
 * number is in the URL, so a reviewer can send the exact view they are looking at, and
 * the whole thing works with no JavaScript.
 *
 * This pages rows that are ALREADY IN HAND. The whole monitored set arrives in one
 * response, so sorting and searching stay exact across every row rather than describing
 * the eight that happen to be on screen. See `AssetQuery.page`.
 */

/**
 * How many pages are always offered at each end, and how many either side of the
 * current one. Three and one, which on eight pages reads `1 2 3 … 6 7 8` and never
 * elides more than it shows.
 */
const BOUNDARY = 3;
const SIBLINGS = 1;

export interface PaginationProps {
  query: AssetQuery;
  /** The clamped current page, from `paginate`. */
  page: number;
  pageCount: number;
  /** One-based, inclusive, for the count sentence. */
  from: number;
  to: number;
  total: number;
  className?: string;
}

export function Pagination({
  query,
  page,
  pageCount,
  from,
  to,
  total,
  className,
}: PaginationProps) {
  // One page is not a choice, so there is nothing to offer.
  if (pageCount <= 1) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <nav
        aria-label="Table pages"
        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--keel-border)] px-3 py-2.5"
      >
        <Step
          href={pageHref(query, page - 1)}
          disabled={page === 1}
          label="Previous"
          icon={ArrowLeft}
        />

        <ul className="flex min-w-0 flex-wrap items-center justify-center gap-1">
          {pageNumbers(page, pageCount).map((entry, index) =>
            entry === null ? (
              <li
                key={`gap-${index}`}
                aria-hidden="true"
                className="px-1.5 text-sm text-[var(--keel-muted)]"
              >
                …
              </li>
            ) : (
              <li key={entry}>
                <Link
                  href={pageHref(query, entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  aria-label={`Page ${entry} of ${pageCount}`}
                  className={cn(
                    'tabular inline-flex size-9 items-center justify-center rounded-lg text-sm',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
                    entry === page
                      ? 'bg-[var(--keel-surface-subtle)] font-medium text-[var(--keel-ink-strong)]'
                      : 'text-[var(--keel-muted)] hover:bg-[var(--keel-surface-subtle)] hover:text-[var(--keel-ink)]',
                  )}
                >
                  {entry}
                </Link>
              </li>
            ),
          )}
        </ul>

        <Step
          href={pageHref(query, page + 1)}
          disabled={page === pageCount}
          label="Next"
          icon={ArrowRight}
          trailing
        />
      </nav>

      {/* Stated rather than left to be inferred from the page numbers: a reader
          deciding whether they have seen everything that needs attention should not
          have to multiply. */}
      <p className="text-xs text-[var(--keel-muted)]">
        Showing <span className="tabular text-[var(--keel-ink)]">{from}</span>
        {' to '}
        <span className="tabular text-[var(--keel-ink)]">{to}</span>
        {' of '}
        <span className="tabular text-[var(--keel-ink)]">{total}</span>
        {total === 1 ? ' asset' : ' assets'}
      </p>
    </div>
  );
}

/**
 * A step control at the end of the bar.
 *
 * At the first or last page it is a real `<button disabled>`, not a link and not a
 * styled `<span>`. There is no such thing as a disabled anchor and an `aria-disabled`
 * link still navigates, so a link is wrong; a span is wrong too, because it either
 * hides the control from a screen reader entirely or leaves dimmed text that has to
 * clear 4.5:1 — and the dim grey that reads as unavailable measures 2.21:1. A disabled
 * control is exempt from the contrast requirement precisely because it is inactive, and
 * it still announces itself, so a reader who tabs to it learns they are at the end
 * rather than finding nothing there. It keeps its width either way, so the run of
 * numbers does not shift when a reader reaches an end.
 */
function Step({
  href,
  disabled,
  label,
  icon: Icon,
  trailing = false,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: typeof ArrowLeft;
  /** Puts the arrow after the word, for the control on the right. */
  trailing?: boolean;
}) {
  const shape =
    'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium';

  const content = (
    <>
      {trailing ? null : <Icon aria-hidden="true" className="size-4" />}
      <span className="hidden sm:inline">{label}</span>
      {trailing ? <Icon aria-hidden="true" className="size-4" /> : null}
    </>
  );

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${label} page`}
        className={cn(
          shape,
          'cursor-not-allowed border-[var(--keel-border)] text-[var(--keel-border-strong)]',
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      // The word is hidden below the table breakpoint, so the name is set here and does
      // not depend on the viewport.
      aria-label={`${label} page`}
      className={cn(
        shape,
        'border-[var(--keel-border-strong)] text-[var(--keel-ink)] hover:border-[var(--keel-accent)] hover:text-[var(--keel-accent)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
      )}
    >
      {content}
    </Link>
  );
}

/**
 * The page numbers to draw: a run at each end, the current page and its neighbours,
 * with `null` marking an elided stretch.
 *
 * Sixty-one assets make eight pages today, which reads `1 2 3 … 6 7 8` from either end
 * and shows every number once a reader is in the middle.
 */
export function pageNumbers(
  page: number,
  pageCount: number,
): (number | null)[] {
  const shown = new Set<number>();

  for (let n = 1; n <= Math.min(BOUNDARY, pageCount); n += 1) shown.add(n);
  for (let n = Math.max(1, pageCount - BOUNDARY + 1); n <= pageCount; n += 1) {
    shown.add(n);
  }
  for (let n = page - SIBLINGS; n <= page + SIBLINGS; n += 1) {
    if (n >= 1 && n <= pageCount) shown.add(n);
  }

  const sorted = [...shown].sort((a, b) => a - b);
  const out: (number | null)[] = [];

  for (const [index, n] of sorted.entries()) {
    const previous = sorted[index - 1];
    if (previous !== undefined && n - previous > 1) {
      // A single missing number is printed rather than elided: "3 … 5" is no shorter
      // than "3 4 5" and costs the reader a click.
      if (n - previous === 2) out.push(previous + 1);
      else out.push(null);
    }
    out.push(n);
  }

  return out;
}
