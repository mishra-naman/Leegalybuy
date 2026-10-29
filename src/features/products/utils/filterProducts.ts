import type { Filters } from '../../filters/filterState';
import type { Product } from '../api/productsApi';

export function filterProducts(products: readonly Product[], filters: Filters) {
  const query = filters.q.toLocaleLowerCase();
  return products.filter(
    (product) =>
      (!filters.categories.length || filters.categories.includes(product.category)) &&
      (!filters.brands.length || (!!product.brand && filters.brands.includes(product.brand))) &&
      (filters.min === undefined || product.price >= filters.min) &&
      (filters.max === undefined || product.price <= filters.max) &&
      (!query ||
        `${product.title} ${product.brand ?? ''} ${product.category} ${product.description ?? ''}`
          .toLocaleLowerCase()
          .includes(query)),
  );
}
export function sortProducts(products: readonly Product[], sort: Filters['sort']) {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating-desc':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}
export function paginate<T>(items: readonly T[], requestedPage: number, pageSize = 8) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.max(
    1,
    Math.min(pageCount, Number.isSafeInteger(requestedPage) ? requestedPage : 1),
  );
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageCount,
    total: items.length,
  };
}
