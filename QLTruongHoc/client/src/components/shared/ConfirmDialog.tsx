type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="confirm-dialog__overlay">
      <section className="confirm-dialog" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="text-button" onClick={onCancel} disabled={busy}>
            Hủy
          </button>
          <button
            type="button"
            className={danger ? "danger-button" : "primary-button"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
