import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('live API smoke test and reference viewport captures', async ({ page }) => {
  test.setTimeout(120000);
  test.skip(
    process.env.LIVE_API !== '1',
    'Opt-in real-network verification; deterministic tests mock the API.',
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('main article')).toHaveCount(8, { timeout: 45000 });
  await expect
    .poll(
      () =>
        page
          .locator('main article img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
            ),
          ),
      { timeout: 30000 },
    )
    .toBe(true);
  mkdirSync('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/listing-desktop.png', fullPage: true });
  // Choose an actual API category for the closest content hierarchy to the reference.
  const phones = page.getByRole('checkbox', { name: 'Smartphones', exact: true });
  if (await phones.count()) {
    await phones.check();
    await expect(page.locator('main article').first()).toBeVisible();
    await expect(page.locator('main article')).toHaveCount(8);
    await page.screenshot({ path: 'artifacts/listing-smartphones.png', fullPage: true });
  }
  await page.locator('main article a').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30000 });
  await expect
    .poll(
      () =>
        page
          .getByRole('button', { name: /Zoom image of/ })
          .locator('img')
          .evaluate(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          ),
      { timeout: 30000 },
    )
    .toBe(true);
  await page.setViewportSize({ width: 1268, height: 827 });
  await page.screenshot({ path: 'artifacts/detail-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /Zoom image of/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: 'artifacts/gallery-desktop.png' });
  await page.getByRole('dialog').getByLabel('Zoom in', { exact: true }).click();
  await page.screenshot({ path: 'artifacts/gallery-zoomed.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Add .* to cart/ }).click();
  await page.getByRole('button', { name: 'Open cart, 1 item', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(page.getByText('Checkout will be implemented soon.')).toBeVisible();
  await page.screenshot({ path: 'artifacts/cart-desktop.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Your cart' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({ path: 'artifacts/detail-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/detail-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page.locator('main article')).toHaveCount(8);
  await page.screenshot({ path: 'artifacts/listing-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});
