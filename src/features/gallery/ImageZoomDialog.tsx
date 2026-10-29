import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import ProductImage from '../../shared/components/ProductImage';
import styles from './Gallery.module.css';

interface Props {
  images: string[];
  title: string;
  selected: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}
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
    <Modal title={`Image gallery: ${title}`} onClose={onClose} className={styles.zoomModal} minimal>
      <div
        ref={viewport}
        className={styles.zoomViewport}
        onDragStart={(event) => event.preventDefault()}
      >
        <div
          className={styles.zoomCanvas}
          style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
        >
          <ProductImage src={images[selected]} alt={`${title}, image ${selected + 1}`} priority />
        </div>
      </div>
      <div className={styles.zoomControls}>
        <button aria-label="Previous image" disabled={selected === 0} onClick={() => move(-1)}>
          <ChevronLeft size={20} />
        </button>
        <span aria-live="polite">
          {selected + 1} / {images.length}
        </span>
        <button
          aria-label="Next image"
          disabled={selected === images.length - 1}
          onClick={() => move(1)}
        >
          <ChevronRight size={20} />
        </button>
        <span className={styles.controlDivider} />
        <button
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={() => setZoom(Math.max(1, zoom - 0.5))}
        >
          <ZoomOut size={20} />
        </button>
        <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
        <button
          aria-label="Zoom in"
          disabled={zoom >= 3}
          onClick={() => setZoom(Math.min(3, zoom + 0.5))}
        >
          <ZoomIn size={20} />
        </button>
        <button aria-label="Reset zoom" onClick={() => setZoom(1)}>
          <RotateCcw size={18} />
        </button>
      </div>
    </Modal>
  );
}
