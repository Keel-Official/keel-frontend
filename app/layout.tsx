import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const manrope = localFont({
  src: '../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '200 800',
});
const mono = localFont({
  src: '../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-mono',
  display: 'swap',
  weight: '100 800',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
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
    images: ['/opengraph-image'],
  },
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${manrope.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
