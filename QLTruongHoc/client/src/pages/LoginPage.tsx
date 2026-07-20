import { useState } from "react";

import { educationAppearance } from "../config/educationAppearance";
import { useAuth } from "../features/auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Đăng nhập thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__brand">
          <span>ED</span>
        </div>

        <h1>{educationAppearance.app.name}</h1>
        <p>{educationAppearance.app.subtitle}</p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Tên đăng nhập</span>
            <input
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
            />
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <div className="form-error">{error}</div>
          ) : null}

          <button
            type="submit"
            className="primary-button login-card__submit"
            disabled={submitting}
          >
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
