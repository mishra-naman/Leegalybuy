import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { productQuery } from '../api/productQueries';
import { categoryLabel } from '../api/productsApi';
import { safeListingUrl } from '../../filters/filterState';
import ProductGallery from '../../gallery/ProductGallery';
import AddToCart from '../../cart/AddToCart';
import RatingStars from '../../../shared/components/RatingStars';
import { ErrorState, LoadingState } from '../../../shared/components/Feedback';
import { formatCurrency } from '../../../shared/lib/formatCurrency';

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = /^\d+$/.test(id ?? '') ? Number(id) : NaN;
  const product = useQuery(productQuery(productId));
  const location = useLocation();
  const state: unknown = location.state;
  const stateReturn =
    state && typeof state === 'object' && 'returnTo' in state ? state.returnTo : undefined;
  const returnTo = safeListingUrl(
    stateReturn ?? new URLSearchParams(location.search).get('returnTo'),
  );
  useEffect(() => {
    document.title = product.data ? `${product.data.title} · Leegalybuy` : 'Product · Leegalybuy';
  }, [product.data]);
  const validId = Number.isSafeInteger(productId) && productId > 0;
  if (!validId || product.isError)
    return (
      <main id="main-content" className="min-h-0 overflow-y-auto p-8 [&>a]:text-accent">
        <Link to={returnTo}>← Back to products</Link>
        <ErrorState
          message={
            !validId
              ? 'This product link is invalid. Choose a product from the catalogue.'
              : (product.error?.message ?? 'Unable to load this product.')
          }
          retry={
            validId
              ? () => {
                  void product.refetch();
                }
              : undefined
          }
        />
      </main>
    );
  if (!product.data)
    return (
      <main id="main-content">
        <LoadingState detail />
      </main>
    );
  const data = product.data;
  return (
    <main id="main-content" className="detail-page">
      <div className="detail-gallery">
        <Link
          className="flex h-[42px] w-[110px] shrink-0 items-center justify-center gap-[7px] rounded-md border border-line text-muted shadow-card max-md:h-[38px] max-md:w-[95px] max-md:text-sm"
          to={returnTo}
        >
          <ArrowLeft size={18} />
          Back
        </Link>
        <ProductGallery key={data.id} product={data} />
      </div>
      <div className="product-info" role="region" aria-label="Product information" tabIndex={0}>
        <h1>{data.title}</h1>
        <div className="mb-6 flex flex-wrap items-center gap-5 [&>strong]:text-[29px] [&>strong]:tracking-[-.7px]">
          <strong>{formatCurrency(data.price)}</strong>
          <RatingStars rating={data.rating} large />
          <AddToCart product={data} />
        </div>
        <dl className="product-metadata">
          <dt>Brand:</dt>
          <dd>{data.brand || 'Not specified'}</dd>
          <dt>Category:</dt>
          <dd>{categoryLabel(data.category)}</dd>
        </dl>
        <section>
          <h2>Description</h2>
          <p>{data.description || 'No description is available for this product.'}</p>
        </section>
        <section>
          <h2>Reviews</h2>
          {data.reviews?.length ? (
            data.reviews.map((review, index) => (
              <article key={`${review.reviewerName}-${index}`}>
                <div className="mb-2 flex flex-wrap items-center gap-3.5">
                  <h3>{review.reviewerName}</h3>
                  <RatingStars rating={review.rating} large />
                </div>
                <p>{review.comment}</p>
              </article>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
