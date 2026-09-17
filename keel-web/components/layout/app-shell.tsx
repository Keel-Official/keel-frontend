import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Provenance } from '@/components/keel/provenance';
import { SiteNav } from '@/components/layout/site-nav';

/**
 * The frame every page sits in.
 *
 * The provenance strip lives in the header rather than in a footer, because the rule
 * is that a screenshot of any page must be enough to re-verify the number it shows,
 * and a footer is not on the screenshot.
 *
 * Provenance arrives as props. The shell does not fetch it: different pages read it
 * from different responses, and the staleness header is not sent by every endpoint.
 */

export interface AppShellProps {
  children: React.ReactNode;
  methodologyVersion: string | null;
  ledgerSeq?: number | null;
  stalenessSeconds?: string | null;
}

export function AppShell({
  children,
  methodologyVersion,
  ledgerSeq,
  stalenessSeconds,
}: AppShellProps) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--keel-surface)] focus:px-3 focus:py-2 focus:outline-2 focus:outline-[var(--keel-accent)]"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-[var(--keel-border)] bg-[var(--keel-surface)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link
            href="/"
            className="flex items-baseline gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
          >
            <span className="text-lg font-semibold tracking-tight text-[var(--keel-brand)]">
              Keel
            </span>
            <span className="hidden text-xs text-[var(--keel-muted)] sm:inline">
              Stellar liquidity risk
            </span>
          </Link>

          <SiteNav />

          <Provenance
            className="w-full sm:ml-auto sm:w-auto"
            methodologyVersion={methodologyVersion}
            ledgerSeq={ledgerSeq}
            stalenessSeconds={stalenessSeconds}
          />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-[var(--keel-border)] px-4 py-4">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--keel-muted)]">
          <span>Read-only. Keel computes every figure; this dashboard renders them.</span>
          <a
            className="underline underline-offset-2 hover:text-[var(--keel-ink)]"
            href="https://api.keels.app/v1/health"
            rel="noreferrer"
            target="_blank"
          >
            API health
          </a>
        </div>
      </footer>
    </>
  );
}

/**
 * Page heading. The prompt's discipline reference uses questions a reader would
 * actually ask rather than widget names, so a page title is a sentence and the
 * subtitle says what the figures below it are and are not.
 */
export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--keel-ink-strong)]">
        {title}
      </h1>
      {children ? (
        <div className="mt-2 max-w-3xl text-sm text-[var(--keel-muted)]">{children}</div>
      ) : null}
    </div>
  );
}

/**
 * A section of a page, with its heading and an optional standfirst.
 *
 * The heading is a question for the same reason the page title is: it names what a
 * reader came to find out rather than which widget is below it. The standfirst is
 * where a section says what its figures are not, which is the sentence that usually
 * goes missing.
 */
export function Section({
  id,
  title,
  standfirst,
  children,
  className,
}: {
  /** Anchor target, so a control inside the section can link back to it. */
  id?: string;
  title: string;
  standfirst?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // min-w-0 on the section itself, not only on its content: a section is a child of
    // the page's flex column, where min-width defaults to auto and refuses to shrink
    // below the widest thing inside it. Without this the manipulation table widens the
    // whole page at 360px instead of scrolling inside its own wrapper.
    <section id={id} className={cn('min-w-0 scroll-mt-20', className)}>
      <h2 className="text-lg font-semibold tracking-tight text-[var(--keel-ink-strong)]">
        {title}
      </h2>
      {standfirst ? (
        <div className="mt-1 max-w-3xl text-sm text-[var(--keel-muted)]">{standfirst}</div>
      ) : null}
      {/* min-w-0 so a wide child — the manipulation table is 434px — scrolls inside
          its own wrapper instead of widening the page. A flex item defaults to
          min-width:auto and will not shrink below its content without this. */}
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}
