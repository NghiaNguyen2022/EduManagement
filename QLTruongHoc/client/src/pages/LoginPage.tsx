import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDefaultLandingPath } from "../config/portal";
import { educationAppearance } from "../config/educationAppearance";
import { useAuth } from "../features/auth/AuthContext";

const REMEMBER_USERNAME_COOKIE = "qlth_remember_username";

function readCookie(name: string) {
  const prefix = `${name}=`;

  return (
    document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix))
      ?.slice(prefix.length) ?? ""
  );
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAgeSeconds}`,
    "sameSite=lax",
  ].join("; ");
}

function clearCookie(name: string) {
  document.cookie = [`${name}=`, "path=/", "max-age=0", "sameSite=lax"].join("; ");
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedUsername = readCookie(REMEMBER_USERNAME_COOKIE);

    if (savedUsername) {
      setUsername(decodeURIComponent(savedUsername));
      setRememberUsername(true);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const trimmedUsername = username.trim();

      if (rememberUsername && trimmedUsername) {
        writeCookie(REMEMBER_USERNAME_COOKIE, trimmedUsername, 60 * 60 * 24 * 30);
      } else {
        clearCookie(REMEMBER_USERNAME_COOKIE);
      }

      const result = await login(username, password);

      if (result.currentOrganization) {
        navigate(getDefaultLandingPath(result.currentOrganization.vaiTro), {
          replace: true,
        });
      } else {
        navigate("/", { replace: true });
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Đăng nhập thất bại.");
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
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          <label className="login-card__remember">
            <input
              type="checkbox"
              checked={rememberUsername}
              onChange={(event) => setRememberUsername(event.target.checked)}
            />
            <span>Ghi nhớ tên đăng nhập trên thiết bị này</span>
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="primary-button login-card__submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
