import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const manrope = localFont({
  src: '../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '200 800',
});
const mono = localFont({
  src: '../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-mono',
  display: 'swap',
  weight: '100 800',
  preload: false,
});

export const metadata: Metadata = {
  // The deployed origin, fixed. It used to fall back to localhost when
  // NEXT_PUBLIC_SITE_URL was unset, and a build without it published social cards
  // whose image URL pointed at the machine that built them.
  metadataBase: new URL('https://keels.app'),
  title: 'Keel | Liquidity risk intelligence for Stellar',
  description:
    'Know how much a price can actually support. Inspect executable depth, manipulation resistance, and collateral risk for Stellar assets.',
  openGraph: {
    type: 'website',
    title: 'Keel | See the market behind the price',
    description:
      'Executable depth. Explainable risk. Evidence you can inspect.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keel | See the market behind the price',
    // No `images` here. `opengraph-image.tsx` supplies both cards, and Next generates
    // its URL with a content hash; writing the path by hand pinned it to a route that
    // only existed while the file sat at the app root, and it 404'd the moment the
    // file moved.
  },
  icons: { icon: '/icon.svg' },
};

export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${manrope.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
