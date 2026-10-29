import styles from './Shared.module.css';

export default function RatingStars({ rating }: { rating: number }) {
  return (
    <span className={styles.rating} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className={styles.stars} aria-hidden="true">
        <span>★★★★★</span>
        <span
          className={styles.filledStars}
          style={{ width: `${Math.max(0, Math.min(5, rating)) * 20}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className={styles.ratingNumber} aria-hidden="true">
        ({rating.toFixed(1)})
      </span>
    </span>
  );
}
