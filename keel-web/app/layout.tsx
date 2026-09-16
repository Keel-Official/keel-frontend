import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';

/**
 * The fonts the marketing site already uses, loaded from the same packages so the two
 * surfaces read as one product. They are loaded locally rather than from a font CDN so
 * a dashboard a reviewer opens does not depend on a third party being up.
 *
 * Manrope for the interface. JetBrains Mono for ledger sequences, issuer fragments,
 * API paths, methodology versions, and exact figures, where a tabular monospace stops
 * digits from shifting between rows.
 */
const manrope = localFont({
  src: '../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '200 800',
});

const jetbrainsMono = localFont({
  src: '../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
  weight: '100 800',
});

/**
 * `metadataBase` is what absolute URLs in the social card resolve against. It has to be
 * the deployed origin, so it comes from the environment rather than being written in:
 * a hardcoded domain would silently point every shared preview at the wrong place the
 * first time this is deployed somewhere else.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5173';

const title = 'Keel — Stellar liquidity risk';
const description =
  'Whether a reported Stellar asset price is backed by executable market depth, and what it would cost to move it.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'Keel',
  openGraph: {
    type: 'website',
    siteName: 'Keel',
    title,
    description,
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
