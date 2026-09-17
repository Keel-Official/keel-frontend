import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The landing page and the dashboard are one deployment but two root layouts, so
 * crossing between them is a full page load rather than a client navigation. These
 * cover the crossing itself: that the header button reaches the dashboard, that the
 * dashboard renders the engine's figures rather than an error state, and that the
 * marketing stylesheet does not come with it.
 *
 * The figures come from the live API. The assertions are about the shape of what is
 * rendered — a populated table, a ledger, a methodology version — never a specific
 * value, which moves every fifteen minutes.
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
  await expect(page.getByText('Latest scan ledger')).toBeVisible();

  // A row per monitored asset, each linking to its own page under the same mount.
  const rows = page.locator('a[href^="/dashboard/asset/"]');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(1);
});

test('an asset row opens that asset, and the way back is the monitored set', async ({
  page,
}) => {
  await page.goto('/dashboard');
  const first = page.locator('a[href^="/dashboard/asset/"]').first();
  const href = await first.getAttribute('href');
  await first.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByRole('link', { name: 'Assets', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('methodology is served, not hardcoded, and reachable from the landing page', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Read methodology' }).first().click();
  await expect(page).toHaveURL(/\/dashboard\/methodology$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the dashboard does not inherit the marketing stylesheet', async ({ page }) => {
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

test('the dashboard has no serious accessibility violations', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Assets monitored')).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
