import { AlertCircle, PackageSearch } from 'lucide-react';

const feedbackClass =
  'flex min-h-[300px] flex-col items-center justify-center px-5 py-8 text-center text-muted';

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className={feedbackClass} role="alert">
      <AlertCircle size={29} />
      <h2 className="mt-4 mb-[9px] text-xl font-semibold text-ink">Something went wrong</h2>
      <p className="mb-4 max-w-[380px] leading-normal">{message}</p>
      {retry && (
        <button className="px-[18px] py-2.5 text-accent" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({ clear }: { clear: () => void }) {
  return (
    <div className={feedbackClass}>
      <PackageSearch size={36} />
      <h2 className="mt-4 mb-[9px] text-xl font-semibold text-ink">No products found</h2>
      <p className="mb-4 max-w-[380px] leading-normal">
        Try another search or adjust your filters.
      </p>
      <button className="px-[18px] py-2.5 text-accent" onClick={clear}>
        Clear filters
      </button>
    </div>
  );
}
export function LoadingState({ detail = false }: { detail?: boolean }) {
  const bone = 'animate-pulse rounded-[3px] bg-skeleton';
  return (
    <div
      className={
        detail
          ? 'grid grid-cols-2 gap-3 p-10 max-md:grid-cols-1 max-md:p-5'
          : 'grid grid-cols-4 gap-3 max-desktop:grid-cols-3 max-md:grid-cols-2 max-[361px]:grid-cols-1'
      }
      role="status"
      aria-label="Loading products"
    >
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: detail ? 2 : 8 }, (_, index) => (
        <div
          key={index}
          className={`rounded-[7px] border border-line p-3.5 ${detail ? 'h-[500px]' : 'h-[230px]'}`}
        >
          <div className={`${bone} mb-[19px] ${detail ? 'h-[360px]' : 'h-[132px]'}`} />
          <span className={`${bone} mt-3 block h-[13px]`} />
          <span className={`${bone} mt-3 block h-[13px] w-3/4`} />
        </div>
      ))}
    </div>
  );
}
