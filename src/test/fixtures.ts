import type { Product } from '../features/products/api/productsApi';

// Synthetic data exists only in deterministic tests, never in the running application.
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Test handset',
    price: 100,
    rating: 4.5,
    category: 'phones',
    brand: 'Test Brand',
    description: 'A test device',
    thumbnail: 'https://example.com/image.webp',
    images: ['https://example.com/image.webp', 'https://example.com/back.webp'],
    reviews: [{ rating: 4, reviewerName: 'Test reviewer', comment: 'Test review' }],
    ...overrides,
  };
}
export const products = [
  makeProduct({ id: 1, title: 'Alpha phone', price: 100, rating: 3 }),
  makeProduct({ id: 2, title: 'Beta phone', price: 200, rating: 5, brand: 'Other Brand' }),
  makeProduct({ id: 3, title: 'Gamma laptop', category: 'laptops', price: 300, rating: 4 }),
  makeProduct({ id: 4, title: 'Delta food', category: 'groceries', price: 10, brand: undefined }),
];
