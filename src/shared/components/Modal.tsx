import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Shared.module.css';

export default function Modal({
  title,
  children,
  onClose,
  drawer = false,
  className = '',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
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
      <div className={styles.modalHeader}>
        <h2>{title}</h2>
        <button
          aria-label={`Close ${title.toLowerCase()}`}
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
