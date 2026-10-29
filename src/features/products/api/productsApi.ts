import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(0).max(5),
  comment: z.string(),
  reviewerName: z.string(),
  date: z.string().optional(),
});
export const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  category: z.string(),
  brand: z.string().nullish(),
  description: z.string().nullish(),
  thumbnail: z.url().nullish(),
  images: z.array(z.url()).nullish(),
  reviews: z.array(reviewSchema).nullish(),
});
export type Product = z.infer<typeof productSchema>;
const collectionSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int().nonnegative(),
});
const categorySchema = z.union([
  z.string().transform((slug) => ({ slug, name: categoryLabel(slug) })),
  z.object({ slug: z.string(), name: z.string() }),
]);
export type Category = z.infer<typeof categorySchema>;

export function categoryLabel(slug: string) {
  return slug.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`https://dummyjson.com${path}`, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
        : AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('Unable to reach the product service. Check your connection and try again.');
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? 'This product could not be found.'
        : 'The product service is temporarily unavailable.',
      response.status,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('The product service returned an unreadable response. Please try again.');
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    throw new ApiError('The product service returned unexpected data. Please try again.');
  return parsed.data;
}

async function getCollection(path: string, signal?: AbortSignal): Promise<Product[]> {
  const first = await request(`${path}?limit=0`, collectionSchema, signal);
  const products = [...first.products];
  // Some API deployments cap limit=0. Continue until the advertised total is covered.
  while (products.length < first.total) {
    const next = await request(
      `${path}?limit=100&skip=${products.length}`,
      collectionSchema,
      signal,
    );
    if (!next.products.length)
      throw new ApiError('The product service returned an incomplete catalogue. Please retry.');
    products.push(...next.products);
  }
  return [...new Map(products.map((product) => [product.id, product])).values()];
}

export const getProducts = (signal?: AbortSignal) => getCollection('/products', signal);
export const getProductsByCategory = (category: string, signal?: AbortSignal) =>
  getCollection(`/products/category/${encodeURIComponent(category)}`, signal);
export const getCategories = (signal?: AbortSignal) =>
  request('/products/categories', z.array(categorySchema), signal);
export const getProductById = (id: number, signal?: AbortSignal) =>
  request(`/products/${id}`, productSchema, signal);
