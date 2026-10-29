import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  title,
  children,
  onClose,
  drawer = false,
  returnFocusTo,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
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
      className={`border border-line bg-surface p-0 text-ink shadow-[0_15px_60px_#0003] backdrop:bg-[#14203388] ${drawer ? 'm-0 ml-auto h-dvh max-h-dvh w-[min(425px,100%)] rounded-none border-r-0' : 'm-auto h-[min(86dvh,800px)] max-h-[calc(100dvh-24px)] w-[min(1120px,calc(100%-24px))] overflow-hidden rounded-[9px]'}`}
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
      <div
        className={
          drawer
            ? 'flex items-center justify-between gap-4 border-b border-line px-[22px] py-[18px]'
            : 'absolute top-3 right-3 z-2'
        }
      >
        <h2 className={drawer ? 'text-xl font-semibold' : 'sr-only'}>{title}</h2>
        <button
          aria-label={drawer ? `Close ${title.toLowerCase()}` : 'Close image gallery'}
          className={`inline-flex shrink-0 items-center justify-center p-0 ${drawer ? 'size-[34px]' : 'size-10 bg-surface shadow-card'}`}
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
