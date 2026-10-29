import { useContext } from 'react';
import { SearchContext } from './searchContext';
import { Search } from 'lucide-react';
import styles from './Shared.module.css';

export default function SearchField({ sidebar = false }: { sidebar?: boolean }) {
  const { term, change, submit } = useContext(SearchContext);
  return <form className={`${styles.search} ${sidebar ? styles.sidebarSearch : ''}`} role="search" onSubmit={(event) => { event.preventDefault(); submit(); }}>
    <Search size={21} aria-hidden="true" />
    <input aria-label={sidebar ? 'Search products in sidebar' : 'Search products'} placeholder={sidebar ? 'Search...' : 'Search products...'} value={term} onChange={(event) => change(event.target.value)} type="search" maxLength={200} />
  </form>;
}
