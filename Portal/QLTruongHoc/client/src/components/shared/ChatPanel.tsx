import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../features/auth/AuthContext";
import { listTinNhanApi, sendTinNhanApi } from "../../features/tinNhan/tinNhanApi";
import type { TinNhanItem } from "../../features/tinNhan/tinNhanTypes";

type ChatPanelProps = {
  hocSinhId: number;
  lopHocId?: number | null;
  pollIntervalMs?: number;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

/**
 * Khung chat 2 chiều phụ huynh-giáo viên — dùng chung cho cả 2 phía (Portal
 * phụ huynh và trang chi tiết học sinh phía nhân viên). Chỉ poll khi đang
 * mount (thường là khi tab/khung này đang mở), không có hạ tầng realtime —
 * xem docs/analysis/TRAO_DOI_PHU_HUYNH_QUYEN.md và
 * NotificationContext.tsx cho mẫu polling đã có trong dự án.
 */
export function ChatPanel({ hocSinhId, lopHocId, pollIntervalMs = 8000 }: ChatPanelProps) {
  const { auth } = useAuth();
  const [messages, setMessages] = useState<TinNhanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    try {
      const rows = await listTinNhanApi(hocSinhId);
      setMessages(rows);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải tin nhắn.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void load();

    const interval = window.setInterval(() => void load(), pollIntervalMs);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hocSinhId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const noiDung = text.trim();
    if (!noiDung) return;

    setSending(true);
    setError("");

    try {
      await sendTinNhanApi({ hocSinhId, noiDung, lopHocId });
      setText("");
      await load();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__messages" ref={listRef}>
        {loading ? <div className="empty-cell">Đang tải tin nhắn...</div> : null}

        {!loading && messages.length === 0 ? (
          <div className="empty-cell">Chưa có tin nhắn nào — bắt đầu trao đổi ngay.</div>
        ) : null}

        {messages.map((item) => (
          <div
            key={item.id}
            className={
              item.nguoiGuiId === auth?.user.id
                ? "chat-panel__bubble chat-panel__bubble--mine"
                : "chat-panel__bubble"
            }
          >
            <span>{item.noiDung}</span>
            <small>
              {item.nguoiGuiLaPhuHuynh ? "Phụ huynh" : "Giáo viên/Nhà trường"} ·{" "}
              {formatDateTime(item.createdAt)}
            </small>
          </div>
        ))}
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <form className="chat-panel__composer" onSubmit={handleSend}>
        <input
          className="form-control"
          type="text"
          value={text}
          placeholder="Nhập tin nhắn..."
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className="primary-button" disabled={sending || !text.trim()}>
          {sending ? "Đang gửi..." : "Gửi"}
        </button>
      </form>
    </div>
  );
}
