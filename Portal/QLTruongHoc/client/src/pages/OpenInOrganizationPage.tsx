import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

/**
 * Trang trung gian cho link "mở tab mới": nhận `?donViId=&to=`, tự chuyển
 * phiên đăng nhập sang đúng đơn vị đó rồi điều hướng tới `to`. Chỉ dùng cho
 * link mở ở TAB MỚI — vì đổi đơn vị ở đây cũng đổi đơn vị cho toàn bộ phiên
 * (mọi tab dùng chung 1 cookie), tab gốc sẽ tự cập nhật lại đúng đơn vị khi
 * được focus lại (xem `AuthContext`), không cần thao tác gì thêm.
 */
export function OpenInOrganizationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { auth, loading, selectOrganization } = useAuth();
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  const donViId = Number(searchParams.get("donViId"));
  const to = searchParams.get("to") || "/dashboard";

  useEffect(() => {
    if (loading || !auth || startedRef.current) return;

    if (!Number.isInteger(donViId) || donViId <= 0) {
      setError("Thiếu thông tin đơn vị cần mở.");
      return;
    }

    startedRef.current = true;

    selectOrganization(donViId)
      .then(() => navigate(to, { replace: true }))
      .catch((switchError) => {
        setError(
          switchError instanceof Error
            ? switchError.message
            : "Không thể chuyển sang đơn vị này.",
        );
      });
  }, [loading, auth, donViId, to, navigate, selectOrganization]);

  if (error) {
    return (
      <div className="page-stack">
        <div className="form-error">{error}</div>
      </div>
    );
  }

  return (
    <main className="loading-page">Đang chuyển sang đơn vị...</main>
  );
}
