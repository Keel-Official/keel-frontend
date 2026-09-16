import { expect, test } from '@playwright/test';

const ASSET = 'USTRY:GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC';
const NARROW = { width: 360, height: 780 };

test('the first tab stop skips to the content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const focused = page.locator(':focus');
  await expect(focused).toHaveText(/Skip to content/);
  await expect(focused).toBeVisible();
});

test('focus is visible on the controls a reader drives the table with', async ({
  page,
}) => {
  await page.goto('/');

  // A focus ring that is invisible is the same as no focus ring. Every interactive
  // element here opts into one explicitly rather than relying on the UA default,
  // which Tailwind's preflight removes.
  for (const name of [/Assets/, /Methodology/]) {
    const link = page.getByRole('link', { name }).first();
    await link.focus();
    await expect(link).toBeFocused();

    const outlineWidth = await link.evaluate(
      (node) => getComputedStyle(node).outlineWidth,
    );
    expect(outlineWidth).not.toBe('0px');
  }
});

test('the table can be sorted and filtered without a pointer', async ({ page }) => {
  await page.goto('/');

  const bandHeading = page.getByRole('link', { name: /^Band/ });
  await bandHeading.focus();
  await page.keyboard.press('Enter');

  // Filter state is the URL, so a keyboard-only reader ends up with a shareable view
  // that says both what it is ordered by and in which direction.
  await expect(page).toHaveURL(/sort=band/);
  await expect(page).toHaveURL(/dir=desc/);
});

test('a filtered view is a link a reviewer can send', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Critical', exact: true }).click();

  await expect(page).toHaveURL(/band=CRITICAL/);
  await expect(page.locator('main')).toContainText('Critical');
});

test('a row leads to the asset it names', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('table tbody tr').first().getByRole('link').first();
  const code = (await first.textContent())?.trim() ?? '';

  await first.click();

  // The link carries the full CODE:ISSUER identity, percent-encoded. The content of
  // the page is not asserted here: the contract mock serves the same example
  // whatever asset is requested, so a body check would be testing Prism rather than
  // the drill-down.
  await expect(page).toHaveURL(new RegExp(`/asset/${code}(%3A|:)`));
});

test.describe('at 360px', () => {
  test.use({ viewport: NARROW });

  for (const path of ['/', '/methodology', `/asset/${encodeURIComponent(ASSET)}`]) {
    test(`${path} does not scroll sideways`, async ({ page }) => {
      await page.goto(path);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });

      // A horizontal page scroll on a phone means a reader has to drag the page to
      // read a figure, which on a risk table means reading half a row.
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('the asset list becomes cards rather than a table to scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('table')).toBeHidden();
    await expect(page.locator('main ul li').first()).toBeVisible();
  });
});

test('motion is suppressed when the reader asks for that', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');

  const duration = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.transition = 'opacity 2s';
    document.body.append(probe);
    const value = getComputedStyle(probe).transitionDuration;
    probe.remove();
    return value;
  });

  // Chrome reports the computed value in seconds: 0.01ms serialises as 1e-05s.
  expect(['0.01ms', '1e-05s']).toContain(duration);
  await context.close();
});
