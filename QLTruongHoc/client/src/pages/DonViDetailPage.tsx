import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { SelectField, TextField } from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  getDonViDetailApi,
  listDonViApi,
  setDonViStatusApi,
  updateDonViApi,
} from "../features/donVi/donViApi";
import type {
  DonViFormInput,
  DonViItem,
  TrangThaiDonVi,
} from "../features/donVi/donViTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const LOAI_DON_VI_LABEL: Record<string, string> = {
  he_thong: "Hệ thống",
  truong: "Trường",
  trung_tam: "Trung tâm",
  co_so: "Cơ sở",
};

const LOAI_HINH_DAO_TAO_LABEL: Record<string, string> = {
  mam_non: "Mầm non",
  ngoai_ngu: "Ngoại ngữ",
  tin_hoc: "Tin học",
  khac: "Khác",
};

const TRANG_THAI_LABEL: Record<string, string> = {
  hoat_dong: "Hoạt động",
  tam_ngung: "Tạm ngưng",
  ngung_hoat_dong: "Ngừng hoạt động",
};

type EditForm = Omit<DonViFormInput, "donViChaId" | "maDonVi">;

function toEditForm(item: DonViItem): EditForm {
  return {
    tenDonVi: item.tenDonVi,
    loaiDonVi: item.loaiDonVi,
    loaiHinhDaoTao: item.loaiHinhDaoTao,
    diaChi: item.diaChi ?? "",
    soDienThoai: item.soDienThoai ?? "",
    email: item.email ?? "",
  };
}

export function DonViDetailPage() {
  const { id } = useParams();
  const { auth } = useAuth();

  const [item, setItem] = useState<DonViItem | null>(null);
  const [parent, setParent] = useState<DonViItem | null>(null);
  const [children, setChildren] = useState<DonViItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<EditForm | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pendingStatus, setPendingStatus] =
    useState<TrangThaiDonVi | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState("");

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return permissions.includes("he_thong.quan_tri");
  }, [auth]);

  useUnsavedChangesGuard(touched);

  async function loadData() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const [detail, allUnits] = await Promise.all([
        getDonViDetailApi(Number(id)),
        listDonViApi(),
      ]);

      setItem(detail);
      setForm(toEditForm(detail));
      setTouched(false);
      setParent(
        detail.donViChaId
          ? (allUnits.find((unit) => unit.id === detail.donViChaId) ??
              null)
          : null,
      );
      setChildren(
        allUnits.filter((unit) => unit.donViChaId === detail.id),
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
  }, [id]);

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
      await updateDonViApi(Number(id), form);
      setNotice("Đã lưu thông tin đơn vị.");
      setTouched(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu đơn vị.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmStatus() {
    if (!pendingStatus || !id) return;

    setStatusBusy(true);
    setStatusError("");

    try {
      await setDonViStatusApi(Number(id), pendingStatus);
      setNotice(
        `Đã đổi trạng thái sang ${TRANG_THAI_LABEL[pendingStatus]}.`,
      );
      setPendingStatus(null);
      await loadData();
    } catch (statusErr) {
      setStatusError(
        statusErr instanceof Error
          ? statusErr.message
          : "Không thể đổi trạng thái đơn vị.",
      );
    } finally {
      setStatusBusy(false);
    }
  }

  if (loading || !item || !form) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Đơn vị"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  const isRoot = item.loaiDonVi === "he_thong";

  return (
    <div className="page-stack">
      <PageHeader
        title={item.tenDonVi}
        subtitle={`Mã đơn vị ${item.maDonVi}${parent ? ` · thuộc ${parent.tenDonVi}` : ""}`}
        action={
          <GuardedLink to="/organizations" className="text-button">
            ← Cây đơn vị
          </GuardedLink>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Trạng thái"
        subtitle={`Hiện tại: ${TRANG_THAI_LABEL[item.trangThai]}`}
        actions={
          canManage && !isRoot ? (
            <div className="row-actions">
              {item.trangThai !== "hoat_dong" ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setStatusError("");
                    setPendingStatus("hoat_dong");
                  }}
                >
                  Kích hoạt lại
                </button>
              ) : null}

              {item.trangThai !== "tam_ngung" ? (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setStatusError("");
                    setPendingStatus("tam_ngung");
                  }}
                >
                  Tạm ngưng
                </button>
              ) : null}

              {item.trangThai !== "ngung_hoat_dong" ? (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => {
                    setStatusError("");
                    setPendingStatus("ngung_hoat_dong");
                  }}
                >
                  Ngừng hoạt động
                </button>
              ) : null}
            </div>
          ) : null
        }
      >
        <p>
          {isRoot
            ? "Đơn vị hệ thống gốc, không thể đổi trạng thái."
            : "Ngừng hoạt động sẽ ẩn đơn vị này khỏi danh sách chọn khi đăng nhập."}
        </p>
      </SectionCard>

      <SectionCard title="Thông tin đơn vị">
        <form className="user-create-form" onSubmit={handleSave}>
          <TextField label="Mã đơn vị" value={item.maDonVi} disabled onChange={() => {}} />

          <TextField
            label="Tên đơn vị"
            value={form.tenDonVi}
            required
            disabled={!canManage}
            onChange={(value) => updateForm({ tenDonVi: value })}
          />

          <SelectField
            label="Loại đơn vị"
            value={form.loaiDonVi}
            required
            disabled={!canManage || isRoot}
            options={[
              { value: "truong", label: "Trường" },
              { value: "trung_tam", label: "Trung tâm" },
              { value: "co_so", label: "Cơ sở" },
            ]}
            onChange={(value) =>
              updateForm({
                loaiDonVi: value as EditForm["loaiDonVi"],
              })
            }
          />

          <SelectField
            label="Loại hình đào tạo"
            value={form.loaiHinhDaoTao ?? ""}
            placeholder="Chọn loại hình"
            disabled={!canManage}
            options={[
              { value: "mam_non", label: "Mầm non" },
              { value: "ngoai_ngu", label: "Ngoại ngữ" },
              { value: "tin_hoc", label: "Tin học" },
              { value: "khac", label: "Khác" },
            ]}
            onChange={(value) =>
              updateForm({
                loaiHinhDaoTao: value
                  ? (value as EditForm["loaiHinhDaoTao"])
                  : null,
              })
            }
          />

          <TextField
            label="Địa chỉ"
            value={form.diaChi}
            disabled={!canManage}
            onChange={(value) => updateForm({ diaChi: value })}
          />

          <TextField
            label="Số điện thoại"
            type="tel"
            value={form.soDienThoai}
            disabled={!canManage}
            onChange={(value) => updateForm({ soDienThoai: value })}
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            disabled={!canManage}
            onChange={(value) => updateForm({ email: value })}
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
        title="Đơn vị con"
        subtitle={`${children.length} đơn vị`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Đơn vị</th>
                <th>Loại</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {children.map((child) => (
                <tr key={child.id}>
                  <td>
                    <GuardedLink
                      to={`/organizations/${child.id}`}
                      className="text-button"
                    >
                      <strong>{child.tenDonVi}</strong>
                    </GuardedLink>
                    <small>{child.maDonVi}</small>
                  </td>
                  <td>{LOAI_DON_VI_LABEL[child.loaiDonVi]}</td>
                  <td>
                    <span
                      className={`status-badge status-badge--${child.trangThai}`}
                    >
                      {TRANG_THAI_LABEL[child.trangThai]}
                    </span>
                  </td>
                </tr>
              ))}

              {children.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    Chưa có đơn vị con.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={pendingStatus !== null}
        title="Đổi trạng thái đơn vị"
        message={
          pendingStatus
            ? `Đổi trạng thái đơn vị ${item.tenDonVi} sang "${TRANG_THAI_LABEL[pendingStatus]}"?`
            : ""
        }
        confirmLabel={
          pendingStatus ? TRANG_THAI_LABEL[pendingStatus] : "Xác nhận"
        }
        danger={pendingStatus === "ngung_hoat_dong"}
        busy={statusBusy}
        error={statusError}
        onConfirm={() => void handleConfirmStatus()}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
