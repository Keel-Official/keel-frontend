import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * A risk dashboard that a reader cannot operate is not a risk dashboard.
 *
 * The routes are checked in the display states that matter rather than only in the
 * healthy one, because the states this product exists to report — an unmeasured
 * figure, an asset with no executable price, a book whose midpoint means nothing —
 * are exactly the ones a component is most likely to render as a bare dash or a
 * colour with no text behind it.
 */

const ASSET = 'USTRY:GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC';

const ROUTES: { name: string; path: string }[] = [
  { name: 'monitored set', path: '/' },
  { name: 'monitored set, filtered', path: '/?band=CRITICAL&sort=collateral&dir=desc' },
  { name: 'methodology', path: '/methodology' },
  { name: 'asset detail, healthy', path: `/asset/${encodeURIComponent(ASSET)}?mock=healthy` },
  { name: 'asset detail, no price', path: `/asset/${encodeURIComponent(ASSET)}?mock=noPrice` },
  { name: 'asset detail, broken book', path: `/asset/${encodeURIComponent(ASSET)}?mock=brokenBook` },
  { name: 'asset detail, pool only', path: `/asset/${encodeURIComponent(ASSET)}?mock=poolOnly` },
];

async function scan(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}

for (const route of ROUTES) {
  test(`${route.name} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route.path);
    const results = await scan(page);

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(
      blocking.map((v) => `${v.impact}: ${v.id} — ${v.nodes.length} node(s)`),
    ).toEqual([]);
  });
}

test('every page states the ledger and the methodology version on screen', async ({
  page,
}) => {
  // A screenshot of any page has to be enough to re-verify the number it shows, so
  // this is in the header rather than a tooltip or a footer.
  for (const path of ['/', '/methodology', `/asset/${encodeURIComponent(ASSET)}`]) {
    await page.goto(path);
    const header = page.locator('header');
    await expect(header).toContainText('Ledger');
    await expect(header).toContainText('Methodology');
  }
});

test('band is never carried by colour alone', async ({ page }) => {
  await page.goto(`/asset/${encodeURIComponent(ASSET)}?mock=brokenBook`);

  // The band word is present as text, so the reading survives with colour removed.
  const main = page.locator('main');
  await expect(main).toContainText(/Critical/);
  await expect(main).toContainText(/partial confidence/);

  // And an icon sits beside it, so two bands are never told apart by hue alone.
  await expect(main.locator('svg').first()).toBeVisible();
});

test('an unmeasured value says so rather than showing a zero', async ({ page }) => {
  await page.goto(`/asset/${encodeURIComponent(ASSET)}?mock=noPrice`);
  const main = page.locator('main');

  await expect(main).toContainText('not computed');
  // The no-price example sends maxSafeCollateral: null. A "0" there would claim the
  // engine computed a ceiling of zero, which is a different finding.
  await expect(main).toContainText('No ceiling was computed');
});

test('mock data is labelled as mock data in the page itself', async ({ page }) => {
  await page.goto(`/asset/${encodeURIComponent(ASSET)}?mock=healthy`);
  await expect(page.locator('main')).toContainText('contract mock example');
});
