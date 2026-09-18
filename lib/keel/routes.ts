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

/**
 * An assetId in the form the engine names it: `CODE:ISSUER`, or `XLM` for the native
 * asset.
 *
 * Next hands a dynamic route segment through still percent-encoded, so `ACT:GAHH…`
 * arrives as `ACT%3AGAHH…`. Everything downstream expects the decoded form — the API
 * client percent-encodes path parameters itself, and `dashboardAssetPath` encodes the
 * links it builds — so passing the raw segment on compounds the encoding: one
 * navigation turns `%3A` into `%253A` and the next into `%25253A`. The engine tolerates
 * the first and refuses the second as INVALID_ASSET_ID, which is why the bug surfaced
 * only on the second click. Decoding once, at the boundary, is what stops it.
 *
 * A malformed escape comes back untouched rather than throwing: a hand-edited URL
 * should reach the engine and be refused there by name, not crash the route.
 */
export function decodeAssetId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * One asset's detail page.
 *
 * Normalised before encoding, so the function is idempotent: handed an id that is
 * already encoded it produces the same path as it does for the decoded one, rather
 * than a second layer.
 */
export function dashboardAssetPath(assetId: string): string {
  return `${DASHBOARD_BASE}/asset/${encodeURIComponent(decodeAssetId(assetId))}`;
}

/** Every threshold, as the engine serves it. */
export const DASHBOARD_METHODOLOGY = `${DASHBOARD_BASE}/methodology`;
