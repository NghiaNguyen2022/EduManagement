import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ChatInbox } from "../components/shared/ChatInbox";
import { PageHeader } from "../components/shared/PageHeader";
import { listTinNhanThreadsApi } from "../features/tinNhan/tinNhanApi";
import type { TinNhanThreadItem } from "../features/tinNhan/tinNhanTypes";

/**
 * Nhắn tin — tách riêng khỏi trang chi tiết từng con để phụ huynh có 1 chỗ
 * duy nhất xem tổng hợp mọi hội thoại với nhà trường, không phải mở từng
 * con một để tìm lại tin nhắn cũ.
 */
export function ParentMessagesPage() {
  const [threads, setThreads] = useState<TinNhanThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadThreads() {
    try {
      const rows = await listTinNhanThreadsApi();
      setThreads(rows);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải hộp thư.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadThreads();
    const timer = window.setInterval(() => void loadThreads(), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="Nhắn tin"
        subtitle="Trao đổi trực tiếp với giáo viên — thay thế nhắn tin qua Zalo"
        action={
          <Link className="text-button" to="/portal/parent">
            ← Danh sách con
          </Link>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}

      <ChatInbox
        threads={threads}
        loading={loading}
        emptyMessage="Chưa có tin nhắn nào với con nào."
        searchPlaceholder="Tìm theo tên con..."
      />
    </div>
  );
}
