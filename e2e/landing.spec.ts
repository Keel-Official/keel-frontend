import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844],
  ['tablet', 820, 1180],
  ['narrow', 320, 812],
] as const) {
  test(`${name}: readable product, real links, loaded fonts, and accessible layout`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toContainText('Know how much');
    await expect(page.locator('.hero-product')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const fonts = await page.evaluate(() =>
      [...document.fonts]
        .filter((font) => font.status === 'loaded')
        .map((font) => font.family),
    );
    expect(fonts.some((font) => /manrope/i.test(font))).toBe(true);
    if (width > 1000)
      expect(
        (await page.locator('.hero-product').boundingBox())!.y,
      ).toBeLessThan(height);
    if (name === 'mobile') {
      const menu = page.getByRole('button', {
        name: /^(Open|Close) navigation$/,
      });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toBeFocused();
      await menu.click();
      await page
        .getByRole('navigation', { name: 'Mobile navigation' })
        .getByRole('link', { name: 'Markets' })
        .click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(page).toHaveURL(/#markets$/);
    }
    for (const href of await page
      .locator('a[href^="#"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute('href')!)),
      ])) {
      await expect(page.locator(href)).toHaveCount(1);
    }
    const localLinks = await page
      .locator('a[href^="/evidence/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute('href')!)),
      ]);
    for (const href of localLinks)
      expect((await request.get(href)).ok(), href).toBe(true);
    await page.getByText('Inspect exact observations', { exact: true }).click();
    await expect(page.locator('.observation-table')).toBeVisible();
    await page.getByText('Inspect exact observations', { exact: true }).click();
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      accessibility.violations.map((item) => ({
        id: item.id,
        targets: item.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `.artifacts/landing-${name}-full.png`,
      fullPage: true,
    });
    await page.screenshot({ path: `.artifacts/landing-${name}-hero.png` });
    for (const id of ['markets', 'metrics', 'risk', 'case-study'])
      await page
        .locator(`#${id}`)
        .screenshot({ path: `.artifacts/landing-${name}-${id}.png` });
    expect(errors).toEqual([]);
  });
}

test('API response copy, social image, and branded missing page', async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy response' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  const copied = JSON.parse(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(copied.band).toBe('LOW');
  expect(copied.depth[0].buySide).toBe('441038.9920700');
  expect(await page.locator('.api-request').innerText()).toContain(
    '/v1/asset/USDC:',
  );
  expect(await page.locator('.api-request').innerText()).toContain('quote=XLM');
  // The URL is read off the page rather than written here. Next generates the social
  // image route with a content hash, so a hardcoded path passes until the file moves
  // and then reports a broken card that is not broken.
  const ogUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute('content');
  expect(ogUrl).toBeTruthy();
  const image = await request.get(ogUrl!);
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  // Both cards are served, and neither is left pointing at a route that does not exist.
  const twitterUrl = await page
    .locator('meta[name="twitter:image"]')
    .getAttribute('content');
  expect((await request.get(twitterUrl!)).status()).toBe(200);
  const missing = await page.goto('/missing-surface');
  expect(missing?.status()).toBe(404);
  await page.getByRole('link', { name: 'Return to Keel' }).click();
  await expect(page.locator('h1')).toContainText('Know how much');
});
