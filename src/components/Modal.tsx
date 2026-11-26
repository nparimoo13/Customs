import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="paper-card m-auto w-[min(92vw,26rem)] rounded-xl p-0 text-ink backdrop:backdrop-blur-[1px]"
    >
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4 border-b-2 border-dashed border-ink/30 pb-3">
          <h2 id={titleId} className="font-stencil text-2xl tracking-wider uppercase">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 grid h-10 w-10 place-items-center rounded-full text-2xl leading-none hover:bg-ink/10"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
