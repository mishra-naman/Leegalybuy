import { describe, expect, it } from 'vitest';
import {
  emptyFilters,
  parseFilters,
  safeListingUrl,
  serializeFilters,
  validatePriceRange,
} from './filterState';

describe('URL filters and price validation', () => {
  it('round-trips all state, repeated selections and special characters', () => {
    const filters = {
      ...emptyFilters,
      q: 'test phone',
      categories: ['laptops', 'phones'],
      brands: ['A & B', 'Other'],
      min: 0,
      max: 199.99,
      page: 3,
      sort: 'price-asc' as const,
    };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
  it('deduplicates selections and recovers invalid parameters', () => {
    expect(
      parseFilters(
        new URLSearchParams(
          'category=phones&category=phones&page=NaN&min=-2&max=oops&sort=invalid',
        ),
      ),
    ).toMatchObject({
      categories: ['phones'],
      page: 1,
      min: undefined,
      max: undefined,
      sort: 'default',
    });
    expect(parseFilters(new URLSearchParams('min=200&max=10'))).toMatchObject({
      min: undefined,
      max: undefined,
    });
    expect(parseFilters(new URLSearchParams('page=2.5')).page).toBe(1);
  });
  it('does not allow external or detail return destinations', () => {
    for (const url of ['//evil.test', 'https://evil.test', '/product/1', null])
      expect(safeListingUrl(url)).toBe('/');
    expect(safeListingUrl('/?page=2&q=phone')).toBe('/?q=phone&page=2');
  });
  it('rejects negative, malformed and reversed ranges and accepts empty/zero prices', () => {
    for (const [min, max] of [
      ['-1', '10'],
      ['abc', ''],
      ['200', '100'],
      ['Infinity', ''],
    ])
      expect(validatePriceRange(min, max)).toHaveProperty('error');
    expect(validatePriceRange('', '')).toEqual({ min: undefined, max: undefined });
    expect(validatePriceRange('0', '0')).toEqual({ min: 0, max: 0 });
  });
});
