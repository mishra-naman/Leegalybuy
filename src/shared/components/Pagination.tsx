import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Shared.module.css';

export default function Pagination({ page, pageCount, onChange, label = 'Product pages' }: { page: number; pageCount: number; onChange: (page: number) => void; label?: string }) {
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => start + index);
  return <nav className={styles.pagination} aria-label={label}>
    <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page"><ArrowLeft size={16} /><span>Previous</span></button>
    {pages.map((number) => <button key={number} aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number}</button>)}
    <button onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page"><span>Next</span><ArrowRight size={16} /></button>
  </nav>;
}
