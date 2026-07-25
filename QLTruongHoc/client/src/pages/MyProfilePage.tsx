import { useState } from "react";

import { FileUploadField, TextField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

type ProfileForm = {
  hoTen: string;
  email: string;
  soDienThoai: string;
  hinhAnhUrl: string;
};

function toForm(user: {
  hoTen: string;
  email: string | null;
  soDienThoai: string | null;
  hinhAnhUrl: string | null;
}): ProfileForm {
  return {
    hoTen: user.hoTen,
    email: user.email ?? "",
    soDienThoai: user.soDienThoai ?? "",
    hinhAnhUrl: user.hinhAnhUrl ?? "",
  };
}

export function MyProfilePage() {
  const { auth, updateProfile } = useAuth();

  const [form, setForm] = useState<ProfileForm>(() =>
    toForm(auth?.user ?? { hoTen: "", email: null, soDienThoai: null, hinhAnhUrl: null }),
  );
  const [saved, setSaved] = useState(form);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useUnsavedChangesGuard(JSON.stringify(form) !== JSON.stringify(saved));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      await updateProfile(form);
      setSaved(form);
      setNotice("Đã lưu thông tin cá nhân.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Không thể lưu thông tin.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Thông tin cá nhân"
        subtitle={`Tài khoản đăng nhập: ${auth?.user.tenDangNhap ?? ""}`}
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard title="Hồ sơ">
        <form className="user-create-form" onSubmit={handleSubmit}>
          <FileUploadField
            label="Ảnh đại diện"
            value={form.hinhAnhUrl || null}
            accept="image/*"
            onChange={(url) => setForm({ ...form, hinhAnhUrl: url ?? "" })}
          />

          <TextField
            label="Họ tên"
            value={form.hoTen}
            required
            onChange={(value) => setForm({ ...form, hoTen: value })}
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />

          <TextField
            label="Số điện thoại"
            type="tel"
            value={form.soDienThoai}
            onChange={(value) => setForm({ ...form, soDienThoai: value })}
          />

          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
