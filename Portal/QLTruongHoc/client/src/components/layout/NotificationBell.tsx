import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../features/thongBaoSuKien/NotificationContext";

function formatThoiGian(createdAt: string) {
  const date = new Date(createdAt.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell() {
  const { items, soChuaDoc, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="topbar-action"
        aria-label={
          soChuaDoc > 0 ? `Thông báo, ${soChuaDoc} chưa đọc` : "Thông báo"
        }
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          className="topbar-action__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3c-3.31 0-6 2.69-6 6v3.586l-1.707 1.707A1 1 0 0 0 5 16h14a1 1 0 0 0 .707-1.707L18 12.586V9c0-3.31-2.69-6-6-6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 18.5a2.5 2.5 0 0 0 5 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        {soChuaDoc > 0 ? (
          <span className="topbar-action__badge">
            {soChuaDoc > 9 ? "9+" : soChuaDoc}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="notification-dropdown">
          <div className="notification-dropdown__header">
            <strong>Thông báo</strong>
            {soChuaDoc > 0 ? (
              <button type="button" className="text-button" onClick={markAllRead}>
                Đánh dấu tất cả đã đọc
              </button>
            ) : null}
          </div>

          <div className="notification-dropdown__list">
            {items.length === 0 ? (
              <p className="notification-dropdown__empty">Chưa có thông báo nào.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notification-dropdown__item${
                    item.daDoc ? "" : " notification-dropdown__item--unread"
                  }`}
                  onClick={() => {
                    markRead(item.id);
                    setOpen(false);
                    if (item.duongDan) navigate(item.duongDan);
                  }}
                >
                  <span className="notification-dropdown__item-title">{item.tieuDe}</span>
                  <span className="notification-dropdown__item-message">{item.noiDung}</span>
                  <span className="notification-dropdown__item-time">
                    {formatThoiGian(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
