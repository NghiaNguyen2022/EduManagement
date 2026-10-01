"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WorkApp } from "@/lib/work-apps";

type Entry = {
  id: string;
  location: string;
  item: string;
  note: string;
  summary: string;
  owner: string;
  checks: string[];
  photos: string[];
  status: string;
  createdAt: string;
  events: string[];
};
const transitions: Record<string, string> = {
  "Chờ duyệt": "Đã duyệt",
  Mới: "Đang xử lý",
  "Đang xử lý": "Chờ xác nhận",
  "Chờ xác nhận": "Hoàn tất",
};
const labels: Record<string, string> = {
  "Chờ duyệt": "Duyệt bản ghi",
  Mới: "Tiếp nhận xử lý",
  "Đang xử lý": "Báo đã xử lý",
  "Chờ xác nhận": "Người báo xác nhận",
};
function validEntries(value: unknown): value is Entry[] {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every(
      (e) =>
        e &&
        [
          "id",
          "location",
          "item",
          "note",
          "summary",
          "owner",
          "status",
          "createdAt",
        ].every((k) => typeof e[k] === "string") &&
        ["checks", "photos", "events"].every(
          (k) =>
            Array.isArray(e[k]) &&
            e[k].every((v: unknown) => typeof v === "string"),
        ) &&
        e.photos.every((p: string) => p.startsWith("data:image/jpeg;base64,")),
    )
  );
}
async function thumbnail(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Chọn ảnh JPG, PNG hoặc WebP, tối đa 10 MB/ảnh.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.65);
  } finally {
    bitmap.close();
  }
}
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function DemoWorkbench({ app }: { app: WorkApp }) {
  const storageKey = `vireon-demo-v1:${app.slug}`;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("create");
  const [location, setLocation] = useState<string>(app.locations[0]);
  const [item, setItem] = useState<string>(app.items[0]);
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState("");
  const [checks, setChecks] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [day, setDay] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const maintenance = app.code === "F03";
  useEffect(() => {
    // Read browser-only storage after hydration, without changing the server render.
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (!validEntries(parsed)) throw new Error();
          setEntries(parsed);
        }
      } catch {
        setMessage(
          "Không đọc được dữ liệu demo đã lưu. Bộ nhớ có thể bị chặn hoặc dữ liệu không hợp lệ.",
        );
      }
      setDay(localDate(new Date()));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  function persist(next: Entry[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setEntries(next);
      return true;
    } catch {
      setMessage(
        "Bộ nhớ trình duyệt đã đầy hoặc bị chặn. Chưa lưu thay đổi. Hãy xuất dữ liệu, xóa dữ liệu demo cũ hoặc giảm ảnh.",
      );
      return false;
    }
  }
  const visible = entries.filter((e) =>
    `${e.location} ${e.item} ${e.note} ${e.owner} ${e.status}`
      .toLocaleLowerCase("vi")
      .includes(filter.toLocaleLowerCase("vi")),
  );
  const daily = entries.filter((e) => localDate(new Date(e.createdAt)) === day);
  const report = [
    `${app.title} — ${day}`,
    "BÁO CÁO DEMO · Tổng hợp theo mẫu, không sử dụng AI",
    ...daily.map(
      (e, i) =>
        `\n${i + 1}. ${e.location} / ${e.item}\nNguồn: ${e.id} · ${e.status}\nNgười theo dõi: ${e.owner || "Chưa phân công"}\n${e.summary}\nGhi chú gốc: ${e.note}\nChecklist xác nhận: ${e.checks.join(", ") || "Không có"}\nẢnh đính kèm: ${e.photos.length}`,
    ),
  ].join("\n");
  return (
    <main className="demo-shell">
      <header className="demo-header">
        <Link href="/app-portal" className="demo-brand">
          V
          <span>
            VIREON <small>LABS / INTERACTIVE DEMO</small>
          </span>
        </Link>
        <Link
          className="button button-quiet"
          href={`/app-portal/${app.slug}#pilot`}
        >
          Đăng ký pilot ↗
        </Link>
      </header>
      <div className="demo-banner">
        DEMO · Dữ liệu chỉ lưu trên trình duyệt này. Ảnh được thu nhỏ để thử
        thao tác, không lưu bản gốc. Không gửi lên máy chủ, không gọi AI.
      </div>
      <div className="demo-layout">
        <aside className="demo-sidebar">
          <p className="kicker">{app.code} / WORKSPACE</p>
          <h1>{app.title}</h1>
          <p>{app.audience}</p>
          <nav aria-label="Màn hình demo">
            {[
              ["create", "+", "Ghi nhận mới"],
              ["history", "≡", "Lịch sử & xử lý"],
              ["report", "↗", "Báo cáo ngày"],
            ].map(([id, icon, label]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => {
                  setTab(id);
                  setMessage("");
                }}
                aria-current={tab === id ? "page" : undefined}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </nav>
          <div className="demo-tip">
            <strong>Thử trong 2 phút</strong>
            <p>
              1. Điền dữ liệu mẫu
              <br />
              2. Xem và sửa bản nháp
              <br />
              3. Gửi, duyệt và xuất báo cáo
            </p>
            <Link href={`/app-portal/${app.slug}`}>Phạm vi sản phẩm →</Link>
          </div>
        </aside>
        <section className="demo-content">
          <div className="demo-metrics">
            <div>
              <strong>{entries.length}</strong>
              <span>Bản ghi demo</span>
            </div>
            <div>
              <strong>
                {
                  entries.filter(
                    (e) => !["Đã duyệt", "Hoàn tất"].includes(e.status),
                  ).length
                }
              </strong>
              <span>Đang chờ xử lý</span>
            </div>
            <div>
              <strong>
                {
                  entries.filter((e) =>
                    ["Đã duyệt", "Hoàn tất"].includes(e.status),
                  ).length
                }
              </strong>
              <span>Đã xác nhận</span>
            </div>
          </div>
          <p
            role="status"
            aria-live="polite"
            className={message ? "work-notice" : ""}
          >
            {message}
          </p>
          {!ready ? (
            <p>Đang mở dữ liệu demo…</p>
          ) : tab === "create" ? (
            <form
              className="work-panel work-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!note.trim() || !summary.trim()) {
                  setMessage(
                    "Nhập ghi chú và kiểm tra bản nháp trước khi gửi.",
                  );
                  return;
                }
                if (entries.length >= 100) {
                  setMessage(
                    "Demo giới hạn 100 bản ghi. Hãy xuất và xóa dữ liệu demo trước khi tiếp tục.",
                  );
                  return;
                }
                const now = new Date().toISOString();
                const entry: Entry = {
                  id: crypto.randomUUID(),
                  location,
                  item,
                  note: note.trim(),
                  summary: summary.trim(),
                  owner: owner.trim(),
                  checks,
                  photos,
                  createdAt: now,
                  status: maintenance ? "Mới" : "Chờ duyệt",
                  events: [`${now} · Người dùng gửi bản ghi demo`],
                };
                if (persist([entry, ...entries])) {
                  setNote("");
                  setSummary("");
                  setPhotos([]);
                  setChecks([]);
                  setOwner("");
                  if (fileRef.current) fileRef.current.value = "";
                  setTab("history");
                  setMessage(
                    "Đã lưu trên trình duyệt. Chọn thao tác trên bản ghi để thử bước xử lý tiếp theo.",
                  );
                }
              }}
            >
              <div className="demo-section-head">
                <div>
                  <p className="kicker">BƯỚC 01 / GHI NHẬN</p>
                  <h2>Công việc hôm nay</h2>
                </div>
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => {
                    setNote(app.sample);
                    setSummary("");
                    setOwner("Người phụ trách mẫu");
                  }}
                >
                  Điền dữ liệu mẫu
                </button>
              </div>
              <div className="work-fields">
                <label>
                  {app.locationLabel}
                  <select
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setSummary("");
                    }}
                  >
                    {app.locations.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {app.itemLabel}
                  <select
                    value={item}
                    onChange={(e) => {
                      setItem(e.target.value);
                      setSummary("");
                    }}
                  >
                    {app.items.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Người theo dõi {maintenance ? "(bắt buộc)" : "(tùy chọn)"}
                <input
                  required={maintenance}
                  value={owner}
                  maxLength={100}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Tên người hoặc bộ phận phụ trách"
                />
              </label>
              <label>
                Ghi chú gốc
                <textarea
                  aria-label="Ghi chú gốc"
                  required
                  rows={4}
                  maxLength={3000}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setSummary("");
                  }}
                  placeholder="Việc đã ghi nhận, bất thường và điều cần xác nhận…"
                />
              </label>
              {app.checklist.length > 0 && (
                <fieldset>
                  <legend>Checklist do bạn xác nhận</legend>
                  {app.checklist.map((check) => (
                    <label key={check} className="work-check">
                      <input
                        type="checkbox"
                        checked={checks.includes(check)}
                        onChange={(e) => {
                          setChecks(
                            e.target.checked
                              ? [...checks, check]
                              : checks.filter((v) => v !== check),
                          );
                          setSummary("");
                        }}
                      />
                      {check}
                    </label>
                  ))}
                </fieldset>
              )}
              <label className="demo-upload">
                Ảnh minh họa · Tối đa 3 ảnh
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={photoBusy}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 3) {
                      e.target.value = "";
                      setMessage("Vui lòng chọn tối đa 3 ảnh.");
                      return;
                    }
                    setPhotoBusy(true);
                    try {
                      setPhotos(await Promise.all(files.map(thumbnail)));
                      setMessage("");
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "Không đọc được ảnh.",
                      );
                    } finally {
                      setPhotoBusy(false);
                    }
                  }}
                />
                <small>
                  {photoBusy
                    ? "Đang xử lý ảnh…"
                    : "Chọn lại để thay bộ ảnh. Chỉ dùng ảnh thử nghiệm."}
                </small>
              </label>
              {photos.length > 0 && (
                <div className="demo-photos">
                  {photos.map((src, i) => (
                    <Image
                      unoptimized
                      width={140}
                      height={100}
                      key={i}
                      src={src}
                      alt={`Ảnh minh họa ${i + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPhotos([]);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Bỏ ảnh
                  </button>
                </div>
              )}
              <div className="demo-draft">
                <p className="kicker">BƯỚC 02 / KIỂM TRA</p>
                <h3>Bản nháp để bạn xác nhận</h3>
                <p>
                  Ghép nội dung theo mẫu, không dùng AI. Hãy sửa thông tin chưa
                  chính xác.
                </p>
                <button
                  className="button button-quiet"
                  type="button"
                  disabled={!note.trim()}
                  onClick={() =>
                    setSummary(
                      `${location} — ${item}\n${note.trim()}${app.checklist.length ? `\nChecklist đã xác nhận: ${checks.length}/${app.checklist.length}. Các mục chưa chọn cần kiểm tra lại.` : ""}`,
                    )
                  }
                >
                  Tạo bản nháp theo mẫu
                </button>
                <label>
                  Nội dung gửi
                  <textarea
                    aria-label="Nội dung gửi"
                    required
                    maxLength={5000}
                    rows={5}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Tạo bản nháp hoặc tự nhập nội dung gửi."
                  />
                </label>
              </div>
              <button className="button button-primary" disabled={photoBusy}>
                Xác nhận & lưu bản ghi →
              </button>
            </form>
          ) : tab === "history" ? (
            <div className="work-panel">
              <div className="demo-section-head">
                <h2>Lịch sử & xử lý</h2>
                <button
                  className="button button-quiet"
                  onClick={() =>
                    download(
                      `${app.code}-demo.json`,
                      JSON.stringify(entries, null, 2),
                      "application/json",
                    )
                  }
                >
                  Xuất dữ liệu JSON
                </button>
              </div>
              <label className="work-form">
                Tìm bản ghi
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Địa điểm, thiết bị, ghi chú, trạng thái…"
                />
              </label>
              {visible.length === 0 && (
                <div className="demo-empty">
                  <h3>Chưa có bản ghi phù hợp</h3>
                  <p>
                    Bắt đầu bằng một ghi nhận mới hoặc thay đổi từ khóa tìm
                    kiếm.
                  </p>
                  <button
                    className="button button-primary"
                    onClick={() => setTab("create")}
                  >
                    Tạo bản ghi đầu tiên
                  </button>
                </div>
              )}
              {visible.map((entry) => (
                <article className="demo-entry" key={entry.id}>
                  <div className="demo-section-head">
                    <div>
                      <small>
                        {new Date(entry.createdAt).toLocaleString("vi-VN")}
                      </small>
                      <h3>{entry.item}</h3>
                    </div>
                    <span className="app-status">{entry.status}</span>
                  </div>
                  <p>
                    {entry.location} · {entry.owner || "Chưa phân công"}
                  </p>
                  <p className="demo-pre">{entry.summary}</p>
                  {entry.photos.length > 0 && (
                    <div className="demo-photos">
                      {entry.photos.map((src, i) => (
                        <Image
                          unoptimized
                          width={140}
                          height={100}
                          key={i}
                          src={src}
                          alt={`Bằng chứng demo ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  <details>
                    <summary>Ghi chú gốc & lịch sử</summary>
                    <p className="demo-pre">{entry.note}</p>
                    <small>Nguồn: {entry.id}</small>
                    <ul>
                      {entry.events.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </details>
                  {transitions[entry.status] && (
                    <button
                      className="button button-primary"
                      onClick={() => {
                        const next = transitions[entry.status];
                        if (
                          persist(
                            entries.map((e) =>
                              e.id === entry.id
                                ? {
                                    ...e,
                                    status: next,
                                    events: [
                                      ...e.events,
                                      `${new Date().toISOString()} · Demo: ${next}`,
                                    ],
                                  }
                                : e,
                            ),
                          )
                        )
                          setMessage(
                            `Đã cập nhật: ${next}. Đây là thao tác đóng vai trong demo.`,
                          );
                      }}
                    >
                      {labels[entry.status]}
                    </button>
                  )}
                </article>
              ))}
              <div className="demo-reset">
                <button
                  className="button button-quiet"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Xóa toàn bộ bản ghi demo của ứng dụng này trên trình duyệt? Hãy xuất dữ liệu trước nếu cần giữ lại.",
                      )
                    ) {
                      if (persist([]))
                        setMessage("Đã xóa dữ liệu demo của ứng dụng này.");
                    }
                  }}
                >
                  Xóa dữ liệu demo
                </button>
              </div>
            </div>
          ) : (
            <div className="work-panel work-form">
              <p className="kicker">TỔNG HỢP CÓ NGUỒN</p>
              <h2>Báo cáo ngày</h2>
              <label>
                Ngày ghi nhận
                <input
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </label>
              <p>
                Bao gồm cả bản ghi chưa duyệt, với trạng thái riêng cho từng
                nguồn. Đây chưa phải báo cáo chính thức.
              </p>
              <pre className="demo-report">
                {daily.length ? report : "Chưa có bản ghi trong ngày đã chọn."}
              </pre>
              <button
                className="button button-primary"
                disabled={!daily.length}
                onClick={() =>
                  download(
                    `${app.code}-${day}.txt`,
                    report,
                    "text/plain;charset=utf-8",
                  )
                }
              >
                Tải báo cáo TXT ↓
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
