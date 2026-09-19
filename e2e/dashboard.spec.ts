import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { PAGE_SIZE } from '../lib/keel/url/asset-query';

/**
 * The landing page and the dashboard are one deployment but two root layouts, so
 * crossing between them is a full page load rather than a client navigation. These
 * cover the crossing itself: that the header button reaches the dashboard, that the
 * dashboard renders the engine's figures rather than an error state, and that the
 * marketing stylesheet does not come with it.
 *
 * The figures come from the live API. The assertions are about the shape of what is
 * rendered — a populated table, a ledger, a heading — never a specific value, which
 * moves every fifteen minutes.
 */

test('the header button opens the dashboard and the dashboard shows the monitored set', async ({
  page,
}) => {
  await page.goto('/');

  const button = page.getByRole('link', { name: 'Dashboard' }).first();
  await expect(button).toHaveAttribute('href', '/dashboard');
  await button.click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Assets monitored')).toBeVisible();
  // The ledger and its age moved to the shell's provenance strip when the hero
  // took the composition note; this asserts the surviving copy, not the old one.
  await expect(page.getByText('Ledger', { exact: true })).toBeVisible();

  // The two counts a reader acts on first, each a link to its own filtered view.
  await expect(
    page.getByRole('link', { name: /^Critical risk/ }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /^High risk/ })).toBeVisible();

  // A row per monitored asset, each leading to that asset's own result.
  const openers = page.locator('tbody a[href^="/dashboard/asset/"]');
  expect(await openers.count()).toBeGreaterThan(1);
});

test('a row leads to that asset, and the way back is the monitored set', async ({
  page,
}) => {
  await page.goto('/dashboard');

  const first = page.locator('tbody a[href^="/dashboard/asset/"]').first();
  const href = await first.getAttribute('href');
  await first.click();

  await expect(page).toHaveURL(
    new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  // The h1 names the asset and is carried for screen readers rather than for the
  // layout, so it is asserted as attached rather than as painted.
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached();

  // The evidence a reader came for, on the asset's own page rather than beside the
  // table: the depth ladder, and the series behind it.
  await expect(
    page.getByRole('heading', {
      name: /what volume can it absorb before the price moves/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /which checks were firing/i }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Assets', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('the trend window is a link and survives a filter', async ({ page }) => {
  await page.goto('/dashboard');

  const tabs = page.locator('nav[aria-label="Trend window"] a');
  await tabs.filter({ hasText: '24h' }).click();
  await expect(page).toHaveURL(/range=24h/);

  // The chart labels itself from the readings that came back, never from the window
  // that was asked for: stored coverage is only as old as the deployment, so a wide
  // window can hold less than it implies and an axis claiming otherwise reads as
  // broken data rather than as young data.
  await expect(
    page.locator('nav[aria-label="Trend window"] a[aria-current]'),
  ).toHaveText(/24h/);

  await page.getByRole('link', { name: /^High risk/ }).click();
  await expect(page).toHaveURL(/range=24h/);
  await expect(page).toHaveURL(/band=HIGH/);
});

test('search lives in the header and carries the rest of the view with it', async ({
  page,
}) => {
  // A GET form replaces the whole query string with its own fields, so every other
  // choice a reader has made has to ride through as a hidden input or a search would
  // silently clear it.
  await page.goto('/dashboard?band=CRITICAL&sort=depth&dir=desc');

  // Located by its accessible name on the summary: a <details> summary is not exposed
  // as a button or a group with a queryable name in Chromium, so a role query finds
  // nothing here even though the control announces itself correctly.
  await page.locator('summary[aria-label^="Search and filter assets"]').click();
  await page.getByLabel('Code or issuer').fill('US');
  // `exact`, because Playwright matches an accessible name as a substring and one of
  // the glossary buttons explains a flag with "...so you can apply your own policy".
  await page.getByRole('button', { name: 'Apply', exact: true }).click();

  await expect(page).toHaveURL(/q=US/);
  await expect(page).toHaveURL(/band=CRITICAL/);
  await expect(page).toHaveURL(/sort=depth/);
  await expect(page).toHaveURL(/dir=desc/);
});

test('the monitored set opens as one section per band', async ({ page }) => {
  // The page used to be a single table behind four filter chips, which meant the shape
  // of the market was something a reader had to reconstruct by clicking. Every band is
  // a section, including one holding nothing, because an absent section says nothing.
  await page.goto('/dashboard');

  for (const band of ['Critical', 'High', 'Medium', 'Low']) {
    await expect(
      page.getByRole('heading', { level: 3, name: new RegExp(`^${band}`) }),
    ).toBeVisible();
  }

  // A band with more rows than its preview says how many are behind the link, and the
  // link is where the window columns are.
  const seeAll = page.getByRole('link', { name: /^See all \d+ critical/ });
  await expect(seeAll).toBeVisible();
  await seeAll.click();
  await expect(page).toHaveURL(/band=CRITICAL/);
});

test('the table pages, and paging is part of the shareable view', async ({
  page,
}) => {
  // Paging belongs to a band's own view now: the overview previews every band instead.
  await page.goto('/dashboard?band=CRITICAL');
  // Derived, not hardcoded: the page size is one constant and changing it should not
  // take a passing suite with it.
  await expect(page.locator('tbody tr')).toHaveCount(PAGE_SIZE);

  const pages = page.getByRole('navigation', { name: 'Table pages' });
  // The count sits beside the bar rather than inside it: the bar is navigation, the
  // count is a statement about the set.
  await expect(page.getByText(`Showing 1 to ${PAGE_SIZE} of`)).toBeVisible();
  // At the first page there is nowhere back, and that control is disabled rather than
  // a link that goes nowhere.
  await expect(
    pages.getByRole('button', { name: 'Previous page' }),
  ).toBeDisabled();

  await pages.getByRole('link', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(
    page.getByText(`Showing ${PAGE_SIZE + 1} to ${PAGE_SIZE * 2} of`),
  ).toBeVisible();
  // `getByRole` has no `current` option, so the attribute is matched directly.
  await expect(pages.locator('a[aria-current="page"]')).toHaveText('2');
});

test('a page past the end shows the last page rather than an empty table', async ({
  page,
}) => {
  await page.goto('/dashboard?band=CRITICAL&page=99');
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await expect(page.getByText(/Showing \d+ to \d+ of/)).toBeVisible();
});

test('filtering returns to the first page', async ({ page }) => {
  // Page three of a filtered set holds different assets, and often does not exist at
  // all. Keeping the old number would land the reader past the end.
  await page.goto('/dashboard?band=CRITICAL&page=3');
  await page.getByRole('link', { name: /^High risk/ }).click();

  await expect(page).toHaveURL(/band=HIGH/);
  await expect(page).not.toHaveURL(/page=/);
});

test('the theme is served, not applied after paint', async ({ page }) => {
  // The palette is on the html element in the first byte of HTML. If this ever needs
  // an inline script or an effect, a reader who chose dark sees a light frame first.
  await page.goto('/dashboard');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: /Switch to the dark theme/ }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
});

test('methodology is served, not hardcoded, and reachable from its evidence page', async ({
  page,
}) => {
  // The landing page deliberately carries no methodology. The recording of it does,
  // and that is where the live version is offered.
  await page.goto('/evidence/methodology');
  await page.getByRole('link', { name: 'See the same thing live' }).click();
  await expect(page).toHaveURL(/\/dashboard\/methodology$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the landing page offers no methodology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/methodolog/i)).toHaveCount(0);
  await expect(page.locator('a[href*="methodology"]')).toHaveCount(0);
});

test('the dashboard does not inherit the marketing stylesheet', async ({
  page,
}) => {
  await page.goto('/dashboard');
  // `.hero-section` only exists in the marketing sheet. If it resolves to a rule here,
  // the two root layouts have collapsed into one and the token collisions are back.
  const marketingRuleLeaked = await page.evaluate(() =>
    [...document.styleSheets].some((sheet) => {
      try {
        return [...sheet.cssRules].some((rule) =>
          rule.cssText.includes('.hero-section'),
        );
      } catch {
        return false;
      }
    }),
  );
  expect(marketingRuleLeaked).toBe(false);
});

test('the dashboard has no serious accessibility violations', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Assets monitored')).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test('an asset result has no serious accessibility violations', async ({
  page,
}) => {
  // The asset page carries most of the product's density — three tables, five figure
  // lists, four charts and the flag groups — so it is checked in its own right rather
  // than behind a click the overview scan never makes.
  await page.goto('/dashboard');
  await page.locator('tbody a[href^="/dashboard/asset/"]').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test('both palettes are accessible, not just the one that ships by default', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /Switch to the dark theme/ }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
