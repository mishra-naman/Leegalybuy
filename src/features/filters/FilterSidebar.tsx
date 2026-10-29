import { useEffect, useState } from 'react';
import type { Category } from '../products/api/productsApi';
import type { Filters } from './filterState';
import { validatePriceRange } from './filterState';
import SearchField from '../../shared/components/SearchField';
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
}
export default function FilterSidebar({ filters, categories, brands, update, clear, categoryError, retryCategories, loading }: Props) {
  const [min, setMin] = useState(filters.min?.toString() ?? '');
  const [max, setMax] = useState(filters.max?.toString() ?? '');
  const [error, setError] = useState('');
  useEffect(() => { setMin(filters.min?.toString() ?? ''); setMax(filters.max?.toString() ?? ''); setError(''); }, [filters.min, filters.max]);
  function toggle(field: 'categories' | 'brands', value: string) {
    update({ [field]: filters[field].includes(value) ? filters[field].filter((entry) => entry !== value) : [...filters[field], value] });
  }
  const hasFilters = !!(filters.q || filters.categories.length || filters.brands.length || filters.min !== undefined || filters.max !== undefined);
  return <div className={styles.sidebar}>
    <SearchField sidebar />
    <section className={styles.section} aria-labelledby="category-heading">
      <h2 id="category-heading" className={styles.categoryHeading}>Categories</h2>
      <div className={styles.options} tabIndex={0} aria-label="Available categories">
        {categories.map((category) => <label key={category.slug}><input type="checkbox" checked={filters.categories.includes(category.slug)} onChange={() => toggle('categories', category.slug)} />{category.name}</label>)}
        {loading && <p className={styles.subdued}>Loading categories…</p>}
        {!loading && !categories.length && !categoryError && <p className={styles.subdued}>No categories available.</p>}
      </div>
      {categoryError && <div role="alert" className={styles.inlineError}><p>{categoryError}</p><button onClick={retryCategories}>Retry categories</button></div>}
    </section>
    <section className={styles.section} aria-labelledby="price-heading">
      <h2 id="price-heading">Price Range</h2>
      <form noValidate onSubmit={(event) => {
        event.preventDefault();
        const result = validatePriceRange(min, max);
        if ('error' in result) { setError(result.error ?? 'Invalid prices.'); return; }
        setError(''); update({ min: result.min, max: result.max });
      }}>
        <div className={styles.priceInputs}>
          <input type="text" inputMode="decimal" aria-label="Minimum price" placeholder="Min" value={min} onChange={(event) => setMin(event.target.value)} aria-invalid={!!error} aria-describedby={error ? 'price-error' : undefined} />
          <input type="text" inputMode="decimal" aria-label="Maximum price" placeholder="Max" value={max} onChange={(event) => setMax(event.target.value)} aria-invalid={!!error} aria-describedby={error ? 'price-error' : undefined} />
        </div>
        {error && <p id="price-error" role="alert" className={styles.validation}>{error}</p>}
        <button className={styles.apply} type="submit">Apply</button>
      </form>
    </section>
    <section className={styles.section} aria-labelledby="brands-heading">
      <h2 id="brands-heading">Brands</h2>
      <div className={`${styles.options} ${styles.brands}`} tabIndex={0} aria-label="Available brands">
        {brands.map((brand) => <label key={brand}><input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => toggle('brands', brand)} />{brand}</label>)}
        {!brands.length && <p className={styles.subdued}>{loading ? 'Loading brands…' : 'No brands available.'}</p>}
      </div>
    </section>
    {hasFilters && <button className={styles.clear} onClick={() => { setMin(''); setMax(''); setError(''); clear(); }}>Clear filters</button>}
  </div>;
}
