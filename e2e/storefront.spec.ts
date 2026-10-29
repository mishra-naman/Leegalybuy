import { test, expect, type Page } from '@playwright/test';
import { makeProduct } from '../src/test/fixtures';

const catalog = Array.from({ length: 24 }, (_, index) =>
  makeProduct({
    id: index + 1,
    title: `Test product ${String(index + 1).padStart(2, '0')}`,
    price: 10 + index * 10,
    category: index < 16 ? 'phones' : 'laptops',
    brand: index % 2 ? 'Other Brand' : 'Test Brand',
  }),
);
async function mockApi(page: Page) {
  await page.route('https://dummyjson.com/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/products/categories')
      return route.fulfill({
        json: [
          { slug: 'phones', name: 'Phones' },
          { slug: 'laptops', name: 'Laptops' },
        ],
      });
    if (/\/products\/\d+$/.test(url.pathname)) {
      const item = catalog.find((product) => product.id === Number(url.pathname.split('/').at(-1)));
      return route.fulfill({ status: item ? 200 : 404, json: item ?? { message: 'Not found' } });
    }
    const category = url.pathname.split('/category/')[1];
    const products = category
      ? catalog.filter((product) => product.category === category)
      : catalog;
    return route.fulfill({ json: { products, total: products.length } });
  });
  await page.route('https://example.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect x="60" y="20" width="80" height="160" rx="10" fill="#34465b"/></svg>',
    }),
  );
}
test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('combines category, brand, price, search and sorting with URL persistence', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('main article')).toHaveCount(8);
  await page.getByRole('checkbox', { name: 'Phones', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Test Brand', exact: true }).check();
  await page.getByLabel('Minimum price', { exact: true }).fill('30');
  await page.getByLabel('Maximum price', { exact: true }).fill('110');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.getByRole('combobox', { name: 'Sort products' }).selectOption('price-desc');
  await expect(page.locator('main article')).toHaveCount(5);
  await expect(page.locator('main article').first()).toContainText('Test product 11');
  await page.getByRole('searchbox', { name: 'Search products', exact: true }).fill('product 05');
  await expect(page.locator('main article')).toHaveCount(1);
  await expect(page.getByRole('searchbox', { name: 'Search filters' })).toHaveValue('');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Test Brand', exact: true })).toBeChecked();
  await expect(page.getByLabel('Minimum price', { exact: true })).toHaveValue('30');
  await expect(page.locator('main article')).toHaveCount(1);
});

test('paginates, opens details and preserves the exact listing context after refresh', async ({
  page,
}) => {
  await page.goto('/?sort=price-desc');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  const listing = page.url();
  await page.getByRole('link', { name: 'View Test product 16' }).click();
  await expect(page.getByRole('heading', { name: 'Test product 16', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(listing);
  await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('filter search and product search keep independent state', async ({ page }) => {
  await page.goto('/');
  const filterSearch = page.getByRole('searchbox', { name: 'Search filters', exact: true });
  const productSearch = page.getByRole('searchbox', { name: 'Search products', exact: true });
  await filterSearch.fill('Phones');
  await expect(page.getByRole('checkbox', { name: 'Phones', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Laptops', exact: true })).toHaveCount(0);
  await expect(page.locator('main article')).toHaveCount(8);
  await expect(productSearch).toHaveValue('');
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
  await productSearch.fill('product 05');
  await expect(page.locator('main article')).toHaveCount(1);
  await expect(filterSearch).toHaveValue('Phones');
  await filterSearch.fill('Brand');
  await expect(page.getByRole('checkbox', { name: 'Test Brand', exact: true })).toBeVisible();
  await expect(productSearch).toHaveValue('product 05');
  await expect(page.locator('main article')).toHaveCount(1);
});

test('fills the viewport and scrolls content while keeping the header visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1231, height: 500 });
  await page.goto('/');
  await expect(page.locator('main article')).toHaveCount(8);
  const shell = page.getByRole('banner').locator('..');
  await expect(shell).toHaveCSS('width', '1231px');
  await expect(shell).toHaveCSS('height', '500px');
  const main = page.getByRole('main');
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole('banner')).toBeInViewport();
  await expect(page.getByRole('navigation', { name: 'Product pages' })).toBeInViewport();
  const sidebar = page.getByRole('complementary', { name: 'Product filters' });
  await sidebar.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
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

test('cart merges duplicates, changes quantity, persists and removes', async ({ page }) => {
  await page.goto('/');
  const add = page.getByRole('button', { name: 'Add Test product 01 to cart', exact: true });
  await add.click();
  await page.getByLabel('Increase Test product 01 quantity', { exact: true }).click();
  await page.getByRole('button', { name: 'Open cart, 2 items' }).click();
  const cart = page.getByRole('dialog', { name: 'Your cart' });
  await expect(cart.getByText('$20', { exact: true })).toHaveCount(2);
  await cart.getByLabel('Increase Test product 01 quantity', { exact: true }).click();
  await expect(cart.getByText('$30', { exact: true })).toHaveCount(2);
  await page.reload();
  await page.getByRole('button', { name: 'Open cart, 3 items' }).click();
  await page.getByLabel('Decrease Test product 01 quantity', { exact: true }).click();
  await page.getByLabel('Remove Test product 01', { exact: true }).click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(cart).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Open cart, 0 items' })).toBeFocused();
});

test('theme persists and zoom supports controls, keyboard navigation, focus and scroll locking', async ({
  page,
}) => {
  await page.goto('/product/1');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(
    page.getByRole('button', { name: 'Switch to light theme' }).locator('svg'),
  ).toHaveClass(/lucide-sun/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /Zoom image of/ }).click();
  const gallery = page.getByRole('dialog', { name: /Image gallery:/ });
  await expect(gallery).toBeVisible();
  const bounds = await gallery.boundingBox();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await gallery.getByLabel('Zoom in', { exact: true }).click();
  await expect(gallery.getByLabel('Zoom level')).toHaveText('150%');
  expect(await gallery.boundingBox()).toEqual(bounds);
  await gallery.getByLabel('Zoom out', { exact: true }).click();
  await expect(gallery.getByLabel('Zoom level')).toHaveText('100%');
  await gallery.getByLabel('Zoom in', { exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByText('2 / 2')).toBeVisible();
  await expect(gallery.getByLabel('Zoom level')).toHaveText('100%');
  await gallery.getByLabel('Previous image', { exact: true }).click();
  await gallery.getByLabel('Reset zoom', { exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(gallery).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Zoom image of/ })).toBeFocused();
  await page.getByRole('button', { name: 'Add Test product 01 to cart', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open cart, 1 item', exact: true })).toBeVisible();
});

test('search from detail returns to the listing with the requested search', async ({ page }) => {
  await page.goto('/product/1');
  await page.getByRole('searchbox', { name: 'Search products', exact: true }).fill('product 07');
  await expect(page).toHaveURL(/\/?q=product\+07/);
  await expect(page.locator('main article')).toHaveCount(1);
});

test('invalid ranges are announced and empty results can be cleared', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Minimum price', { exact: true }).fill('-10');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('zero or more');
  await page
    .getByRole('searchbox', { name: 'Search products', exact: true })
    .fill('unmatched query');
  await expect(page.getByText('No products found')).toBeVisible();
  await page.getByRole('main').getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main article')).toHaveCount(8);
});

test('normalizes malformed URLs and clamps out-of-range pages', async ({ page }) => {
  await page.goto('/?page=9999&min=-1&sort=bad');
  await expect(page).toHaveURL(/\?page=3$/);
  await expect(page.locator('main article')).toHaveCount(8);
  await page.getByRole('checkbox', { name: 'Laptops', exact: true }).check();
  await expect(page).toHaveURL(/\?category=laptops$/);
  await expect(page.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('handles nonexistent products and recoverable API errors', async ({ page }) => {
  await page.goto('/product/9999');
  await expect(page.getByRole('alert')).toContainText('could not be found');
  await page.goto('/product/not-a-number');
  await expect(page.getByRole('alert')).toContainText('link is invalid');
  await page.route('https://dummyjson.com/products?limit=0', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  await page.unroute('https://dummyjson.com/products?limit=0');
  await mockApi(page);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('main article')).toHaveCount(8);
});

test('mobile filters support applying, clearing, Escape and no horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Filters', exact: true });
  await drawer.getByRole('checkbox', { name: 'Phones', exact: true }).check();
  await drawer.getByLabel('Maximum price', { exact: true }).fill('50');
  await drawer.getByRole('button', { name: 'Apply', exact: true }).click();
  await drawer.getByRole('button', { name: 'Show results', exact: true }).click();
  await expect(page.locator('main article')).toHaveCount(5);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.getByRole('button', { name: 'Filters (1)', exact: true }).click();
  await drawer.getByRole('button', { name: 'Clear filters' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('main article')).toHaveCount(8);
});
