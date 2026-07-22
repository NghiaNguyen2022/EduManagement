import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { TextField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  getGiaoVienDetailApi,
  setGiaoVienStatusApi,
  updateGiaoVienApi,
} from "../features/giaoVien/giaoVienApi";
import type {
  GiaoVienFormInput,
  GiaoVienItem,
} from "../features/giaoVien/giaoVienTypes";
import {
  useGuardedNavigate,
  useUnsavedChangesGuard,
} from "../features/navigation/UnsavedChangesContext";

function toForm(item: GiaoVienItem): GiaoVienFormInput {
  return {
    hoTen: item.hoTen,
    dienThoai: item.dienThoai ?? "",
    email: item.email ?? "",
    chuyenMon: item.chuyenMon ?? "",
    trinhDo: item.trinhDo ?? "",
  };
}

export function GiaoVienDetailPage() {
  const { id } = useParams();
  const navigate = useGuardedNavigate();
  const { auth } = useAuth();

  const [item, setItem] = useState<GiaoVienItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<GiaoVienFormInput | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const isHeThong =
    auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") ||
        permissions.includes("lop_hoc.quan_ly"))
    );
  }, [auth, isHeThong]);

  useUnsavedChangesGuard(touched);

  async function loadData() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const detail = await getGiaoVienDetailApi(Number(id));
      setItem(detail);
      setForm(toForm(detail));
      setTouched(false);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải dữ liệu.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [id, auth?.currentOrganization?.id]);

  function updateForm(patch: Partial<GiaoVienFormInput>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setTouched(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || !id) return;

    setError("");
    setNotice("");
    setSaving(true);

    try {
      await updateGiaoVienApi(Number(id), form);
      setNotice("Đã lưu hồ sơ giáo viên.");
      setTouched(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu hồ sơ giáo viên.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!item || !id) return;

    setError("");
    setNotice("");
    setSavingStatus(true);

    try {
      const trangThaiMoi =
        item.trangThai === "hoat_dong" ? "ngung_hoat_dong" : "hoat_dong";

      await setGiaoVienStatusApi(Number(id), trangThaiMoi);
      setNotice(
        `Đã đổi trạng thái sang ${
          trangThaiMoi === "hoat_dong" ? "hoạt động" : "ngừng hoạt động"
        }.`,
      );
      await loadData();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Không thể đổi trạng thái.",
      );
    } finally {
      setSavingStatus(false);
    }
  }

  if (loading || !item || !form) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Giáo viên"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={item.hoTen}
        subtitle={`Mã giáo viên ${item.maGiaoVien}`}
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/teachers")}
          >
            ← Danh sách giáo viên
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Trạng thái"
        subtitle={`Hiện tại: ${
          item.trangThai === "hoat_dong" ? "Hoạt động" : "Ngừng hoạt động"
        }`}
        actions={
          canManage ? (
            <button
              type="button"
              className={
                item.trangThai === "hoat_dong"
                  ? "danger-button"
                  : "primary-button"
              }
              disabled={savingStatus}
              onClick={() => void handleToggleStatus()}
            >
              {savingStatus
                ? "Đang lưu..."
                : item.trangThai === "hoat_dong"
                  ? "Ngừng hoạt động"
                  : "Kích hoạt lại"}
            </button>
          ) : null
        }
      >
        <p>
          {item.trangThai === "hoat_dong"
            ? "Giáo viên đang hoạt động, có thể phân công vào lớp mới."
            : "Giáo viên đã ngừng hoạt động, không phân công được vào lớp mới."}
        </p>
      </SectionCard>

      <SectionCard title="Thông tin giáo viên">
        <form className="user-create-form" onSubmit={handleSave}>
          <TextField
            label="Họ tên"
            value={form.hoTen}
            required
            disabled={!canManage}
            onChange={(value) => updateForm({ hoTen: value })}
          />

          <TextField
            label="Số điện thoại"
            type="tel"
            value={form.dienThoai}
            disabled={!canManage}
            onChange={(value) => updateForm({ dienThoai: value })}
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            disabled={!canManage}
            onChange={(value) => updateForm({ email: value })}
          />

          <TextField
            label="Chuyên môn"
            value={form.chuyenMon}
            disabled={!canManage}
            onChange={(value) => updateForm({ chuyenMon: value })}
          />

          <TextField
            label="Trình độ"
            value={form.trinhDo}
            disabled={!canManage}
            onChange={(value) => updateForm({ trinhDo: value })}
          />

          {canManage ? (
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          ) : null}
        </form>
      </SectionCard>
    </div>
  );
}
