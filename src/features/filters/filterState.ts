import { z } from 'zod';

export const sortSchema = z.enum(['default', 'price-asc', 'price-desc', 'rating-desc', 'name-asc']);
const priceParam = z.coerce.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER).optional().catch(undefined);
const filterSchema = z.object({
  q: z.string().trim().max(200).catch(''),
  categories: z.array(z.string().trim().min(1)).catch([]),
  brands: z.array(z.string().trim().min(1)).catch([]),
  min: priceParam,
  max: priceParam,
  sort: sortSchema.catch('default'),
  page: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER).catch(1),
});
export type Filters = z.infer<typeof filterSchema>;
export const emptyFilters: Filters = { q: '', categories: [], brands: [], min: undefined, max: undefined, sort: 'default', page: 1 };

export function parseFilters(params: URLSearchParams): Filters {
  const filters = filterSchema.parse({
    q: params.get('q') ?? '',
    categories: params.getAll('category').filter(Boolean),
    brands: params.getAll('brand').filter(Boolean),
    min: params.has('min') ? params.get('min') : undefined,
    max: params.has('max') ? params.get('max') : undefined,
    sort: params.get('sort') ?? 'default',
    page: params.get('page') ?? 1,
  });
  filters.categories = [...new Set(filters.categories)].sort();
  filters.brands = [...new Set(filters.brands)].sort();
  if (filters.min !== undefined && filters.max !== undefined && filters.min > filters.max) {
    filters.min = undefined;
    filters.max = undefined;
  }
  return filters;
}

export function serializeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  [...new Set(filters.categories)].sort().forEach((category) => params.append('category', category));
  [...new Set(filters.brands)].sort().forEach((brand) => params.append('brand', brand));
  if (filters.min !== undefined) params.set('min', String(filters.min));
  if (filters.max !== undefined) params.set('max', String(filters.max));
  if (filters.sort !== 'default') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function safeListingUrl(value: unknown): string {
  if (typeof value !== 'string' || !(value === '/' || value.startsWith('/?'))) return '/';
  const params = serializeFilters(parseFilters(new URLSearchParams(value.split('?')[1]))).toString();
  return params ? `/?${params}` : '/';
}

export function validatePriceRange(minDraft: string, maxDraft: string) {
  const min = minDraft.trim() ? Number(minDraft) : undefined;
  const max = maxDraft.trim() ? Number(maxDraft) : undefined;
  if ([min, max].some((price) => price !== undefined && (!Number.isFinite(price) || price < 0 || price > Number.MAX_SAFE_INTEGER))) {
    return { error: 'Enter valid prices of zero or more.' } as const;
  }
  if (min !== undefined && max !== undefined && min > max) return { error: 'Minimum price must not exceed maximum price.' } as const;
  return { min, max } as const;
}
