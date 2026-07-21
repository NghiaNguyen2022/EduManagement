type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  rejectLabel?: string;
  danger?: boolean;
  busy?: boolean;
  /** Lỗi phát sinh khi xác nhận thất bại — hiện ngay trong modal, không bị overlay che. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Popup xác nhận chuẩn dùng chung — đúng 2 hành động: chấp nhận / từ chối.
 * Mặc định focus vào nút Từ chối (an toàn hơn khi nhấn Enter nhầm).
 * Xem docs/DESIGN_SYSTEM_RULES.md mục Popup / Modal.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  rejectLabel = "Từ chối",
  danger = false,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <section
        className={[
          "dialog-card",
          danger ? "dialog-card--danger" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="dialog-card__icon">
          {danger ? "!" : "?"}
        </div>

        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>

        {error ? (
          <p className="dialog-card__error">{error}</p>
        ) : null}

        <div className="dialog-card__actions">
          <button
            type="button"
            className="reject-button"
            autoFocus
            disabled={busy}
            onClick={onCancel}
          >
            {rejectLabel}
          </button>

          <button
            type="button"
            className={danger ? "danger-button" : "primary-button"}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
