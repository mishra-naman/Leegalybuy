import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { ToastContext } from './toastContext';
import styles from './Toast.module.css';

interface Toast {
  message: string;
  host: HTMLElement;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = useCallback((message: string) => {
    // A native modal lives above the document; feedback must live in that same layer.
    const host = document.querySelector<HTMLDialogElement>('dialog[open]') ?? document.body;
    setToast((current) =>
      current?.message === message && current.host === host ? current : { message, host },
    );
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      {toast &&
        createPortal(
          <div className={styles.toast} data-toast="true">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span role="status" aria-live="polite">
              {toast.message}
            </span>
            <button aria-label="Dismiss notification" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </div>,
          toast.host,
        )}
    </ToastContext.Provider>
  );
}
