import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import ProductImage from '../../shared/components/ProductImage';

interface Props {
  images: string[];
  title: string;
  selected: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}
const controlButton = 'flex size-[34px] items-center justify-center p-0 max-md:size-8';
export default function ImageZoomDialog({ images, title, selected, onSelect, onClose }: Props) {
  const [zoom, setZoom] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = viewport.current;
    if (element) {
      element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
      element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
    }
  }, [zoom, selected]);
  function move(delta: number) {
    onSelect(Math.max(0, Math.min(images.length - 1, selected + delta)));
    setZoom(1);
  }
  useEffect(() => {
    function navigate(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        onSelect(
          Math.max(
            0,
            Math.min(images.length - 1, selected + (event.key === 'ArrowRight' ? 1 : -1)),
          ),
        );
        setZoom(1);
      }
    }
    document.addEventListener('keydown', navigate);
    return () => document.removeEventListener('keydown', navigate);
  }, [images.length, onSelect, selected]);
  return (
    <Modal title={`Image gallery: ${title}`} onClose={onClose}>
      <div
        ref={viewport}
        className="h-full w-full touch-pan-x touch-pan-y overflow-auto overscroll-contain bg-surface"
        onDragStart={(event) => event.preventDefault()}
      >
        <div
          className="flex min-h-full items-center justify-center px-7 pt-12 pb-[82px]"
          style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
        >
          <ProductImage
            src={images[selected]}
            alt={`${title}, image ${selected + 1}`}
            priority
            className="size-full min-h-0 min-w-0 object-contain"
          />
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 flex w-max max-w-[calc(100%-24px)] -translate-x-1/2 flex-wrap items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] shadow-[0_2px_12px_#14203314] max-md:gap-[5px]">
        <button
          className={controlButton}
          aria-label="Previous image"
          disabled={selected === 0}
          onClick={() => move(-1)}
        >
          <ChevronLeft size={20} />
        </button>
        <span aria-live="polite">
          {selected + 1} / {images.length}
        </span>
        <button
          className={controlButton}
          aria-label="Next image"
          disabled={selected === images.length - 1}
          onClick={() => move(1)}
        >
          <ChevronRight size={20} />
        </button>
        <span className="mx-[5px] h-[22px] border-l border-line max-md:mx-0.5" />
        <button
          className={controlButton}
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={() => setZoom(Math.max(1, zoom - 0.5))}
        >
          <ZoomOut size={20} />
        </button>
        <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
        <button
          className={controlButton}
          aria-label="Zoom in"
          disabled={zoom >= 3}
          onClick={() => setZoom(Math.min(3, zoom + 0.5))}
        >
          <ZoomIn size={20} />
        </button>
        <button className={controlButton} aria-label="Reset zoom" onClick={() => setZoom(1)}>
          <RotateCcw size={18} />
        </button>
      </div>
    </Modal>
  );
}
