import { describe, expect, it } from 'vitest';

import { dashboardCopy, dashboardLinks } from '../lib/dashboard';
import {
  DASHBOARD_BASE,
  dashboardAssetPath,
  dashboardPath,
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
