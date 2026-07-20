import { useState } from "react";

import { useAuth } from "../features/auth/AuthContext";

export function ChangePasswordPage() {
  const {
    auth,
    changePassword,
    logout,
  } = useAuth();

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
    } catch (changeError) {
      setError(
        changeError instanceof Error
          ? changeError.message
          : "Không thể đổi mật khẩu.",
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

        <h1>Đổi mật khẩu lần đầu</h1>

        <p>
          Xin chào {auth?.user.hoTen}. Vui lòng đổi mật khẩu
          tạm trước khi sử dụng hệ thống.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Mật khẩu hiện tại</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
            />
          </label>

          <label>
            <span>Mật khẩu mới</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              autoComplete="new-password"
            />
          </label>

          <label>
            <span>Xác nhận mật khẩu mới</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              autoComplete="new-password"
            />
          </label>

          <div className="password-hint">
            Ít nhất 8 ký tự, có chữ hoa, chữ thường,
            chữ số và ký tự đặc biệt.
          </div>

          {error ? (
            <div className="form-error">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="primary-button login-card__submit"
            disabled={submitting}
          >
            {submitting
              ? "Đang cập nhật..."
              : "Đổi mật khẩu"}
          </button>

          <button
            type="button"
            className="text-button"
            onClick={() => void logout()}
          >
            Đăng xuất
          </button>
        </form>
      </section>
    </main>
  );
}
