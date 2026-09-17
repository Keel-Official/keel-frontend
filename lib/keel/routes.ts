/**
 * Where the dashboard is mounted inside the marketing site.
 *
 * The dashboard was built as a standalone application whose asset list was `/`. It now
 * lives under a path in the same deployment, so every link it builds needs that prefix.
 * The prefix is written once, here, rather than in each component: the two surfaces
 * share a domain today and may not tomorrow, and a literal repeated across twenty files
 * is a rename that half-succeeds.
 *
 * Next's own `basePath` was not used. It moves the entire application, marketing pages
 * included, which is the opposite of what is wanted.
 */

export const DASHBOARD_BASE = '/dashboard';

/** The monitored set, optionally with a query string already built. */
export function dashboardPath(search = ''): string {
  return search === '' ? DASHBOARD_BASE : `${DASHBOARD_BASE}?${search}`;
}

/** One asset's detail page. */
export function dashboardAssetPath(assetId: string): string {
  return `${DASHBOARD_BASE}/asset/${encodeURIComponent(assetId)}`;
}

/** Every threshold, as the engine serves it. */
export const DASHBOARD_METHODOLOGY = `${DASHBOARD_BASE}/methodology`;
