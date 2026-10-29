import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseFilters, safeListingUrl, serializeFilters } from '../../features/filters/filterState';

export function useSearchController() {
  const location = useLocation();
  const navigate = useNavigate();
  const listingUrl =
    location.pathname === '/'
      ? `/${location.search}`
      : safeListingUrl(new URLSearchParams(location.search).get('returnTo'));
  const filters = parseFilters(new URLSearchParams(listingUrl.split('?')[1]));
  const [term, setTerm] = useState(filters.q);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    setTerm(filters.q);
    return () => clearTimeout(timer.current);
  }, [filters.q, location.pathname, location.search]);
  function commit(value: string) {
    clearTimeout(timer.current);
    const params = serializeFilters({ ...filters, q: value.trim(), page: 1 });
    navigate({ pathname: '/', search: params.toString() }, { replace: location.pathname === '/' });
  }
  return {
    term,
    change(value: string) {
      setTerm(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => commit(value), 250);
    },
    submit() {
      commit(term);
    },
  };
}
