"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Đăng nhập thất bại.");
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
          autoComplete="current-password"
          required
        />
      </div>

      <button className="button-submit" type="submit" disabled={submitting}>
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
