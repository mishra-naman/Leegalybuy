import { queryOptions } from '@tanstack/react-query';
import {
  ApiError,
  getCategories,
  getProductById,
  getProducts,
  getProductsByCategory,
} from './productsApi';

export const catalogQuery = queryOptions({
  queryKey: ['products', 'catalog'],
  queryFn: ({ signal }) => getProducts(signal),
});
export const categoriesQuery = queryOptions({
  queryKey: ['categories'],
  queryFn: ({ signal }) => getCategories(signal),
  staleTime: 30 * 60 * 1000,
});
export const categoryQuery = (category: string) =>
  queryOptions({
    queryKey: ['products', 'category', category],
    queryFn: ({ signal }) => getProductsByCategory(category, signal),
  });
export const productQuery = (id: number) =>
  queryOptions({
    queryKey: ['products', 'detail', id],
    queryFn: ({ signal }) => getProductById(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 1,
  });
