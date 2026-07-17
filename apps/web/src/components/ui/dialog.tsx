import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "alertdialog" untuk aksi destruktif (konfirmasi hapus). */
  role?: 'dialog' | 'alertdialog';
  className?: string;
}

/**
 * Dialog berbasis elemen <dialog> native — focus trap, Esc, dan
 * inert background ditangani platform (docs/09: Dialog, radius xl).
 */
export function Dialog({ open, onClose, title, children, role = 'dialog', className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className={cn(
        'w-full max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/50',
        'm-auto',
        className,
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-balance text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Tutup dialog"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
