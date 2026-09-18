import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import localFont from 'next/font/local';

import { THEME_COOKIE, themeAttribute } from '@/lib/keel/design/theme';

import './dashboard/dashboard.css';

/**
 * A second root layout, not a nested one.
 *
 * The dashboard and the marketing site are one deployment now, but they are not one
 * stylesheet. Both define `--accent`, `--muted` and `--border` and mean different
 * colours by them, and the marketing sheet styles bare `h1`, `a` and `button`, which
 * the dashboard leaves to Tailwind. Nested under a shared root layout the marketing
 * sheet would load on every dashboard page and repaint it — and a soft navigation
 * would leave it there even if the bundler kept them apart.
 *
 * Two root layouts make that structural: each group owns its own `<html>`, its own
 * stylesheet, and crossing between them is a full page load, so neither sheet is ever
 * in the document with the other.
 */

const manrope = localFont({
  src: '../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '200 800',
});

const jetbrainsMono = localFont({
  src: '../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
  weight: '100 800',
});

const title = 'Keel — Stellar liquidity risk';
const description =
  'Whether a reported Stellar asset price is backed by executable market depth, and what it would cost to move it.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title,
  description,
  applicationName: 'Keel',
  openGraph: { type: 'website', siteName: 'Keel', title, description },
  twitter: { card: 'summary_large_image', title, description },
  icons: { icon: '/icon.svg' },
};

export default async function DashboardLayout({ children }: LayoutProps<'/'>) {
  // The reader's palette, read on the server so the first byte of HTML already carries
  // it. See `lib/keel/design/theme.ts` for why the constant lives there and not beside
  // the toggle that writes it.
  const chosen = (await cookies()).get(THEME_COOKIE)?.value;

  return (
    <html
      lang="en"
      data-theme={themeAttribute(chosen)}
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
