import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseFilters, serializeFilters, type Filters } from './filterState';

export function useUrlFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  function update(patch: Partial<Filters>, replace = false) {
    setParams((current) => serializeFilters({ ...parseFilters(current), page: 1, ...patch }), {
      replace,
      flushSync: true,
    });
  }
  return { filters, update };
}
