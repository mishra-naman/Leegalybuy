import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { ToastContext } from './toastContext';

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
          <div
            className="fixed right-5 bottom-5 z-[100] flex max-w-[min(390px,calc(100vw-40px))] items-center gap-2.5 rounded-[7px] border border-line bg-surface px-3.5 py-[13px] text-[13px] leading-[1.4] text-ink shadow-[0_4px_22px_#14203324]"
            data-toast="true"
          >
            <CheckCircle2 size={18} aria-hidden="true" className="text-accent" />
            <span role="status" aria-live="polite" className="break-words">
              {toast.message}
            </span>
            <button
              className="flex size-[26px] shrink-0 items-center justify-center border-0 p-0 text-muted"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={16} />
            </button>
          </div>,
          toast.host,
        )}
    </ToastContext.Provider>
  );
}
