import { useEffect, useState } from "react";

import { NumberInput, TextAreaField, TextField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  getCauHinhHeThongApi,
  updateCauHinhHeThongApi,
} from "../features/cauHinh/cauHinhApi";
import type { CauHinhHeThongFormInput } from "../features/cauHinh/cauHinhTypes";
import {
  getCauHinhMauInApi,
  updateCauHinhMauInApi,
} from "../features/mauIn/mauInApi";
import type { CauHinhMauInFormInput } from "../features/mauIn/mauInTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const emptyForm: CauHinhHeThongFormInput = {
  soLanDangNhapSaiToiDa: 5,
  soPhutKhoaDangNhap: 15,
  doDaiMatKhauToiThieu: 8,
};

const emptyMauInForm: CauHinhMauInFormInput = {
  hienThiLogo: true,
  ghiChuFooter: "",
  nhanKyNguoiLap: "Người lập phiếu",
  nhanKyNguoiNop: "Phụ huynh / Người nộp",
  nhanKyDaiDienDonVi: "Đại diện đơn vị",
};

export function SettingsPage() {
  const { auth } = useAuth();

  const quyen = auth?.currentOrganization?.quyen ?? [];
  const isHeThongAdmin = quyen.includes("he_thong.quan_tri");
  const isDonViManager = quyen.includes("don_vi.quan_ly");
  const canManage = isHeThongAdmin;
  const canManageMauIn = isHeThongAdmin || isDonViManager;

  const [form, setForm] = useState<CauHinhHeThongFormInput>(emptyForm);
  const [saved, setSaved] = useState<CauHinhHeThongFormInput>(emptyForm);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [mauInForm, setMauInForm] = useState<CauHinhMauInFormInput>(emptyMauInForm);
  const [mauInSaved, setMauInSaved] = useState<CauHinhMauInFormInput>(emptyMauInForm);
  const [mauInLoading, setMauInLoading] = useState(true);
  const [mauInSaving, setMauInSaving] = useState(false);
  const [mauInError, setMauInError] = useState("");
  const [mauInNotice, setMauInNotice] = useState("");

  useUnsavedChangesGuard(
    JSON.stringify(form) !== JSON.stringify(saved) ||
      JSON.stringify(mauInForm) !== JSON.stringify(mauInSaved),
  );

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

  async function loadMauInData() {
    setMauInLoading(true);
    setMauInError("");

    try {
      const data = await getCauHinhMauInApi();
      const next: CauHinhMauInFormInput = {
        hienThiLogo: data.hienThiLogo,
        ghiChuFooter: data.ghiChuFooter ?? "",
        nhanKyNguoiLap: data.nhanKyNguoiLap,
        nhanKyNguoiNop: data.nhanKyNguoiNop,
        nhanKyDaiDienDonVi: data.nhanKyDaiDienDonVi,
      };

      setMauInForm(next);
      setMauInSaved(next);
    } catch (loadError) {
      setMauInError(
        loadError instanceof Error ? loadError.message : "Không thể tải thiết lập mẫu in.",
      );
    } finally {
      setMauInLoading(false);
    }
  }

  useEffect(() => {
    void loadMauInData();
  }, []);

  async function handleSubmitMauIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMauInError("");
    setMauInNotice("");
    setMauInSaving(true);

    try {
      const updated = await updateCauHinhMauInApi(mauInForm);
      const next: CauHinhMauInFormInput = {
        hienThiLogo: updated.hienThiLogo,
        ghiChuFooter: updated.ghiChuFooter ?? "",
        nhanKyNguoiLap: updated.nhanKyNguoiLap,
        nhanKyNguoiNop: updated.nhanKyNguoiNop,
        nhanKyDaiDienDonVi: updated.nhanKyDaiDienDonVi,
      };

      setMauInForm(next);
      setMauInSaved(next);
      setMauInNotice("Đã lưu thiết lập mẫu in.");
    } catch (submitError) {
      setMauInError(
        submitError instanceof Error ? submitError.message : "Không thể lưu thiết lập mẫu in.",
      );
    } finally {
      setMauInSaving(false);
    }
  }

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

  if (!canManage && !canManageMauIn) {
    return (
      <div className="page-stack">
        <PageHeader title="Cài đặt" subtitle="Bạn không có quyền truy cập trang này." />
        <div className="form-error">Bạn không có quyền truy cập trang này.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Cài đặt"
        subtitle="Chính sách đăng nhập, mật khẩu và thiết lập mẫu in."
      />

      {canManage ? (
        <>
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
        </>
      ) : null}

      {canManageMauIn ? (
        <>
          {mauInError ? <div className="form-error">{mauInError}</div> : null}
          {mauInNotice ? <div className="form-success">{mauInNotice}</div> : null}

          <SectionCard
            title="Thiết lập mẫu in"
            subtitle="Áp dụng cho phiếu thu, phiếu nhập học, phiếu xếp lớp của đơn vị đang làm việc."
          >
            {mauInLoading ? (
              <div className="empty-cell">Đang tải...</div>
            ) : (
              <form className="user-create-form" onSubmit={handleSubmitMauIn}>
                <label className="checkbox-inline field-span-full">
                  <input
                    type="checkbox"
                    checked={mauInForm.hienThiLogo}
                    onChange={(event) =>
                      setMauInForm({ ...mauInForm, hienThiLogo: event.target.checked })
                    }
                  />
                  Hiển thị hình ảnh/logo đơn vị trên phiếu in
                </label>

                <TextField
                  label="Nhãn chữ ký · Người lập phiếu"
                  value={mauInForm.nhanKyNguoiLap}
                  onChange={(value) => setMauInForm({ ...mauInForm, nhanKyNguoiLap: value })}
                />

                <TextField
                  label="Nhãn chữ ký · Người nộp"
                  value={mauInForm.nhanKyNguoiNop}
                  onChange={(value) => setMauInForm({ ...mauInForm, nhanKyNguoiNop: value })}
                />

                <TextField
                  label="Nhãn chữ ký · Đại diện đơn vị"
                  value={mauInForm.nhanKyDaiDienDonVi}
                  onChange={(value) => setMauInForm({ ...mauInForm, nhanKyDaiDienDonVi: value })}
                />

                <TextAreaField
                  label="Ghi chú footer"
                  value={mauInForm.ghiChuFooter}
                  placeholder="VD: Mọi thắc mắc vui lòng liên hệ phòng học vụ."
                  className="field-span-full"
                  onChange={(value) => setMauInForm({ ...mauInForm, ghiChuFooter: value })}
                />

                <button type="submit" className="primary-button" disabled={mauInSaving}>
                  {mauInSaving ? "Đang lưu..." : "Lưu thiết lập mẫu in"}
                </button>
              </form>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
