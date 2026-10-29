import { ArrowLeft, ArrowRight } from 'lucide-react';

const buttonClass = 'flex h-[35px] items-center justify-center gap-[5px] text-sm shadow-card';

export default function Pagination({
  page,
  pageCount,
  onChange,
  label = 'Product pages',
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
}) {
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => start + index);
  return (
    <nav
      className="flex items-center justify-center gap-1 pt-[21px] max-md:gap-[3px]"
      aria-label={label}
    >
      <button
        className={`${buttonClass} px-3 hover:enabled:bg-hover max-md:px-[9px]`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ArrowLeft size={16} />
        <span className="max-[361px]:hidden">Previous</span>
      </button>
      {pages.map((number) => (
        <button
          className={`${buttonClass} min-w-8 px-2.5 max-md:min-w-[30px] max-md:px-2 ${number === page ? 'border-primary bg-primary text-white' : 'hover:bg-hover'}`}
          key={number}
          aria-label={`Page ${number}`}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}
      <button
        className={`${buttonClass} px-3 hover:enabled:bg-hover max-md:px-[9px]`}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <span className="max-[361px]:hidden">Next</span>
        <ArrowRight size={16} />
      </button>
    </nav>
  );
}
