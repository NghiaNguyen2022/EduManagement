import { useEffect, useMemo, useState } from "react";

import { SelectField, TextAreaField, TextField } from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { listHocSinhApi } from "../features/hocSinh/hocSinhApi";
import type { HocSinhItem } from "../features/hocSinh/hocSinhTypes";
import { listLopHocApi } from "../features/lopHoc/lopHocApi";
import type { LopHocItem } from "../features/lopHoc/lopHocTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";
import { createTraoDoiApi, listTraoDoiApi } from "../features/traoDoi/traoDoiApi";
import type {
  KenhLienLac,
  NguoiGuiVaiTro,
  TraoDoiFormInput,
  TraoDoiItem,
} from "../features/traoDoi/traoDoiTypes";

const emptyForm: TraoDoiFormInput = {
  hocSinhId: "",
  lopHocId: "",
  nguoiGuiVaiTro: "hoc_vu",
  kenhLienLac: "truc_tiep",
  noiDung: "",
  ketQua: "",
};

const NGUOI_GUI_LABEL: Record<NguoiGuiVaiTro, string> = {
  giao_vien: "Giáo viên",
  phu_huynh: "Phụ huynh",
  hoc_vu: "Học vụ",
  khac: "Khác",
};

const KENH_LABEL: Record<KenhLienLac, string> = {
  truc_tiep: "Trực tiếp",
  dien_thoai: "Điện thoại",
  nhan_tin: "Nhắn tin",
  email: "Email",
  khac: "Khác",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function displayStudent(item: HocSinhItem) {
  return `${item.hoTen} · ${item.maHocSinh}`;
}

function displayClass(item: LopHocItem) {
  return `${item.tenLop} · ${item.maLop}`;
}

export function TraoDoiPage() {
  const { auth } = useAuth();

  const [items, setItems] = useState<TraoDoiItem[]>([]);
  const [students, setStudents] = useState<HocSinhItem[]>([]);
  const [classes, setClasses] = useState<LopHocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hocSinhFilter, setHocSinhFilter] = useState("");
  const [lopHocFilter, setLopHocFilter] = useState("");
  const [form, setForm] = useState<TraoDoiFormInput>(emptyForm);

  const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];

    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_sinh.quan_ly") ||
      permissions.includes("lop_hoc.quan_ly") ||
      permissions.includes("tuyen_sinh.quan_ly")
    );
  }, [auth]);

  useUnsavedChangesGuard(JSON.stringify(form) !== JSON.stringify(emptyForm));

  const filteredItems = useMemo(() => {
    let rows = items;

    if (hocSinhFilter) {
      rows = rows.filter((item) => String(item.hocSinhId) === hocSinhFilter);
    }

    if (lopHocFilter) {
      rows = rows.filter((item) => String(item.lopHocId ?? "") === lopHocFilter);
    }

    return rows;
  }, [items, hocSinhFilter, lopHocFilter]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [rows, studentRows, classRows] = await Promise.all([
        listTraoDoiApi({
          hocSinhId: hocSinhFilter ? Number(hocSinhFilter) : null,
          lopHocId: lopHocFilter ? Number(lopHocFilter) : null,
        }),
        listHocSinhApi(),
        listLopHocApi(),
      ]);

      setItems(rows);
      setStudents(studentRows);
      setClasses(classRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [auth?.currentOrganization?.id, hocSinhFilter, lopHocFilter]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const created = await createTraoDoiApi(form);
      setNotice(`Đã ghi trao đổi cho ${created.hocSinh.hoTen}.`);
      setForm(emptyForm);
      await loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo trao đổi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack thong-bao-page">
      <PageHeader
        title="Trao đổi phụ huynh"
        subtitle="Ghi nhận trao đổi theo học sinh hoặc lớp, bám theo khung sườn đang dùng của hệ thống."
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {canManage ? (
        <SectionCard
          className="thong-bao-card thong-bao-card--form"
          title="Ghi trao đổi"
          subtitle="Dùng cho trao đổi giữa giáo viên/học vụ và phụ huynh theo từng học sinh hoặc lớp."
        >
          <form className="thong-bao-form" onSubmit={handleCreate}>
            <div className="thong-bao-form__grid">
              <div className="thong-bao-form__field thong-bao-form__field--span-3">
                <SelectField
                  label="Học sinh"
                  value={form.hocSinhId}
                  required
                  placeholder="Chọn học sinh"
                  options={students.map((item) => ({
                    value: item.id,
                    label:
                      isHeThong && item.donVi
                        ? `${displayStudent(item)} · ${item.donVi.tenDonVi}`
                        : displayStudent(item),
                  }))}
                  onChange={(value) => setForm({ ...form, hocSinhId: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-3">
                <SelectField
                  label="Lớp học"
                  value={form.lopHocId}
                  placeholder="(Không bắt buộc)"
                  options={classes.map((item) => ({
                    value: item.id,
                    label:
                      isHeThong && item.donVi
                        ? `${displayClass(item)} · ${item.donVi.tenDonVi}`
                        : displayClass(item),
                  }))}
                  onChange={(value) => setForm({ ...form, lopHocId: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-2">
                <SelectField
                  label="Vai trò người ghi"
                  value={form.nguoiGuiVaiTro}
                  required
                  options={Object.entries(NGUOI_GUI_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  onChange={(value) =>
                    setForm({ ...form, nguoiGuiVaiTro: value as NguoiGuiVaiTro })
                  }
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-2">
                <SelectField
                  label="Kênh liên lạc"
                  value={form.kenhLienLac}
                  required
                  options={Object.entries(KENH_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  onChange={(value) => setForm({ ...form, kenhLienLac: value as KenhLienLac })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-5">
                <TextAreaField
                  label="Nội dung trao đổi"
                  value={form.noiDung}
                  required
                  rows={6}
                  onChange={(value) => setForm({ ...form, noiDung: value })}
                />
              </div>

              <div className="thong-bao-form__field thong-bao-form__field--span-5">
                <TextField
                  label="Kết quả / hướng xử lý"
                  value={form.ketQua}
                  placeholder="Ví dụ: Hẹn gặp phụ huynh vào thứ 6"
                  onChange={(value) => setForm({ ...form, ketQua: value })}
                />
              </div>
            </div>

            <div className="thong-bao-form__actions">
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Ghi trao đổi"}
              </button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        className="thong-bao-card thong-bao-card--list"
        title="Lịch sử trao đổi"
        subtitle={loading ? "Đang tải dữ liệu..." : `${filteredItems.length} trao đổi`}
      >
        <div className="thong-bao-toolbar">
          <SelectField
            value={hocSinhFilter}
            placeholder="Tất cả học sinh"
            options={students.map((item) => ({
              value: item.id,
              label:
                isHeThong && item.donVi
                  ? `${displayStudent(item)} · ${item.donVi.tenDonVi}`
                  : displayStudent(item),
            }))}
            onChange={setHocSinhFilter}
          />

          <SelectField
            value={lopHocFilter}
            placeholder="Tất cả lớp học"
            options={classes.map((item) => ({
              value: item.id,
              label:
                isHeThong && item.donVi
                  ? `${displayClass(item)} · ${item.donVi.tenDonVi}`
                  : displayClass(item),
            }))}
            onChange={setLopHocFilter}
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table thong-bao-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Lớp</th>
                <th>Bên ghi</th>
                <th>Kênh</th>
                <th>Nội dung</th>
                <th>Ngày ghi</th>
                {isHeThong ? <th>Đơn vị</th> : null}
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <EntityLink to={`/students/${item.hocSinh.id}`} donVi={item.donVi}>
                      <strong>{item.hocSinh.hoTen}</strong>
                    </EntityLink>
                    <small>{item.hocSinh.maHocSinh}</small>
                  </td>

                  <td>
                    {item.lopHoc?.id ? (
                      <EntityLink to={`/classes/${item.lopHoc.id}`} donVi={item.donVi}>
                        {item.lopHoc.tenLop}
                      </EntityLink>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{NGUOI_GUI_LABEL[item.nguoiGuiVaiTro]}</td>
                  <td>{KENH_LABEL[item.kenhLienLac]}</td>
                  <td className="thong-bao-table__main-cell">
                    <small className="thong-bao-table__content">{item.noiDung}</small>
                    {item.ketQua ? (
                      <small className="thong-bao-table__attachment">Kết quả: {item.ketQua}</small>
                    ) : null}
                    <small className="thong-bao-row-actions__meta">
                      Người ghi: {item.nguoiTao.hoTen}
                    </small>
                  </td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  {isHeThong ? (
                    <td>
                      <OrgLink donVi={item.donVi} to="/communications" />
                    </td>
                  ) : null}
                </tr>
              ))}

              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isHeThong ? 7 : 6} className="empty-cell">
                    Chưa có trao đổi nào.
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
