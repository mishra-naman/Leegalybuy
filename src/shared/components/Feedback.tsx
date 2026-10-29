import { AlertCircle, PackageSearch } from 'lucide-react';
import styles from './Shared.module.css';

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className={styles.feedback} role="alert"><AlertCircle size={29} /><h2>Something went wrong</h2><p>{message}</p>{retry && <button onClick={retry}>Try again</button>}</div>;
}
export function EmptyState({ clear }: { clear: () => void }) {
  return <div className={styles.feedback}><PackageSearch size={36} /><h2>No products found</h2><p>Try another search or adjust your filters.</p><button onClick={clear}>Clear filters</button></div>;
}
export function LoadingState({ detail = false }: { detail?: boolean }) {
  return <div className={`${styles.skeletons} ${detail ? styles.detailSkeleton : ''}`} role="status" aria-label="Loading products"><span className="sr-only">Loading products…</span>{Array.from({ length: detail ? 2 : 8 }, (_, index) => <div key={index} className={styles.skeleton}><div /><span /><span /></div>)}</div>;
}
