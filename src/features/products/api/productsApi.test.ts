import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';
import {
  ApiError,
  getCategories,
  getProductById,
  getProducts,
  getProductsByCategory,
} from './productsApi';

afterEach(() => vi.unstubAllGlobals());
describe('validated product API', () => {
  it('uses limit=0 and fetches the remaining pages if an API caps it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ products: [makeProduct()], total: 2 }))
      .mockResolvedValueOnce(Response.json({ products: [makeProduct({ id: 2 })], total: 2 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await getProducts()).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://dummyjson.com/products?limit=0');
    expect(fetchMock.mock.calls[1][0]).toBe('https://dummyjson.com/products?limit=100&skip=1');
  });
  it('normalizes both object and string categories', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json([
          'home-decoration',
          {
            slug: 'phones',
            name: 'Phones',
            url: 'https://dummyjson.com/products/category/phones',
          },
        ]),
      ),
    );
    expect(await getCategories()).toEqual([
      { slug: 'home-decoration', name: 'Home Decoration' },
      { slug: 'phones', name: 'Phones' },
    ]);
  });
  it('uses category and detail endpoints, retaining optional values safely', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ products: [makeProduct({ brand: null, images: null })], total: 1 }),
      )
      .mockResolvedValueOnce(Response.json(makeProduct()));
    vi.stubGlobal('fetch', fetchMock);
    expect((await getProductsByCategory('phones'))[0].brand).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toContain('/products/category/phones?limit=0');
    expect((await getProductById(1)).id).toBe(1);
  });
  it('reports invalid responses, missing products, network failures and incomplete pages', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ id: 'invalid' }))
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce(Response.json({ products: [], total: 2 }))
      .mockResolvedValueOnce(Response.json({ products: [], total: 2 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getProductById(1)).rejects.toThrow('unexpected data');
    await expect(getProductById(1)).rejects.toMatchObject({ status: 404 });
    await expect(getProducts()).rejects.toBeInstanceOf(ApiError);
    await expect(getProducts()).rejects.toThrow('incomplete catalogue');
  });
  it('preserves request cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    const abort = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(getProducts(controller.signal)).rejects.toBe(abort);
  });
});
