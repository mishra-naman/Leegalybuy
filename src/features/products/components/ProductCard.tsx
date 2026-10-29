import { Link, useLocation } from 'react-router-dom';
import type { Product } from '../api/productsApi';
import ProductImage from '../../../shared/components/ProductImage';
import RatingStars from '../../../shared/components/RatingStars';
import AddToCart from '../../cart/AddToCart';
import { formatCurrency } from '../../../shared/lib/formatCurrency';
import styles from './Products.module.css';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const location = useLocation();
  const returnTo = `/${location.search}`;
  return (
    <article className={styles.card}>
      <Link
        to={`/product/${product.id}?${new URLSearchParams({ returnTo })}`}
        state={{ returnTo }}
        aria-label={`View ${product.title}`}
        className={styles.productLink}
      >
        <ProductImage
          src={product.thumbnail || product.images?.[0]}
          alt={product.title}
          priority={priority}
          className={styles.cardImage}
        />
        <h2 className={styles.cardTitle} title={product.title}>
          {product.title}
        </h2>
        <div className={styles.cardMeta}>
          <strong>{formatCurrency(product.price)}</strong>
          <RatingStars rating={product.rating} />
        </div>
      </Link>
      <AddToCart product={product} compact />
    </article>
  );
}
