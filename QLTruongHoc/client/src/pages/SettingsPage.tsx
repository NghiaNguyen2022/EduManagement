import { useEffect, useState } from "react";

import { NumberInput } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  getCauHinhHeThongApi,
  updateCauHinhHeThongApi,
} from "../features/cauHinh/cauHinhApi";
import type { CauHinhHeThongFormInput } from "../features/cauHinh/cauHinhTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const emptyForm: CauHinhHeThongFormInput = {
  soLanDangNhapSaiToiDa: 5,
  soPhutKhoaDangNhap: 15,
  doDaiMatKhauToiThieu: 8,
};

export function SettingsPage() {
  const { auth } = useAuth();

  const canManage = (auth?.currentOrganization?.quyen ?? []).includes(
    "he_thong.quan_tri",
  );

  const [form, setForm] = useState<CauHinhHeThongFormInput>(emptyForm);
  const [saved, setSaved] = useState<CauHinhHeThongFormInput>(emptyForm);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useUnsavedChangesGuard(JSON.stringify(form) !== JSON.stringify(saved));

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const data = await getCauHinhHeThongApi();
      const next: CauHinhHeThongFormInput = {
        soLanDangNhapSaiToiDa: data.soLanDangNhapSaiToiDa,
        soPhutKhoaDangNhap: data.soPhutKhoaDangNhap,
        doDaiMatKhauToiThieu: data.doDaiMatKhauToiThieu,
      };

      setForm(next);
      setSaved(next);
      setUpdatedAt(data.updatedAt);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải cấu hình hệ thống.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      const updated = await updateCauHinhHeThongApi(form);
      const next: CauHinhHeThongFormInput = {
        soLanDangNhapSaiToiDa: updated.soLanDangNhapSaiToiDa,
        soPhutKhoaDangNhap: updated.soPhutKhoaDangNhap,
        doDaiMatKhauToiThieu: updated.doDaiMatKhauToiThieu,
      };

      setForm(next);
      setSaved(next);
      setUpdatedAt(updated.updatedAt);
      setNotice("Đã lưu cấu hình hệ thống.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Không thể lưu cấu hình.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <div className="page-stack">
        <PageHeader title="Cấu hình hệ thống" subtitle="Chỉ quản trị hệ thống mới xem được trang này." />
        <div className="form-error">Bạn không có quyền truy cập trang này.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Cấu hình hệ thống"
        subtitle="Chính sách đăng nhập và mật khẩu áp dụng cho toàn hệ thống."
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Chính sách đăng nhập · mật khẩu"
        subtitle={
          loading
            ? "Đang tải..."
            : updatedAt
              ? `Cập nhật lần cuối: ${updatedAt}`
              : undefined
        }
      >
        {loading ? (
          <div className="empty-cell">Đang tải...</div>
        ) : (
          <form className="user-create-form" onSubmit={handleSubmit}>
            <NumberInput
              label="Số lần đăng nhập sai tối đa"
              value={form.soLanDangNhapSaiToiDa}
              min={3}
              max={20}
              helpText="Vượt quá số lần này, tài khoản bị tạm khoá."
              onChange={(value) =>
                setForm({ ...form, soLanDangNhapSaiToiDa: value ?? emptyForm.soLanDangNhapSaiToiDa })
              }
            />

            <NumberInput
              label="Thời gian khoá tài khoản (phút)"
              value={form.soPhutKhoaDangNhap}
              min={1}
              max={1440}
              onChange={(value) =>
                setForm({ ...form, soPhutKhoaDangNhap: value ?? emptyForm.soPhutKhoaDangNhap })
              }
            />

            <NumberInput
              label="Độ dài mật khẩu tối thiểu"
              value={form.doDaiMatKhauToiThieu}
              min={6}
              max={32}
              helpText="Mật khẩu vẫn luôn cần chữ hoa, chữ thường, số và ký tự đặc biệt."
              onChange={(value) =>
                setForm({ ...form, doDaiMatKhauToiThieu: value ?? emptyForm.doDaiMatKhauToiThieu })
              }
            />

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </form>
        )}
      </SectionCard>
    </div>
  );
}
