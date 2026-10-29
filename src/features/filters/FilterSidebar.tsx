import { useEffect, useState } from 'react';
import type { Category } from '../products/api/productsApi';
import type { Filters } from './filterState';
import { validatePriceRange } from './filterState';
import { Search } from 'lucide-react';
import sharedStyles from '../../shared/components/Shared.module.css';
import styles from './Filters.module.css';

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
    <div className={styles.sidebar}>
      <form
        className={`${sharedStyles.search} ${sharedStyles.sidebarSearch}`}
        role="search"
        aria-label="Filter options"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search size={21} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search filters"
          placeholder="Search..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          maxLength={200}
        />
        <button
          className={styles.clearButton}
          type="button"
          aria-label="Clear filters"
          title="Clear filters"
          disabled={!hasFilters && !search && !min && !max}
          onClick={resetFilters}
        >
          Clear filters
        </button>
      </form>
      <section className={styles.section} aria-labelledby="category-heading">
        <h2 id="category-heading" className={styles.categoryHeading}>
          Categories
        </h2>
        <div className={styles.options} tabIndex={0} aria-label="Available categories">
          {visibleCategories.map((category) => (
            <label key={category.slug}>
              <input
                type="checkbox"
                checked={filters.categories.includes(category.slug)}
                onChange={() => toggle('categories', category.slug)}
              />
              {category.name}
            </label>
          ))}
          {loading && <p className={styles.subdued}>Loading categories…</p>}
          {!loading && !visibleCategories.length && !categoryError && (
            <p className={styles.subdued}>
              {categories.length ? 'No matching categories.' : 'No categories available.'}
            </p>
          )}
        </div>
        {categoryError && (
          <div role="alert" className={styles.inlineError}>
            <p>{categoryError}</p>
            <button onClick={retryCategories}>Retry categories</button>
          </div>
        )}
      </section>
      <section className={styles.section} aria-labelledby="price-heading">
        <h2 id="price-heading">Price Range</h2>
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
          <div className={styles.priceInputs}>
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
            <p id="price-error" role="alert" className={styles.validation}>
              {error}
            </p>
          )}
          <button className={styles.apply} type="submit">
            Apply
          </button>
        </form>
      </section>
      <section className={styles.section} aria-labelledby="brands-heading">
        <h2 id="brands-heading">Brands</h2>
        <div
          className={`${styles.options} ${styles.brands}`}
          tabIndex={0}
          aria-label="Available brands"
        >
          {visibleBrands.map((brand) => (
            <label key={brand}>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggle('brands', brand)}
              />
              {brand}
            </label>
          ))}
          {!visibleBrands.length && (
            <p className={styles.subdued}>
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
