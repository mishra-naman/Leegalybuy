import { describe, expect, it } from 'vitest';
import { products } from '../../../test/fixtures';
import { emptyFilters } from '../../filters/filterState';
import { filterProducts, paginate, sortProducts } from './filterProducts';

describe('catalogue processing', () => {
  it('matches any selected category, and returns all when none are selected', () => {
    expect(filterProducts(products, emptyFilters)).toHaveLength(4);
    expect(filterProducts(products, { ...emptyFilters, categories: ['phones'] })).toHaveLength(2);
    expect(
      filterProducts(products, { ...emptyFilters, categories: ['phones', 'laptops'] }),
    ).toHaveLength(3);
  });
  it('matches any selected brand and tolerates missing brands', () => {
    expect(filterProducts(products, { ...emptyFilters, brands: ['Test Brand'] })).toHaveLength(2);
    expect(
      filterProducts(products, { ...emptyFilters, brands: ['Test Brand', 'Other Brand'] }),
    ).toHaveLength(3);
  });
  it('includes exact price boundaries', () => {
    expect(
      filterProducts(products, { ...emptyFilters, min: 100, max: 200 }).map((p) => p.id),
    ).toEqual([1, 2]);
    expect(filterProducts(products, { ...emptyFilters, min: 100, max: 100 })).toHaveLength(1);
  });
  it('combines all filter groups with AND and searches without case sensitivity', () => {
    expect(
      filterProducts(products, {
        ...emptyFilters,
        categories: ['phones', 'laptops'],
        brands: ['Test Brand'],
        min: 100,
        max: 200,
        q: 'ALPHA',
      }).map((p) => p.id),
    ).toEqual([1]);
    expect(
      filterProducts(products, { ...emptyFilters, categories: ['phones'], brands: ['absent'] }),
    ).toEqual([]);
    expect(filterProducts(products, { ...emptyFilters, q: 'no match' })).toEqual([]);
  });
  it('sorts before pagination without mutating the source', () => {
    expect(sortProducts(products, 'price-asc').map((p) => p.id)).toEqual([4, 1, 2, 3]);
    expect(sortProducts(products, 'price-desc')[0].id).toBe(3);
    expect(sortProducts(products, 'rating-desc')[0].id).toBe(2);
    expect(sortProducts(products, 'name-asc').map((p) => p.id)).toEqual([1, 2, 4, 3]);
    expect(paginate(sortProducts(products, 'price-asc'), 2, 2).items.map((p) => p.id)).toEqual([
      2, 3,
    ]);
    expect(products.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });
  it('clamps pages, including empty collections', () => {
    expect(paginate(products, 100, 2)).toMatchObject({ page: 2, pageCount: 2, total: 4 });
    expect(paginate(products, -2, 2).page).toBe(1);
    expect(paginate([], 99)).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });
});
