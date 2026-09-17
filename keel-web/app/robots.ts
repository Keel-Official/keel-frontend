import type { MetadataRoute } from 'next';

/**
 * The dashboard is public and read-only, so crawling the three routes is welcome.
 *
 * One path is disallowed. `/asset/<id>` is generated per asset and every request is
 * served from the live API, against a budget of sixty requests a minute shared by the
 * whole audience — a crawler walking sixty-one assets would spend it in seconds and
 * serve rate-limit errors to readers. The monitored set links to every asset, so a
 * crawler that respects a crawl delay still finds them; this only stops the set being
 * swept at machine speed.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5173';

  return {
    rules: [{ userAgent: '*', allow: ['/', '/methodology'], crawlDelay: 10 }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
