import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import styles from './Shared.module.css';

export default function ProductImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!src || failedUrl === src)
    return (
      <span
        className={`${styles.imageFallback} ${className ?? ''}`}
        role="img"
        aria-label={`${alt} — image unavailable`}
      >
        <ImageOff size={32} />
        <span>Image unavailable</span>
      </span>
    );
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      width={400}
      height={400}
      onError={() => setFailedUrl(src)}
    />
  );
}
