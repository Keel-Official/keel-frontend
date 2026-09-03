import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Keel | Liquidity risk intelligence for Stellar",
  description:
    "Keel measures executable liquidity depth and related collateral risk for Stellar assets.",
  openGraph: {
    type: "website",
    title: "Keel | Liquidity risk intelligence for Stellar",
    description: "See how much volume a quoted price can actually support.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Keel liquidity risk intelligence for Stellar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Keel | Liquidity risk intelligence for Stellar",
    description: "See how much volume a quoted price can actually support.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
