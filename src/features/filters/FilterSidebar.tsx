import { useEffect, useState } from 'react';
import type { Category } from '../products/api/productsApi';
import type { Filters } from './filterState';
import { validatePriceRange } from './filterState';
import { Search } from 'lucide-react';

const optionClass =
  'flex min-h-[31px] cursor-pointer items-center gap-2.5 py-[3px] pr-[3px] text-base hover:text-accent max-md:min-h-[38px]';
const optionsClass = 'scrollbar-visible overflow-y-scroll pr-1.5 max-md:max-h-[220px]';

interface Props {
  filters: Filters;
  categories: Category[];
  brands: string[];
  update: (patch: Partial<Filters>) => void;
  clear: () => void;
  categoryError?: string;
  retryCategories?: () => void;
  loading?: boolean;
  search: string;
  onSearchChange: (search: string) => void;
}
export default function FilterSidebar({
  filters,
  categories,
  brands,
  update,
  clear,
  categoryError,
  retryCategories,
  loading,
  search,
  onSearchChange,
}: Props) {
  const [min, setMin] = useState(filters.min?.toString() ?? '');
  const [max, setMax] = useState(filters.max?.toString() ?? '');
  const [error, setError] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const visibleCategories = categories.filter((category) =>
    `${category.name} ${category.slug}`.toLocaleLowerCase().includes(query),
  );
  const visibleBrands = brands.filter((brand) => brand.toLocaleLowerCase().includes(query));
  useEffect(() => {
    setMin(filters.min?.toString() ?? '');
    setMax(filters.max?.toString() ?? '');
    setError('');
  }, [filters.min, filters.max]);
  function toggle(field: 'categories' | 'brands', value: string) {
    update({
      [field]: filters[field].includes(value)
        ? filters[field].filter((entry) => entry !== value)
        : [...filters[field], value],
    });
  }
  const hasFilters = !!(
    filters.categories.length ||
    filters.brands.length ||
    filters.min !== undefined ||
    filters.max !== undefined
  );
  function resetFilters() {
    setMin('');
    setMax('');
    setError('');
    onSearchChange('');
    clear();
  }
  return (
    <div className="pt-[19px] pr-4 pb-[9px] pl-[27px] max-md:p-5">
      <form
        className="flex h-11 min-w-0 items-center gap-[9px] rounded-[7px] border border-line bg-field px-[13px] text-muted"
        role="search"
        aria-label="Filter options"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search size={21} aria-hidden="true" />
        <input
          className="h-full min-w-0 w-full border-0 bg-transparent p-0 text-[16px] text-ink focus:outline-none"
          type="search"
          aria-label="Search filters"
          placeholder="Search..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          maxLength={200}
        />
        <button
          className="flex h-[30px] min-w-[65px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[11px] whitespace-nowrap text-accent hover:enabled:bg-hover"
          type="button"
          aria-label="Clear filters"
          title="Clear filters"
          disabled={!hasFilters && !search && !min && !max}
          onClick={resetFilters}
        >
          Clear filters
        </button>
      </form>
      <section className="mt-3.5 border-t border-line pt-3.5" aria-labelledby="category-heading">
        <h2 id="category-heading" className="mb-4 text-[17px] font-semibold">
          Categories
        </h2>
        <div
          className={`${optionsClass} min-h-[186px] max-h-[186px]`}
          tabIndex={0}
          aria-label="Available categories"
        >
          {visibleCategories.map((category) => (
            <label key={category.slug} className={optionClass}>
              <input
                type="checkbox"
                checked={filters.categories.includes(category.slug)}
                onChange={() => toggle('categories', category.slug)}
              />
              {category.name}
            </label>
          ))}
          {loading && <p className="mt-1 mb-2 text-[13px] text-muted">Loading categories…</p>}
          {!loading && !visibleCategories.length && !categoryError && (
            <p className="mt-1 mb-2 text-[13px] text-muted">
              {categories.length ? 'No matching categories.' : 'No categories available.'}
            </p>
          )}
        </div>
        {categoryError && (
          <div
            role="alert"
            className="mt-[9px] text-xs leading-normal text-danger [&>button]:px-2 [&>button]:py-[5px]"
          >
            <p>{categoryError}</p>
            <button onClick={retryCategories}>Retry categories</button>
          </div>
        )}
      </section>
      <section className="mt-3.5 border-t border-line pt-3.5" aria-labelledby="price-heading">
        <h2 id="price-heading" className="mb-3.5 text-[17px]">
          Price Range
        </h2>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const result = validatePriceRange(min, max);
            if ('error' in result) {
              setError(result.error ?? 'Invalid prices.');
              return;
            }
            setError('');
            update({ min: result.min, max: result.max });
          }}
        >
          <div className="grid grid-cols-2 gap-2.5 [&>input]:h-[41px] [&>input]:min-w-0 [&>input]:w-full [&>input]:px-[11px]">
            <input
              type="text"
              inputMode="decimal"
              aria-label="Minimum price"
              placeholder="Min"
              value={min}
              onChange={(event) => setMin(event.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'price-error' : undefined}
            />
            <input
              type="text"
              inputMode="decimal"
              aria-label="Maximum price"
              placeholder="Max"
              value={max}
              onChange={(event) => setMax(event.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'price-error' : undefined}
            />
          </div>
          {error && (
            <p
              id="price-error"
              role="alert"
              className="mt-[9px] text-xs leading-normal text-danger"
            >
              {error}
            </p>
          )}
          <button
            className="mt-[11px] h-[37px] w-full border-primary bg-primary text-white hover:brightness-95"
            type="submit"
          >
            Apply
          </button>
        </form>
      </section>
      <section className="mt-3.5 border-t border-line pt-3.5" aria-labelledby="brands-heading">
        <h2 id="brands-heading" className="mb-3.5 text-[17px]">
          Brands
        </h2>
        <div
          className={`${optionsClass} min-h-[150px] max-h-[150px]`}
          tabIndex={0}
          aria-label="Available brands"
        >
          {visibleBrands.map((brand) => (
            <label key={brand} className={optionClass}>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggle('brands', brand)}
              />
              {brand}
            </label>
          ))}
          {!visibleBrands.length && (
            <p className="mt-1 mb-2 text-[13px] text-muted">
              {loading
                ? 'Loading brands…'
                : brands.length
                  ? 'No matching brands.'
                  : 'No brands available.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
