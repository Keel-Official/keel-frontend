/**
 * Where the live dashboard lives, and what this page should link to when it does not
 * live anywhere yet.
 *
 * The marketing site and the dashboard are two applications. They may end up on a
 * subdomain, on a path behind a proxy, or on separate hosts entirely, so the location
 * is configuration rather than something written in here.
 *
 * WHEN IT IS NOT CONFIGURED the links fall back to the on-page sections. That matters:
 * a build that forgot the variable would otherwise ship a homepage whose primary call
 * to action points at `http://localhost:5173`, which is dead for every visitor and
 * looks like a broken product rather than a missing setting. The anchor always works.
 */

const configured = process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim();

/** True when a real dashboard exists to send people to. */
export const dashboardIsLive = Boolean(configured);

function join(path: string): string {
  if (!configured) return path;
  return `${configured.replace(/\/+$/, '')}${path}`;
}

/**
 * Destinations the landing page offers. Each has the live URL when one is configured
 * and the on-page section to scroll to when it is not.
 */
export const dashboardLinks = {
  /** The monitored set. */
  assets: configured ? join('/') : '#markets',
  /** Every threshold, as the engine serves it. */
  methodology: configured ? join('/methodology') : '#methodology',
} as const;

/**
 * Wording that stays true either way. "Explore assets" promises a product; without a
 * dashboard behind it, the honest version says it is a preview on this page.
 */
export const dashboardCopy = {
  assets: dashboardIsLive ? 'Explore assets' : 'See a sample of the set',
  methodology: dashboardIsLive ? 'Read methodology' : 'How Keel measures',
} as const;
