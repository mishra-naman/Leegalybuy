export default function RatingStars({
  rating,
  large = false,
}: {
  rating: number;
  large?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <span
        className={`relative inline-block leading-none tracking-[-1.6px] text-rating ${large ? 'text-[21px]' : 'text-[14px]'}`}
        aria-hidden="true"
      >
        <span className="opacity-25">★★★★★</span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap"
          style={{ width: `${Math.max(0, Math.min(5, rating)) * 20}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className={`text-muted ${large ? 'text-sm' : 'text-[10px]'}`} aria-hidden="true">
        ({rating.toFixed(1)})
      </span>
    </span>
  );
}
