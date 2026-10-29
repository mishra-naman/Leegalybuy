import { test, expect } from '@playwright/test';
import { makeProduct } from '../src/test/fixtures';

test.beforeEach(async ({ page }) => {
  const products = Array.from({ length: 12 }, (_, index) =>
    makeProduct({ id: index + 1, title: `Product ${index + 1}`, category: 'phones' }),
  );
  await page.route('https://dummyjson.com/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/categories'))
      return route.fulfill({
        json: Array.from({ length: 18 }, (_, index) => ({
          slug: index ? `category-${index}` : 'phones',
          name: index ? `Category ${index}` : 'Phones',
        })),
      });
    if (/\/products\/\d+$/.test(path)) return route.fulfill({ json: products[0] });
    return route.fulfill({ json: { products, total: products.length } });
  });
  await page.route('https://example.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 400 400"><rect x="120" y="20" width="160" height="360" rx="12" fill="#34465b"/></svg>',
    }),
  );
});

test('quantity controls stay synchronized between listing, detail and drawer without toast spam', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('main article').first();
  await card.getByLabel('Add Product 1 to cart', { exact: true }).click();
  await expect(card.getByLabel('Product 1 quantity', { exact: true })).toHaveText('1');
  await expect(page.locator('[data-toast]')).toHaveCount(1);
  await page.getByLabel('Dismiss notification').click();
  await card.getByLabel('Increase Product 1 quantity', { exact: true }).click();
  await card.getByLabel('Increase Product 1 quantity', { exact: true }).click();
  await expect(card.getByLabel('Product 1 quantity', { exact: true })).toHaveText('3');
  await expect(page.locator('[data-toast]')).toHaveCount(0);
  await card.getByRole('link').click();
  const info = page.getByRole('region', { name: 'Product information' });
  await expect(info.getByLabel('Product 1 quantity', { exact: true })).toHaveText('3');
  await info.getByLabel('Decrease Product 1 quantity', { exact: true }).click();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Cart (2)', exact: true })
    .click();
  const cart = page.getByRole('dialog', { name: 'Your cart' });
  await expect(cart.getByLabel('Product 1 quantity', { exact: true })).toHaveText('2');
  await cart.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(cart.locator('[data-toast]')).toHaveCount(1);
  await expect(cart.getByText('Checkout will be implemented soon.')).toBeVisible();
  await cart.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(cart.locator('[data-toast]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await info.getByLabel('Decrease Product 1 quantity', { exact: true }).click();
  await info.getByLabel('Decrease Product 1 quantity', { exact: true }).click();
  await expect(info.getByLabel('Add Product 1 to cart', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open cart, 0 items', exact: true })).toBeVisible();
});

test('clear icon resets filters and their search while preserving product search', async ({
  page,
}) => {
  await page.goto('/?q=Product&category=phones&brand=Test+Brand&min=20&max=200');
  const search = page.getByRole('searchbox', { name: 'Search filters', exact: true });
  await search.fill('Phones');
  const clear = page.getByRole('button', { name: 'Clear filters', exact: true });
  await expect(clear).toBeEnabled();
  const inputBounds = await search.boundingBox();
  const clearBounds = await clear.boundingBox();
  expect(clearBounds?.x).toBeGreaterThan((inputBounds?.x ?? 0) + (inputBounds?.width ?? 0));
  await clear.click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('searchbox', { name: 'Search products', exact: true })).toHaveValue(
    'Product',
  );
  await expect(page).toHaveURL(/\?q=Product$/);
  await expect(page.getByRole('checkbox', { name: 'Phones', exact: true })).not.toBeChecked();
  await expect(page.getByLabel('Minimum price', { exact: true })).toHaveValue('');
  const categories = page.getByLabel('Available categories', { exact: true });
  await expect(categories).toHaveCSS('overflow-y', 'scroll');
  await expect(categories).toHaveCSS('scrollbar-width', 'auto');
  await categories.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole('checkbox', { name: 'Category 17', exact: true })).toBeInViewport();
});

test('detail fits a short desktop viewport while its information column scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1231, height: 500 });
  await page.goto('/product/1');
  const main = page.getByRole('main');
  await expect(page.getByRole('heading', { name: 'Product 1', exact: true })).toBeVisible();
  await expect(main).toHaveCSS('overflow-y', 'hidden');
  await expect
    .poll(() => main.evaluate((element) => element.scrollHeight === element.clientHeight))
    .toBe(true);
  await expect(page.getByRole('navigation', { name: 'Gallery images' })).toBeInViewport();
  const info = page.getByRole('region', { name: 'Product information' });
  await info.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(info.getByText('Test review', { exact: true })).toBeInViewport();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollHeight === innerHeight &&
          document.documentElement.scrollWidth === innerWidth,
      ),
    )
    .toBe(true);
});

test('mobile detail and image viewer keep all controls reachable without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto('/product/1');
  const main = page.getByRole('main');
  await expect(main).toHaveCSS('overflow-y', 'auto');
  await page.getByRole('button', { name: 'Zoom image of Product 1' }).click();
  const dialog = page.getByRole('dialog', { name: 'Image gallery: Product 1' });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  const imageBounds = await dialog
    .getByRole('img', { name: 'Product 1, image 1', exact: true })
    .boundingBox();
  if (!bounds || !imageBounds) throw new Error('Gallery image is not visible.');
  expect(imageBounds.y).toBeGreaterThanOrEqual(bounds.y);
  expect(imageBounds.y + imageBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height);
  await dialog.getByLabel('Zoom in', { exact: true }).click();
  await dialog.getByLabel('Zoom in', { exact: true }).click();
  expect(await dialog.boundingBox()).toEqual(bounds);
  await expect(dialog.getByLabel('Zoom level')).toHaveText('200%');
  await expect(dialog.getByLabel('Close image gallery', { exact: true })).toBeInViewport();
  await expect(dialog.getByLabel('Reset zoom', { exact: true })).toBeInViewport();
  await dialog.getByLabel('Close image gallery', { exact: true }).click();
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByText('Test review', { exact: true })).toBeInViewport();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth === innerWidth))
    .toBe(true);
});
