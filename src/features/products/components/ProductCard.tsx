import { Link, useLocation } from 'react-router-dom';
import type { Product } from '../api/productsApi';
import ProductImage from '../../../shared/components/ProductImage';
import RatingStars from '../../../shared/components/RatingStars';
import AddToCart from '../../cart/AddToCart';
import { formatCurrency } from '../../../shared/lib/formatCurrency';

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
    <article className="relative h-[230px] min-w-0 rounded-[7px] border border-line bg-surface shadow-card transition-[border-color,box-shadow] hover:border-[#b6c5d9] hover:shadow-[0_3px_9px_#17233312] max-[361px]:h-[270px]">
      <Link
        to={`/product/${product.id}?${new URLSearchParams({ returnTo })}`}
        state={{ returnTo }}
        aria-label={`View ${product.title}`}
        className="block h-full rounded-[inherit] px-3"
      >
        <ProductImage
          src={product.thumbnail || product.images?.[0]}
          alt={product.title}
          priority={priority}
          className="h-[148px] w-full border-b border-line object-contain pt-[9px] pb-[7px] max-[361px]:h-[185px]"
        />
        <h2
          className="mt-3 mb-[13px] truncate text-[16px] leading-[19px] font-medium"
          title={product.title}
        >
          {product.title}
        </h2>
        <div className="flex items-center justify-between gap-1 [&>strong]:text-[17px] [&>strong]:font-semibold [&>strong]:tracking-[-.4px] max-md:[&>strong]:text-base max-[361px]:justify-start max-[361px]:gap-[15px]">
          <strong>{formatCurrency(product.price)}</strong>
          <RatingStars rating={product.rating} />
        </div>
      </Link>
      <AddToCart product={product} compact />
    </article>
  );
}
