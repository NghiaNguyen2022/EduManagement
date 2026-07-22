import { useEffect, useMemo, useState } from "react";

import {
  SelectField,
  TextField,
} from "../components/form";
import { EntityLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createDonViApi,
  listDonViApi,
} from "../features/donVi/donViApi";
import type {
  DonViFormInput,
  DonViItem,
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

export function OrganizationTreePage() {
  const { auth } = useAuth();

  const [units, setUnits] = useState<DonViItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DonViFormInput>(emptyForm);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return permissions.includes("he_thong.quan_tri");
  }, [auth]);

  useUnsavedChangesGuard(
    JSON.stringify(form) !== JSON.stringify(emptyForm),
  );

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      await createDonViApi(form);
      setNotice(`Đã tạo đơn vị ${form.tenDonVi}.`);
      setForm(emptyForm);
      setShowForm(false);
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
        action={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowForm((current) => !current)}
            >
              {showForm ? "Đóng" : "Thêm đơn vị"}
            </button>
          ) : null
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {showForm && canManage ? (
        <SectionCard
          title="Thêm đơn vị"
          subtitle="Đơn vị cấp 1 (không có đơn vị cha) nằm trực tiếp dưới Hệ thống."
        >
          <form className="user-create-form" onSubmit={handleSubmit}>
            <SelectField
              label="Đơn vị cha"
              value={form.donViChaId ? String(form.donViChaId) : ""}
              placeholder="Không có (đơn vị cấp 1)"
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

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Tạo đơn vị"}
            </button>
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
              </tr>
            </thead>

            <tbody>
              {sortedUnits.map((unit) => (
                <tr key={unit.id}>
                  <td>
                    <EntityLink to={`/organizations/${unit.id}`}>
                      <strong>{unit.tenDonVi}</strong>
                    </EntityLink>
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
                </tr>
              ))}

              {!loading && sortedUnits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Chưa có đơn vị nào.
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
