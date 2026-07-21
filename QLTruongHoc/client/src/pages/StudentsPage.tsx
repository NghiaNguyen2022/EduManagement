import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  DateField,
  SelectField,
  TextField,
} from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createHocSinhApi,
  listHocSinhApi,
} from "../features/hocSinh/hocSinhApi";
import type {
  HocSinhFormInput,
  HocSinhItem,
} from "../features/hocSinh/hocSinhTypes";

const TRANG_THAI_LABEL: Record<string, string> = {
  tiep_nhan: "Tiếp nhận",
  dang_hoc: "Đang học",
  bao_luu: "Bảo lưu",
  ngung_hoc: "Ngừng học",
  hoan_thanh: "Hoàn thành",
};

const emptyForm: HocSinhFormInput = {
  hoTen: "",
  tenThuongGoi: "",
  ngaySinh: "",
  gioiTinh: "",
  diaChi: "",
  ngayNhapHoc: "",
};

export function StudentsPage() {
  const { auth } = useAuth();

  const [students, setStudents] = useState<HocSinhItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState<HocSinhFormInput>(emptyForm);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_sinh.quan_ly")
    );
  }, [auth]);

  const filteredStudents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter(
      (student) =>
        student.hoTen.toLowerCase().includes(keyword) ||
        student.maHocSinh.toLowerCase().includes(keyword) ||
        (student.tenThuongGoi ?? "")
          .toLowerCase()
          .includes(keyword),
    );
  }, [searchText, students]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await listHocSinhApi();
      setStudents(rows);
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
  }, [auth?.currentOrganization?.id]);

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const created = await createHocSinhApi(form);
      setNotice(`Đã tạo hồ sơ học sinh ${created.maHocSinh}.`);
      setForm(emptyForm);
      await loadData();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Không thể tạo học sinh.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Học sinh · Học viên"
        subtitle="Quản lý hồ sơ học sinh trong đơn vị đang làm việc"
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {canManage ? (
        <SectionCard
          title="Thêm học sinh"
          subtitle="Mã học sinh do hệ thống tự sinh theo năm."
        >
          <form className="user-create-form" onSubmit={handleCreate}>
            <TextField
              label="Họ tên"
              value={form.hoTen}
              required
              onChange={(value) =>
                setForm({ ...form, hoTen: value })
              }
            />

            <TextField
              label="Tên thường gọi"
              value={form.tenThuongGoi}
              onChange={(value) =>
                setForm({ ...form, tenThuongGoi: value })
              }
            />

            <DateField
              label="Ngày sinh"
              value={form.ngaySinh}
              required
              onChange={(value) =>
                setForm({ ...form, ngaySinh: value })
              }
            />

            <SelectField
              label="Giới tính"
              value={form.gioiTinh}
              placeholder="Chọn giới tính"
              options={[
                { value: "nam", label: "Nam" },
                { value: "nu", label: "Nữ" },
                { value: "khac", label: "Khác" },
              ]}
              onChange={(value) =>
                setForm({
                  ...form,
                  gioiTinh: value as HocSinhFormInput["gioiTinh"],
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

            <DateField
              label="Ngày nhập học"
              value={form.ngayNhapHoc}
              onChange={(value) =>
                setForm({ ...form, ngayNhapHoc: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo hồ sơ"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách học sinh"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${filteredStudents.length} học sinh`
        }
      >
        <div className="user-toolbar">
          <TextField
            type="search"
            value={searchText}
            placeholder="Tìm theo tên hoặc mã học sinh"
            onChange={setSearchText}
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Ngày sinh</th>
                <th>Ngày nhập học</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <Link
                      to={`/students/${student.id}`}
                      className="text-button"
                    >
                      <strong>{student.hoTen}</strong>
                    </Link>
                    <small>{student.maHocSinh}</small>
                  </td>

                  <td>{student.ngaySinh ?? "—"}</td>
                  <td>{student.ngayNhapHoc ?? "—"}</td>

                  <td>
                    <span
                      className={`status-badge status-badge--${student.trangThai}`}
                    >
                      {TRANG_THAI_LABEL[student.trangThai]}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    Chưa có học sinh nào.
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
