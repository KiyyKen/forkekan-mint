import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  presetName: string | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Konfirmasi aksi destruktif (docs/09: Dialog — Confirmation/Delete). */
export function ConfirmDeleteDialog({
  open,
  presetName,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title="Hapus riwayat?" role="alertdialog">
      <p className="text-pretty text-sm text-muted-foreground">
        Riwayat optimasi{presetName ? ` "${presetName}"` : ''} beserta file hasilnya akan dihapus
        permanen. Tindakan ini tidak dapat dibatalkan.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
          Batal
        </Button>
        <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Menghapus...' : 'Hapus'}
        </Button>
      </div>
    </Dialog>
  );
}
