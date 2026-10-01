"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Khởi tạo thất bại.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="username">Tên đăng nhập</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          minLength={3}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <button className="button-submit" type="submit" disabled={submitting}>
        {submitting ? "Đang khởi tạo..." : "Tạo tài khoản admin"}
      </button>
    </form>
  );
}
