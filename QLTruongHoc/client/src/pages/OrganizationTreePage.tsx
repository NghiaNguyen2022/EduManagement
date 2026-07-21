import { useEffect, useMemo, useState } from "react";

import {
  SelectField,
  TextField,
} from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createDonViApi,
  listDonViApi,
  setDonViStatusApi,
  updateDonViApi,
} from "../features/donVi/donViApi";
import type {
  DonViFormInput,
  DonViItem,
  TrangThaiDonVi,
} from "../features/donVi/donViTypes";

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

const emptyForm: DonViFormInput = {
  donViChaId: null,
  maDonVi: "",
  tenDonVi: "",
  loaiDonVi: "co_so",
  loaiHinhDaoTao: null,
  diaChi: "",
  soDienThoai: "",
  email: "",
};

type PendingStatusAction = {
  unit: DonViItem;
  trangThai: TrangThaiDonVi;
} | null;

export function OrganizationTreePage() {
  const { auth } = useAuth();

  const [units, setUnits] = useState<DonViItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DonViFormInput>(emptyForm);
  const [pendingStatus, setPendingStatus] =
    useState<PendingStatusAction>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return permissions.includes("he_thong.quan_tri");
  }, [auth]);

  const unitsById = useMemo(() => {
    const map = new Map<number, DonViItem>();
    for (const unit of units) {
      map.set(unit.id, unit);
    }
    return map;
  }, [units]);

  const sortedUnits = useMemo(() => {
    return [...units].sort((a, b) => {
      const parentA = a.donViChaId ?? 0;
      const parentB = b.donViChaId ?? 0;
      if (parentA !== parentB) return parentA - parentB;
      return a.tenDonVi.localeCompare(b.tenDonVi);
    });
  }, [units]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await listDonViApi();
      setUnits(rows);
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
  }, []);

  function startEdit(unit: DonViItem) {
    setEditingId(unit.id);
    setForm({
      donViChaId: unit.donViChaId,
      maDonVi: unit.maDonVi,
      tenDonVi: unit.tenDonVi,
      loaiDonVi: unit.loaiDonVi,
      loaiHinhDaoTao: unit.loaiHinhDaoTao,
      diaChi: unit.diaChi ?? "",
      soDienThoai: unit.soDienThoai ?? "",
      email: unit.email ?? "",
    });
    setNotice("");
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (editingId) {
        await updateDonViApi(editingId, {
          tenDonVi: form.tenDonVi,
          loaiDonVi: form.loaiDonVi,
          loaiHinhDaoTao: form.loaiHinhDaoTao,
          diaChi: form.diaChi,
          soDienThoai: form.soDienThoai,
          email: form.email,
        });
        setNotice(`Đã cập nhật đơn vị ${form.tenDonVi}.`);
      } else {
        await createDonViApi(form);
        setNotice(`Đã tạo đơn vị ${form.tenDonVi}.`);
      }

      resetForm();
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu đơn vị.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function executeStatusChange() {
    if (!pendingStatus) return;

    setStatusBusy(true);
    setError("");
    setNotice("");

    try {
      await setDonViStatusApi(
        pendingStatus.unit.id,
        pendingStatus.trangThai,
      );
      setNotice(
        `Đã đổi trạng thái đơn vị ${pendingStatus.unit.tenDonVi} sang ${
          TRANG_THAI_LABEL[pendingStatus.trangThai]
        }.`,
      );
      setPendingStatus(null);
      await loadData();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Không thể đổi trạng thái đơn vị.",
      );
    } finally {
      setStatusBusy(false);
    }
  }

  const parentOptions = units
    .filter((unit) => unit.trangThai === "hoat_dong")
    .map((unit) => ({
      value: unit.id,
      label: `${unit.tenDonVi} (${unit.maDonVi})`,
    }));

  return (
    <div className="page-stack">
      <PageHeader
        title="Cây đơn vị"
        subtitle="Quản lý trường, trung tâm và cơ sở trong toàn hệ thống"
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {canManage ? (
        <SectionCard
          title={editingId ? "Sửa đơn vị" : "Thêm đơn vị"}
          subtitle={
            editingId
              ? "Không thể đổi mã đơn vị và đơn vị cha sau khi tạo."
              : "Đơn vị cấp 1 (không có đơn vị cha) nằm trực tiếp dưới Hệ thống."
          }
        >
          <form className="user-create-form" onSubmit={handleSubmit}>
            <SelectField
              label="Đơn vị cha"
              value={form.donViChaId ? String(form.donViChaId) : ""}
              placeholder="Không có (đơn vị cấp 1)"
              disabled={Boolean(editingId)}
              options={parentOptions.map((option) => ({
                value: String(option.value),
                label: option.label,
              }))}
              onChange={(value) =>
                setForm({
                  ...form,
                  donViChaId: value ? Number(value) : null,
                })
              }
            />

            <TextField
              label="Mã đơn vị"
              value={form.maDonVi}
              required
              disabled={Boolean(editingId)}
              placeholder="VD: TTNN-Q8"
              onChange={(value) =>
                setForm({ ...form, maDonVi: value })
              }
            />

            <TextField
              label="Tên đơn vị"
              value={form.tenDonVi}
              required
              onChange={(value) =>
                setForm({ ...form, tenDonVi: value })
              }
            />

            <SelectField
              label="Loại đơn vị"
              value={form.loaiDonVi}
              required
              options={[
                { value: "truong", label: "Trường" },
                { value: "trung_tam", label: "Trung tâm" },
                { value: "co_so", label: "Cơ sở" },
              ]}
              onChange={(value) =>
                setForm({
                  ...form,
                  loaiDonVi: value as DonViFormInput["loaiDonVi"],
                })
              }
            />

            <SelectField
              label="Loại hình đào tạo"
              value={form.loaiHinhDaoTao ?? ""}
              placeholder="Chọn loại hình"
              options={[
                { value: "mam_non", label: "Mầm non" },
                { value: "ngoai_ngu", label: "Ngoại ngữ" },
                { value: "tin_hoc", label: "Tin học" },
                { value: "khac", label: "Khác" },
              ]}
              onChange={(value) =>
                setForm({
                  ...form,
                  loaiHinhDaoTao: value
                    ? (value as DonViFormInput["loaiHinhDaoTao"])
                    : null,
                })
              }
            />

            <TextField
              label="Địa chỉ"
              value={form.diaChi}
              onChange={(value) =>
                setForm({ ...form, diaChi: value })
              }
            />

            <TextField
              label="Số điện thoại"
              type="tel"
              value={form.soDienThoai}
              onChange={(value) =>
                setForm({ ...form, soDienThoai: value })
              }
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                setForm({ ...form, email: value })
              }
            />

            <div className="row-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Lưu thay đổi"
                    : "Tạo đơn vị"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  className="text-button"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Hủy sửa
                </button>
              ) : null}
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách đơn vị"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${units.length} đơn vị`
        }
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Đơn vị</th>
                <th>Đơn vị cha</th>
                <th>Loại</th>
                <th>Loại hình đào tạo</th>
                <th>Trạng thái</th>
                {canManage ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {sortedUnits.map((unit) => (
                <tr key={unit.id}>
                  <td>
                    <strong>{unit.tenDonVi}</strong>
                    <small>{unit.maDonVi}</small>
                  </td>

                  <td>
                    {unit.donViChaId
                      ? (unitsById.get(unit.donViChaId)?.tenDonVi ??
                        "—")
                      : "—"}
                  </td>

                  <td>{LOAI_DON_VI_LABEL[unit.loaiDonVi]}</td>

                  <td>
                    {unit.loaiHinhDaoTao
                      ? LOAI_HINH_DAO_TAO_LABEL[unit.loaiHinhDaoTao]
                      : "—"}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-badge--${unit.trangThai}`}
                    >
                      {TRANG_THAI_LABEL[unit.trangThai]}
                    </span>
                  </td>

                  {canManage ? (
                    <td>
                      <div className="row-actions">
                        {unit.loaiDonVi !== "he_thong" ? (
                          <>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => startEdit(unit)}
                            >
                              Sửa
                            </button>

                            {unit.trangThai === "hoat_dong" ? (
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  setPendingStatus({
                                    unit,
                                    trangThai: "ngung_hoat_dong",
                                  })
                                }
                              >
                                Ngừng hoạt động
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  setPendingStatus({
                                    unit,
                                    trangThai: "hoat_dong",
                                  })
                                }
                              >
                                Kích hoạt lại
                              </button>
                            )}
                          </>
                        ) : (
                          <small>Đơn vị gốc</small>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && sortedUnits.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="empty-cell"
                  >
                    Chưa có đơn vị nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={
          pendingStatus?.trangThai === "ngung_hoat_dong"
            ? "Ngừng hoạt động đơn vị"
            : "Kích hoạt lại đơn vị"
        }
        message={
          pendingStatus?.trangThai === "ngung_hoat_dong"
            ? `Đơn vị ${pendingStatus?.unit.tenDonVi} sẽ ngừng hoạt động. Người dùng đang gán tại đây sẽ không còn chọn được đơn vị này khi đăng nhập.`
            : `Kích hoạt lại đơn vị ${pendingStatus?.unit.tenDonVi}?`
        }
        confirmLabel={
          pendingStatus?.trangThai === "ngung_hoat_dong"
            ? "Ngừng hoạt động"
            : "Kích hoạt lại"
        }
        danger={pendingStatus?.trangThai === "ngung_hoat_dong"}
        busy={statusBusy}
        onConfirm={() => void executeStatusChange()}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
