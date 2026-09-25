'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DASHBOARD_BASE, DASHBOARD_METHODOLOGY } from '@/lib/keel/routes';
import { cn } from '@/lib/keel/utils';

/**
 * Two destinations, because there are three routes and one of them is reached by
 * clicking a row rather than a menu item.
 *
 * A top bar rather than a sidebar. The primary content is a wide table of sixty-one
 * assets with a band, a confidence, two figures, and a flag count per row, and a
 * sidebar spends horizontal space that the table needs. It also collapses to a drawer
 * on a narrow screen, which is a control to build and test for two links.
 */
const LINKS = [
  { href: DASHBOARD_BASE, label: 'Assets' },
  { href: DASHBOARD_METHODOLOGY, label: 'Methodology' },
] as const;

export function SiteNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-1">
        {LINKS.map((link) => {
          // An asset detail page is reached from the table, so it keeps Assets marked.
          const active =
            link.href === DASHBOARD_BASE
              ? pathname === DASHBOARD_BASE ||
                pathname.startsWith(`${DASHBOARD_BASE}/asset/`)
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  // Mono and lowercase, as on the landing masthead. The current page is
                  // marked by weight and an underline in the accent, not by a filled
                  // pill, so the bar reads as a masthead rather than as a tab strip.
                  'tabular inline-flex min-h-9 items-center rounded-sm px-2.5 text-[0.8rem] lowercase underline-offset-[0.45rem] transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
                  active
                    ? 'font-bold text-[var(--keel-ink-strong)] underline decoration-[var(--keel-accent)] decoration-2'
                    : 'text-[var(--keel-muted)] hover:text-[var(--keel-ink-strong)]',
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
