type NotificationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  closeLabel?: string;
  tone?: "info" | "success" | "danger";
  onClose: () => void;
};

/**
 * Popup thông báo chuẩn dùng chung — đúng 1 hành động: đóng.
 * Dùng cho thông báo/kết quả cần người dùng xác nhận đã đọc, không phải
 * quyết định đồng ý/từ chối (dùng ConfirmDialog cho trường hợp đó).
 * Xem docs/DESIGN_SYSTEM_RULES.md mục Popup / Modal.
 */
export function NotificationDialog({
  open,
  title,
  message,
  closeLabel = "Đã hiểu",
  tone = "info",
  onClose,
}: NotificationDialogProps) {
  if (!open) return null;

  const icon =
    tone === "success" ? "✓" : tone === "danger" ? "!" : "i";

  return (
    <div className="dialog-overlay">
      <section
        className={[
          "dialog-card",
          tone === "danger" ? "dialog-card--danger" : "",
          tone === "success" ? "dialog-card--success" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notification-dialog-title"
      >
        <div className="dialog-card__icon">{icon}</div>

        <h2 id="notification-dialog-title">{title}</h2>
        <p>{message}</p>

        <div className="dialog-card__actions dialog-card__actions--single">
          <button
            type="button"
            className="primary-button"
            autoFocus
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
