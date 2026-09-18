import { describe, expect, it } from 'vitest';

import { dashboardCopy, dashboardLinks } from '../lib/dashboard';
import {
  DASHBOARD_BASE,
  dashboardAssetPath,
  dashboardPath,
  decodeAssetId,
} from '../lib/keel/routes';

/**
 * These links used to be resolved from `NEXT_PUBLIC_DASHBOARD_URL`, with a fallback to
 * anchors on the landing page for the case where no dashboard was deployed. The
 * dashboard is now mounted in this application, so there is no environment to read and
 * no fallback to take: what is left to protect is that every call to action reaches a
 * route that exists, and that none of them regress to an on-page anchor.
 *
 * The methodology link is no longer one of them. The landing page carries no
 * methodology, so only the evidence pages offer it — but it is still a destination this
 * site hands out, so it still has to resolve.
 */
describe('dashboard destinations', () => {
  it('sends the reader to routes this application serves', () => {
    expect(dashboardLinks.assets).toBe('/dashboard');
    expect(dashboardLinks.methodology).toBe('/dashboard/methodology');
  });

  it('never degrades to an anchor on the landing page', () => {
    for (const href of Object.values(dashboardLinks)) {
      expect(href.startsWith('#')).toBe(false);
      expect(href.startsWith(DASHBOARD_BASE)).toBe(true);
    }
  });

  it('promises the product rather than a preview of it', () => {
    expect(dashboardCopy.nav).toBe('Dashboard');
    expect(dashboardCopy.assets.toLowerCase()).not.toContain('sample');
  });
});

describe('dashboard route builder', () => {
  it('returns the bare path when nothing is filtered', () => {
    expect(dashboardPath()).toBe('/dashboard');
    expect(dashboardPath('')).toBe('/dashboard');
  });

  it('appends a query string that is already built', () => {
    expect(dashboardPath('band=CRITICAL')).toBe('/dashboard?band=CRITICAL');
  });

  it('escapes an asset id, which carries a colon and an issuer', () => {
    expect(dashboardAssetPath('USDC:GA5Z')).toBe(
      '/dashboard/asset/USDC%3AGA5Z',
    );
  });
});

/**
 * The encoding used to compound. Next hands the `[assetId]` segment over still
 * percent-encoded, the page passed it straight back into the link builders, and each
 * navigation added a layer: `%3A`, then `%253A`, then `%25253A`. The engine tolerates
 * the first and refuses the second as INVALID_ASSET_ID, so the asset page loaded and
 * then broke on the first click of a window, resolution or source control.
 */
describe('an assetId that has been round-tripped through the URL', () => {
  const decoded = 'USDC:GA5Z';
  const encoded = 'USDC%3AGA5Z';

  it('decodes a route segment back to the form the engine names', () => {
    expect(decodeAssetId(encoded)).toBe(decoded);
  });

  it('leaves an already-decoded id alone, so decoding twice is safe', () => {
    expect(decodeAssetId(decoded)).toBe(decoded);
    expect(decodeAssetId(decodeAssetId(encoded))).toBe(decoded);
  });

  it('returns a malformed escape untouched rather than throwing', () => {
    expect(decodeAssetId('USDC%ZZ')).toBe('USDC%ZZ');
  });

  it('builds the same path from either form, however many times round', () => {
    const once = dashboardAssetPath(decoded);
    expect(dashboardAssetPath(encoded)).toBe(once);
    // The fixed point: feeding a built path's segment back in must not add a layer.
    expect(dashboardAssetPath(once.split('/asset/')[1]!)).toBe(once);
    expect(once).toBe('/dashboard/asset/USDC%3AGA5Z');
  });
});
