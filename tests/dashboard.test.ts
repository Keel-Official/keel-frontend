import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The resolver reads the environment once, when the module loads, so each case has to
 * load it again with a different environment.
 */
async function load(url: string | undefined) {
  vi.resetModules();
  if (url === undefined) delete process.env.NEXT_PUBLIC_DASHBOARD_URL;
  else process.env.NEXT_PUBLIC_DASHBOARD_URL = url;
  return import('../lib/dashboard');
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_DASHBOARD_URL;
  vi.resetModules();
});

describe('when no dashboard is configured', () => {
  it('falls back to sections on this page rather than a dead link', async () => {
    // A build that forgot the variable would otherwise ship a homepage whose primary
    // call to action points at localhost, which is dead for every visitor.
    const { dashboardLinks, dashboardIsLive } = await load(undefined);
    expect(dashboardIsLive).toBe(false);
    expect(dashboardLinks.assets).toBe('#markets');
    expect(dashboardLinks.methodology).toBe('#methodology');
  });

  it('promises a preview rather than a product', async () => {
    const { dashboardCopy } = await load(undefined);
    expect(dashboardCopy.assets).not.toContain('Explore');
    expect(dashboardCopy.assets.toLowerCase()).toContain('sample');
  });

  it('treats an empty or blank value as not configured', async () => {
    expect((await load('')).dashboardIsLive).toBe(false);
    expect((await load('   ')).dashboardIsLive).toBe(false);
  });
});

describe('when a dashboard is configured', () => {
  it('links to its routes', async () => {
    const { dashboardLinks, dashboardIsLive } = await load('https://dashboard.keels.app');
    expect(dashboardIsLive).toBe(true);
    expect(dashboardLinks.assets).toBe('https://dashboard.keels.app/');
    expect(dashboardLinks.methodology).toBe('https://dashboard.keels.app/methodology');
  });

  it('does not double the slash when the value has a trailing one', async () => {
    const { dashboardLinks } = await load('https://dashboard.keels.app/');
    expect(dashboardLinks.methodology).toBe('https://dashboard.keels.app/methodology');
    expect(dashboardLinks.assets).toBe('https://dashboard.keels.app/');
  });

  it('works when the dashboard sits on a path rather than a subdomain', async () => {
    const { dashboardLinks } = await load('https://keels.app/app');
    expect(dashboardLinks.assets).toBe('https://keels.app/app/');
    expect(dashboardLinks.methodology).toBe('https://keels.app/app/methodology');
  });

  it('works against a local dashboard during development', async () => {
    const { dashboardLinks } = await load('http://localhost:5173');
    expect(dashboardLinks.assets).toBe('http://localhost:5173/');
  });

  it('promises the product once there is one', async () => {
    const { dashboardCopy } = await load('https://dashboard.keels.app');
    expect(dashboardCopy.assets).toBe('Explore assets');
    expect(dashboardCopy.methodology).toBe('Read methodology');
  });
});
