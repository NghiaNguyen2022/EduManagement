import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { NumberInput, TextField } from "../components/form";
import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  getChuongTrinhDetailApi,
  setChuongTrinhStatusApi,
  updateChuongTrinhApi,
} from "../features/chuongTrinh/chuongTrinhApi";
import type { ChuongTrinhItem } from "../features/chuongTrinh/chuongTrinhTypes";
import { listLopHocApi } from "../features/lopHoc/lopHocApi";
import type { LopHocItem } from "../features/lopHoc/lopHocTypes";
import {
  useGuardedNavigate,
  useUnsavedChangesGuard,
} from "../features/navigation/UnsavedChangesContext";

const TRANG_THAI_LOP_LABEL: Record<string, string> = {
  chuan_bi: "Chuẩn bị",
  dang_hoc: "Đang học",
  tam_dung: "Tạm dừng",
  ket_thuc: "Kết thúc",
  huy: "Hủy",
};

type EditForm = {
  tenChuongTrinh: string;
  capDo: string;
  tongSoBuoi: number | null;
  tongSoGio: number | null;
  moTa: string;
};

function toEditForm(item: ChuongTrinhItem): EditForm {
  return {
    tenChuongTrinh: item.tenChuongTrinh,
    capDo: item.capDo ?? "",
    tongSoBuoi: item.tongSoBuoi,
    tongSoGio: item.tongSoGio !== null ? Number(item.tongSoGio) : null,
    moTa: item.moTa ?? "",
  };
}

export function ChuongTrinhDetailPage() {
  const { id } = useParams();
  const navigate = useGuardedNavigate();
  const { auth } = useAuth();

  const [item, setItem] = useState<ChuongTrinhItem | null>(null);
  const [classes, setClasses] = useState<LopHocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<EditForm | null>(null);
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
      const [detail, classRows] = await Promise.all([
        getChuongTrinhDetailApi(Number(id)),
        listLopHocApi(),
      ]);

      setItem(detail);
      setForm(toEditForm(detail));
      setTouched(false);
      setClasses(
        classRows.filter(
          (row) => row.chuongTrinhDaoTaoId === detail.id,
        ),
      );
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

  function updateForm(patch: Partial<EditForm>) {
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
      await updateChuongTrinhApi(Number(id), form);
      setNotice("Đã lưu thông tin chương trình.");
      setTouched(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu chương trình.",
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

      await setChuongTrinhStatusApi(Number(id), trangThaiMoi);
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
          title="Chương trình đào tạo"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={item.tenChuongTrinh}
        subtitle={`Mã chương trình ${item.maChuongTrinh}`}
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/classes")}
          >
            ← Lớp học
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
            ? "Chương trình đang hoạt động, có thể gán cho lớp mới."
            : "Chương trình đã ngừng hoạt động, không gán được cho lớp mới."}
        </p>
      </SectionCard>

      <SectionCard title="Thông tin chương trình">
        <form className="user-create-form" onSubmit={handleSave}>
          <TextField
            label="Tên chương trình"
            value={form.tenChuongTrinh}
            required
            disabled={!canManage}
            onChange={(value) => updateForm({ tenChuongTrinh: value })}
          />

          <TextField
            label="Cấp độ"
            value={form.capDo}
            disabled={!canManage}
            onChange={(value) => updateForm({ capDo: value })}
          />

          <NumberInput
            label="Tổng số buổi"
            value={form.tongSoBuoi}
            disabled={!canManage}
            onChange={(value) => updateForm({ tongSoBuoi: value })}
          />

          <NumberInput
            label="Tổng số giờ"
            value={form.tongSoGio}
            allowDecimal
            disabled={!canManage}
            onChange={(value) => updateForm({ tongSoGio: value })}
          />

          <TextField
            label="Mô tả"
            value={form.moTa}
            disabled={!canManage}
            onChange={(value) => updateForm({ moTa: value })}
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

      <SectionCard
        title="Lớp học dùng chương trình này"
        subtitle={`${classes.length} lớp`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Lớp học</th>
                <th>Sĩ số tối đa</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>
                    <GuardedLink
                      to={`/classes/${classItem.id}`}
                      className="text-button"
                    >
                      <strong>{classItem.tenLop}</strong>
                    </GuardedLink>
                    <small>{classItem.maLop}</small>
                  </td>
                  <td>{classItem.siSoToiDa ?? "Không giới hạn"}</td>
                  <td>
                    <span
                      className={`status-badge status-badge--${classItem.trangThai}`}
                    >
                      {TRANG_THAI_LOP_LABEL[classItem.trangThai]}
                    </span>
                  </td>
                </tr>
              ))}

              {classes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    Chưa có lớp nào dùng chương trình này.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
