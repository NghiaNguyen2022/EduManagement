import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../features/thongBaoSuKien/NotificationContext";
import type { ThongBaoSuKienItem } from "../../features/thongBaoSuKien/thongBaoSuKienTypes";

const AUTO_DISMISS_MS = 7000;

function toneOf(loaiSuKien: string): "info" | "success" | "danger" {
  if (loaiSuKien.endsWith(".da_duyet")) return "success";
  if (loaiSuKien.endsWith(".tu_choi")) return "danger";
  return "info";
}

function Toast({
  item,
  onDismiss,
  onOpen,
}: {
  item: ThongBaoSuKienItem;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  const tone = toneOf(item.loaiSuKien);
  const icon = tone === "success" ? "✓" : tone === "danger" ? "!" : "i";

  return (
    <div className={`toast toast--${tone}`} role="status">
      <div className="toast__icon">{icon}</div>

      <button type="button" className="toast__body" onClick={onOpen}>
        <strong className="toast__title">{item.tieuDe}</strong>
        <span className="toast__message">{item.noiDung}</span>
      </button>

      <button
        type="button"
        className="toast__close"
        aria-label="Đóng thông báo"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}

/** Hàng đợi toast góc màn hình — mount 1 lần ở gốc `AppShell`. */
export function ToastStack() {
  const { toasts, dismissToast, markRead } = useNotifications();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((item) => (
        <Toast
          key={item.id}
          item={item}
          onDismiss={() => dismissToast(item.id)}
          onOpen={() => {
            markRead(item.id);
            dismissToast(item.id);
            if (item.duongDan) navigate(item.duongDan);
          }}
        />
      ))}
    </div>
  );
}
