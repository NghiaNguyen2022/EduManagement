import { useEffect, useMemo, useState } from "react";

import { TextField } from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createGiaoVienApi,
  listGiaoVienApi,
} from "../features/giaoVien/giaoVienApi";
import type {
  GiaoVienFormInput,
  GiaoVienItem,
} from "../features/giaoVien/giaoVienTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const emptyForm: GiaoVienFormInput = {
  hoTen: "",
  dienThoai: "",
  email: "",
  chuyenMon: "",
  trinhDo: "",
};

export function TeachersPage() {
  const { auth } = useAuth();

  const [teachers, setTeachers] = useState<GiaoVienItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GiaoVienFormInput>(emptyForm);

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

  useUnsavedChangesGuard(
    JSON.stringify(form) !== JSON.stringify(emptyForm),
  );

  const filteredTeachers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return teachers;

    return teachers.filter(
      (teacher) =>
        teacher.hoTen.toLowerCase().includes(keyword) ||
        teacher.maGiaoVien.toLowerCase().includes(keyword) ||
        (teacher.chuyenMon ?? "").toLowerCase().includes(keyword),
    );
  }, [searchText, teachers]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await listGiaoVienApi();
      setTeachers(rows);
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const created = await createGiaoVienApi(form);
      setNotice(`Đã tạo hồ sơ giáo viên ${created.maGiaoVien}.`);
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu hồ sơ giáo viên.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Giáo viên"
        subtitle={
          isHeThong
            ? "Xem gộp giáo viên của tất cả đơn vị (chỉ xem — đơn vị hệ thống không quản lý hồ sơ giáo viên)"
            : "Quản lý hồ sơ giáo viên trong đơn vị đang làm việc"
        }
        action={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowForm((current) => !current)}
            >
              {showForm ? "Đóng" : "Thêm giáo viên"}
            </button>
          ) : null
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {showForm && canManage ? (
        <SectionCard
          title="Thêm giáo viên"
          subtitle="Mã giáo viên do hệ thống tự sinh."
        >
          <form className="user-create-form" onSubmit={handleSubmit}>
            <TextField
              label="Họ tên"
              value={form.hoTen}
              required
              onChange={(value) =>
                setForm({ ...form, hoTen: value })
              }
            />

            <TextField
              label="Số điện thoại"
              type="tel"
              value={form.dienThoai}
              onChange={(value) =>
                setForm({ ...form, dienThoai: value })
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

            <TextField
              label="Chuyên môn"
              value={form.chuyenMon}
              onChange={(value) =>
                setForm({ ...form, chuyenMon: value })
              }
            />

            <TextField
              label="Trình độ"
              value={form.trinhDo}
              onChange={(value) =>
                setForm({ ...form, trinhDo: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Tạo hồ sơ"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách giáo viên"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${filteredTeachers.length} giáo viên`
        }
      >
        <div className="user-toolbar">
          <TextField
            type="search"
            value={searchText}
            placeholder="Tìm theo tên, mã hoặc chuyên môn"
            onChange={setSearchText}
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Giáo viên</th>
                <th>Liên hệ</th>
                <th>Chuyên môn</th>
                <th>Trạng thái</th>
                {isHeThong ? <th>Đơn vị</th> : null}
              </tr>
            </thead>

            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <EntityLink
                      to={`/teachers/${teacher.id}`}
                      donVi={teacher.donVi}
                    >
                      <strong>{teacher.hoTen}</strong>
                    </EntityLink>
                    <small>{teacher.maGiaoVien}</small>
                  </td>

                  <td>
                    <span>{teacher.dienThoai || "—"}</span>
                    <small>{teacher.email || "Chưa có email"}</small>
                  </td>

                  <td>{teacher.chuyenMon || "—"}</td>

                  <td>
                    <span
                      className={`status-badge status-badge--${teacher.trangThai}`}
                    >
                      {teacher.trangThai === "hoat_dong"
                        ? "Hoạt động"
                        : "Ngừng hoạt động"}
                    </span>
                  </td>

                  {isHeThong ? (
                    <td>
                      <OrgLink donVi={teacher.donVi} to="/teachers" />
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && filteredTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4 + (isHeThong ? 1 : 0)}
                    className="empty-cell"
                  >
                    Chưa có giáo viên nào.
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
