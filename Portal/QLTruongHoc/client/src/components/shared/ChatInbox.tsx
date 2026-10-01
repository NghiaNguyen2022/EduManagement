import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import type { TinNhanThreadItem } from "../../features/tinNhan/tinNhanTypes";
import { ChatPanel } from "./ChatPanel";
import { SectionCard } from "./SectionCard";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

type ChatInboxProps = {
  threads: TinNhanThreadItem[];
  loading: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  groupByClass?: boolean;
};

const CHUA_XEP_LOP_LABEL = "Chưa xếp lớp";

function groupThreadsByClass(threads: TinNhanThreadItem[]) {
  const groups = new Map<string, TinNhanThreadItem[]>();

  for (const thread of threads) {
    const key = thread.lopHoc?.tenLop ?? CHUA_XEP_LOP_LABEL;
    const existing = groups.get(key) ?? [];
    existing.push(thread);
    groups.set(key, existing);
  }

  return [...groups.entries()].sort(([a], [b]) => {
    if (a === CHUA_XEP_LOP_LABEL) return 1;
    if (b === CHUA_XEP_LOP_LABEL) return -1;
    return a.localeCompare(b);
  });
}

/**
 * Hộp thư nhắn tin tổng hợp — cột trái liệt kê hội thoại (mới nhất lên
 * đầu, chấm đỏ báo chưa đọc), chọn 1 → khung chat hiện bên phải. Dùng
 * chung cho cả hộp thư nhân viên (`TinNhanInboxPage`) và hộp thư phụ huynh
 * (`ParentMessagesPage`) — khác nhau ở nguồn dữ liệu `threads` truyền vào,
 * không khác ở cách hiển thị.
 */
export function ChatInbox({
  threads,
  loading,
  emptyMessage = "Chưa có tin nhắn nào.",
  searchPlaceholder = "Tìm theo tên hoặc mã học sinh...",
  groupByClass = false,
}: ChatInboxProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const selectedHocSinhId = searchParams.get("hocSinhId")
    ? Number(searchParams.get("hocSinhId"))
    : null;

  const filteredThreads = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return threads;

    return threads.filter(
      (thread) =>
        thread.hocSinh.hoTen.toLowerCase().includes(keyword) ||
        thread.hocSinh.maHocSinh.toLowerCase().includes(keyword),
    );
  }, [threads, search]);

  const selectedThread = threads.find((thread) => thread.hocSinh.id === selectedHocSinhId);

  function selectThread(hocSinhId: number) {
    setSearchParams({ hocSinhId: String(hocSinhId) });
  }

  function renderThreadButton(thread: TinNhanThreadItem) {
    return (
      <button
        type="button"
        key={thread.hocSinh.id}
        className={
          thread.hocSinh.id === selectedHocSinhId
            ? "tin-nhan-inbox__thread tin-nhan-inbox__thread--active"
            : "tin-nhan-inbox__thread"
        }
        onClick={() => selectThread(thread.hocSinh.id)}
      >
        <div className="tin-nhan-inbox__thread-header">
          <strong>{thread.hocSinh.hoTen}</strong>
          {thread.coTinChuaDoc ? <span className="tin-nhan-inbox__unread-dot" /> : null}
        </div>
        <small>{thread.hocSinh.maHocSinh}</small>
        <p>
          {thread.lastMessage.nguoiGuiLaPhuHuynh ? "Phụ huynh: " : "Nhà trường: "}
          {thread.lastMessage.noiDung}
        </p>
        <small className="tin-nhan-inbox__thread-time">
          {formatDateTime(thread.lastMessage.createdAt)}
        </small>
      </button>
    );
  }

  return (
    <div className="tin-nhan-inbox">
      <SectionCard className="tin-nhan-inbox__list-card">
        <input
          className="form-control"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="tin-nhan-inbox__threads">
          {loading ? <div className="empty-cell">Đang tải...</div> : null}

          {!loading && filteredThreads.length === 0 ? (
            <div className="empty-cell">{emptyMessage}</div>
          ) : null}

          {groupByClass
            ? groupThreadsByClass(filteredThreads).map(([className, groupThreads]) => (
                <div className="tin-nhan-inbox__group" key={className}>
                  <strong className="tin-nhan-inbox__group-title">{className}</strong>
                  {groupThreads.map((thread) => renderThreadButton(thread))}
                </div>
              ))
            : filteredThreads.map((thread) => renderThreadButton(thread))}
        </div>
      </SectionCard>

      <SectionCard
        className="tin-nhan-inbox__chat-card"
        title={selectedThread ? selectedThread.hocSinh.hoTen : "Chọn 1 học sinh"}
        subtitle={selectedThread ? selectedThread.hocSinh.maHocSinh : undefined}
      >
        {selectedThread ? (
          <ChatPanel hocSinhId={selectedThread.hocSinh.id} pollIntervalMs={5000} />
        ) : (
          <div className="empty-cell">Chọn 1 học sinh bên trái để xem nhắn tin.</div>
        )}
      </SectionCard>
    </div>
  );
}
