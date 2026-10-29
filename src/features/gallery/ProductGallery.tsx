import { lazy, Suspense, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import type { Product } from '../products/api/productsApi';
import ProductImage from '../../shared/components/ProductImage';
import Pagination from '../../shared/components/Pagination';

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <button
        className="group relative flex min-h-0 w-full flex-1 cursor-zoom-in items-center justify-center overflow-hidden border-0 bg-transparent p-0"
        onClick={() => setZoomOpen(true)}
        disabled={!images.length}
        aria-label={`Zoom image of ${product.title}`}
      >
        <ProductImage
          src={images[selected]}
          alt={product.title}
          priority
          className="h-full min-h-0 w-full object-contain px-3 max-md:px-5 max-md:py-3"
        />
        <span className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-[5px] text-[11px] whitespace-nowrap text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-md:bottom-0 max-md:opacity-100">
          <ZoomIn size={16} /> Click to zoom
        </span>
      </button>
      <div className="shrink-0 pt-2.5">
        {images.length > 1 && (
          <div
            className="flex justify-center gap-1.5 overflow-x-auto p-1"
            aria-label="Product images"
          >
            {images.map((src, index) => (
              <button
                className="size-12 shrink-0 p-[3px] aria-pressed:border-primary aria-pressed:bg-hover"
                key={src}
                onClick={() => setSelected(index)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={selected === index}
              >
                <ProductImage
                  src={src}
                  alt={`${product.title}, view ${index + 1}`}
                  className="size-full object-contain"
                />
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
