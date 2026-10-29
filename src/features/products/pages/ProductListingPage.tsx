import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ListFilter } from 'lucide-react';
import { catalogQuery, categoriesQuery, categoryQuery } from '../api/productQueries';
import { filterProducts, paginate, sortProducts } from '../utils/filterProducts';
import { useUrlFilters } from '../../filters/useUrlFilters';
import { emptyFilters, serializeFilters, sortSchema } from '../../filters/filterState';
import FilterSidebar from '../../filters/FilterSidebar';
import ProductCard from '../components/ProductCard';
import Pagination from '../../../shared/components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../../../shared/components/Feedback';

const FilterDrawer = lazy(() => import('../../filters/FilterDrawer'));
export default function ProductListingPage() {
  const { filters, update } = useUrlFilters();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const catalog = useQuery(catalogQuery);
  const categories = useQuery(categoriesQuery);
  const singleCategory = filters.categories.length === 1 ? filters.categories[0] : '';
  const category = useQuery({ ...categoryQuery(singleCategory), enabled: !!singleCategory });
  const source = singleCategory ? (category.data ?? catalog.data) : catalog.data;
  const results = useMemo(
    () => paginate(sortProducts(filterProducts(source ?? [], filters), filters.sort), filters.page),
    [source, filters],
  );
  const brands = useMemo(
    () =>
      [
        ...new Set(
          (catalog.data ?? []).flatMap((product) => (product.brand ? [product.brand] : [])),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [catalog.data],
  );
  const canonical = serializeFilters({
    ...filters,
    page: source ? results.page : filters.page,
  }).toString();
  useEffect(() => {
    if (params.toString() !== canonical) setParams(canonical, { replace: true });
  }, [canonical, params, setParams]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const close = () => {
      if (media.matches) setDrawer(false);
    };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  useEffect(() => {
    document.title = 'Leegalybuy · Product catalogue';
  }, []);
  const clear = () => setParams(serializeFilters(emptyFilters));
  const sidebarProps = {
    search: filterSearch,
    onSearchChange: setFilterSearch,
    filters,
    categories: categories.data ?? [],
    brands,
    update,
    clear: () => update({ categories: [], brands: [], min: undefined, max: undefined }),
    loading: catalog.isPending || categories.isPending,
    categoryError: categories.error?.message,
    retryCategories: () => {
      void categories.refetch();
    },
  };
  return (
    <div className="listing-page">
      <aside className="listing-sidebar" aria-label="Product filters">
        <FilterSidebar {...sidebarProps} />
      </aside>
      <main id="main-content" className="listing-content">
        <div className="flex h-11 items-start justify-between gap-3 max-md:h-[49px]">
          <h1 className="hidden items-center gap-2 text-xl leading-[26px] font-semibold md:flex [&>svg]:text-[#858c98]">
            <ListFilter size={23} />
            <span>Filters</span>
          </h1>
          <button
            className="hidden items-center gap-[7px] px-3 py-[7px] text-sm max-md:flex"
            onClick={() => setDrawer(true)}
          >
            <ListFilter size={18} />
            Filters
            {filters.categories.length + filters.brands.length > 0 &&
              ` (${filters.categories.length + filters.brands.length})`}
          </button>
          <label>
            <span className="sr-only">Sort products</span>
            <select
              className="h-[26px] max-w-[155px] border-0 bg-transparent px-[3px] text-[11px] text-muted max-md:h-[34px] max-md:max-w-[165px] max-md:text-xs"
              aria-label="Sort products"
              value={filters.sort}
              onChange={(event) => update({ sort: sortSchema.parse(event.target.value) })}
            >
              <option value="default">Default order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </label>
        </div>
        <p className="sr-only" role="status">
          {!source
            ? 'Loading products'
            : `${results.total} products found. Page ${results.page} of ${results.pageCount}.`}
        </p>
        {catalog.isError && !source ? (
          <ErrorState
            message={catalog.error.message}
            retry={() => {
              void catalog.refetch();
            }}
          />
        ) : !source ? (
          <LoadingState />
        ) : (
          <>
            {category.isError && singleCategory && (
              <div
                className="pb-2.5 text-xs leading-normal text-muted [&>button]:ml-[5px] [&>button]:text-accent"
                role="alert"
              >
                Category service unavailable. Showing matches from the full catalogue.{' '}
                <button
                  onClick={() => {
                    void category.refetch();
                  }}
                >
                  Retry
                </button>
              </div>
            )}
            {results.total ? (
              <>
                <div className="product-grid">
                  {results.items.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 4} />
                  ))}
                </div>
                <Pagination
                  page={results.page}
                  pageCount={results.pageCount}
                  onChange={(page) => update({ page })}
                />
              </>
            ) : (
              <EmptyState clear={clear} />
            )}
          </>
        )}
      </main>
      {drawer && (
        <Suspense fallback={<span role="status">Opening filters…</span>}>
          <FilterDrawer {...sidebarProps} onClose={() => setDrawer(false)} />
        </Suspense>
      )}
    </div>
  );
}
