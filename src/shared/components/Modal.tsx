import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Shared.module.css';

export default function Modal({
  title,
  children,
  onClose,
  drawer = false,
  className = '',
  minimal = false,
  returnFocusTo,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  className?: string;
  minimal?: boolean;
  returnFocusTo?: HTMLElement | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef(returnFocusTo ?? document.activeElement);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = opener.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => {
        if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
          previousFocus.focus();
      }, 0);
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`${styles.modal} ${drawer ? styles.drawer : ''} ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className={minimal ? styles.minimalHeader : styles.modalHeader}>
        <h2 className={minimal ? 'sr-only' : undefined}>{title}</h2>
        <button
          aria-label={minimal ? 'Close image gallery' : `Close ${title.toLowerCase()}`}
          className={styles.iconButton}
          onClick={onClose}
          autoFocus
        >
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
