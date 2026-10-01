"use client";
import { useState } from "react";

export default function PilotForm({ appSlug }: { appSlug: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  return (
    <form
      className="work-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        const data = Object.fromEntries(new FormData(event.currentTarget));
        try {
          const response = await fetch("/api/pilots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, appSlug }),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error || "Không thể gửi đăng ký.");
          setDone(true);
          setMessage(
            "Đã lưu đăng ký. Vireon sẽ liên hệ theo thông tin bạn cung cấp.",
          );
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Kết nối gián đoạn. Vui lòng thử lại.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {!done && (
        <>
          <label>
            Họ tên
            <input name="name" required maxLength={100} autoComplete="name" />
          </label>
          <label>
            Đơn vị / đội nhóm
            <input
              name="organization"
              required
              maxLength={200}
              autoComplete="organization"
            />
          </label>
          <label>
            Email hoặc số điện thoại
            <input name="contact" required maxLength={200} />
          </label>
          <label>
            Quy trình bạn muốn thử
            <textarea
              name="need"
              required
              maxLength={2000}
              rows={3}
              placeholder="Đội của bạn đang ghi nhận và tổng hợp công việc như thế nào?"
            />
          </label>
          <div hidden aria-hidden="true">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="work-check">
            <input name="consent" type="checkbox" required value="yes" />
            Tôi đồng ý để Vireon lưu thông tin và liên hệ về pilot này. Có thể
            yêu cầu xóa qua trang Liên hệ.
          </label>
          <button className="button button-primary" disabled={busy}>
            {busy ? "Đang gửi…" : "Gửi đăng ký pilot →"}
          </button>
        </>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
