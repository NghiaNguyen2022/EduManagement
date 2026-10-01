import { useEffect, useState } from "react";

import { ChatInbox } from "../components/shared/ChatInbox";
import { PageHeader } from "../components/shared/PageHeader";
import { listTinNhanThreadsApi } from "../features/tinNhan/tinNhanApi";
import type { TinNhanThreadItem } from "../features/tinNhan/tinNhanTypes";

/**
 * Hộp thư nhắn tin tổng hợp cho nhân viên — mỗi học sinh 1 dòng (tin mới
 * nhất), để tra cứu nhanh thay vì phải mở từng học sinh một. Bổ sung cho
 * khung chat gắn theo từng học sinh đã có (StudentDetailPage) — không thay
 * thế, chỉ thêm chỗ nhìn tổng quan.
 */
export function TinNhanInboxPage() {
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
      <PageHeader title="Hộp thư" subtitle="Nhắn tin tổng hợp theo học sinh — tiện tra cứu" />

      {error ? <div className="form-error">{error}</div> : null}

      <ChatInbox threads={threads} loading={loading} groupByClass />
    </div>
  );
}
