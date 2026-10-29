import { lazy, Suspense, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import type { Product } from '../products/api/productsApi';
import ProductImage from '../../shared/components/ProductImage';
import Pagination from '../../shared/components/Pagination';
import styles from './Gallery.module.css';

const ImageZoomDialog = lazy(() => import('./ImageZoomDialog'));
export default function ProductGallery({ product }: { product: Product }) {
  const images = [
    ...new Set(
      product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [],
    ),
  ];
  const [selected, setSelected] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  return (
    <div className={styles.gallery}>
      <button
        className={styles.mainImage}
        onClick={() => setZoomOpen(true)}
        disabled={!images.length}
        aria-label={`Zoom image of ${product.title}`}
      >
        <ProductImage
          src={images[selected]}
          alt={product.title}
          priority
          className={styles.image}
        />
        <span className={styles.zoomHint}>
          <ZoomIn size={16} /> Click to zoom
        </span>
      </button>
      <div className={styles.navigation}>
        {images.length > 1 && (
          <div className={styles.thumbnails} aria-label="Product images">
            {images.map((src, index) => (
              <button
                key={src}
                onClick={() => setSelected(index)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={selected === index}
              >
                <ProductImage src={src} alt={`${product.title}, view ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
        {!!images.length && (
          <Pagination
            page={selected + 1}
            pageCount={images.length}
            onChange={(page) => setSelected(page - 1)}
            label="Gallery images"
          />
        )}
      </div>
      {zoomOpen && (
        <Suspense fallback={<span role="status">Opening image…</span>}>
          <ImageZoomDialog
            images={images}
            title={product.title}
            selected={selected}
            onSelect={setSelected}
            onClose={() => setZoomOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
