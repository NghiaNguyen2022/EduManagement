import { useEffect, useMemo, useState } from "react";

import {
  DateField,
  NumberInput,
  SelectField,
  TextField,
} from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createChuongTrinhApi,
  listChuongTrinhApi,
} from "../features/chuongTrinh/chuongTrinhApi";
import type {
  ChuongTrinhFormInput,
  ChuongTrinhItem,
} from "../features/chuongTrinh/chuongTrinhTypes";
import {
  createLopHocApi,
  listLopHocApi,
} from "../features/lopHoc/lopHocApi";
import type {
  LopHocFormInput,
  LopHocItem,
} from "../features/lopHoc/lopHocTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const TRANG_THAI_LOP_LABEL: Record<string, string> = {
  chuan_bi: "Chuẩn bị",
  dang_hoc: "Đang học",
  tam_dung: "Tạm dừng",
  ket_thuc: "Kết thúc",
  huy: "Hủy",
};

const emptyChuongTrinhForm: ChuongTrinhFormInput = {
  maChuongTrinh: "",
  tenChuongTrinh: "",
  capDo: "",
  tongSoBuoi: null,
  tongSoGio: null,
  moTa: "",
};

const emptyLopForm: LopHocFormInput = {
  chuongTrinhDaoTaoId: null,
  maLop: "",
  tenLop: "",
  capDo: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  siSoToiDa: null,
  phongHoc: "",
};

export function ClassesPage() {
  const { auth } = useAuth();

  const [classes, setClasses] = useState<LopHocItem[]>([]);
  const [programs, setPrograms] = useState<ChuongTrinhItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState<ChuongTrinhFormInput>(
    emptyChuongTrinhForm,
  );
  const [savingProgram, setSavingProgram] = useState(false);
  const [classForm, setClassForm] = useState<LopHocFormInput>(
    emptyLopForm,
  );
  const [savingClass, setSavingClass] = useState(false);

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
    JSON.stringify(programForm) !== JSON.stringify(emptyChuongTrinhForm) ||
      JSON.stringify(classForm) !== JSON.stringify(emptyLopForm),
  );

  const programsById = useMemo(() => {
    const map = new Map<number, ChuongTrinhItem>();
    for (const program of programs) map.set(program.id, program);
    return map;
  }, [programs]);

  const filteredClasses = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return classes;

    return classes.filter(
      (item) =>
        item.tenLop.toLowerCase().includes(keyword) ||
        item.maLop.toLowerCase().includes(keyword),
    );
  }, [classes, searchText]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [classRows, programRows] = await Promise.all([
        listLopHocApi(),
        listChuongTrinhApi(),
      ]);
      setClasses(classRows);
      setPrograms(programRows);
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

  async function handleCreateProgram(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingProgram(true);

    try {
      const created = await createChuongTrinhApi(programForm);
      setNotice(`Đã tạo chương trình ${created.maChuongTrinh}.`);
      setProgramForm(emptyChuongTrinhForm);
      setShowProgramForm(false);
      await loadData();
    } catch (programError) {
      setError(
        programError instanceof Error
          ? programError.message
          : "Không thể tạo chương trình.",
      );
    } finally {
      setSavingProgram(false);
    }
  }

  async function handleCreateClass(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingClass(true);

    try {
      const created = await createLopHocApi(classForm);
      setNotice(`Đã tạo lớp ${created.maLop}.`);
      setClassForm(emptyLopForm);
      await loadData();
    } catch (classError) {
      setError(
        classError instanceof Error
          ? classError.message
          : "Không thể tạo lớp học.",
      );
    } finally {
      setSavingClass(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Lớp học"
        subtitle={
          isHeThong
            ? "Xem gộp chương trình và lớp học của tất cả đơn vị (chỉ xem — đơn vị hệ thống không mở lớp)"
            : "Quản lý chương trình đào tạo và lớp học trong đơn vị đang làm việc"
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Chương trình đào tạo"
        subtitle={`${programs.length} chương trình`}
        actions={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowProgramForm((current) => !current)}
            >
              {showProgramForm ? "Đóng" : "Thêm chương trình"}
            </button>
          ) : null
        }
      >
        {showProgramForm ? (
          <form
            className="user-create-form"
            onSubmit={handleCreateProgram}
          >
            <TextField
              label="Mã chương trình"
              value={programForm.maChuongTrinh}
              required
              placeholder="VD: IELTS-6.5"
              onChange={(value) =>
                setProgramForm({
                  ...programForm,
                  maChuongTrinh: value,
                })
              }
            />

            <TextField
              label="Tên chương trình"
              value={programForm.tenChuongTrinh}
              required
              onChange={(value) =>
                setProgramForm({
                  ...programForm,
                  tenChuongTrinh: value,
                })
              }
            />

            <TextField
              label="Cấp độ"
              value={programForm.capDo}
              onChange={(value) =>
                setProgramForm({ ...programForm, capDo: value })
              }
            />

            <NumberInput
              label="Tổng số buổi"
              value={programForm.tongSoBuoi}
              onChange={(value) =>
                setProgramForm({
                  ...programForm,
                  tongSoBuoi: value,
                })
              }
            />

            <NumberInput
              label="Tổng số giờ"
              value={programForm.tongSoGio}
              allowDecimal
              onChange={(value) =>
                setProgramForm({
                  ...programForm,
                  tongSoGio: value,
                })
              }
            />

            <TextField
              label="Mô tả"
              value={programForm.moTa}
              onChange={(value) =>
                setProgramForm({ ...programForm, moTa: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingProgram}
            >
              {savingProgram ? "Đang lưu..." : "Tạo chương trình"}
            </button>
          </form>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Chương trình</th>
                  <th>Cấp độ</th>
                  <th>Tổng buổi / giờ</th>
                  <th>Trạng thái</th>
                  {isHeThong ? <th>Đơn vị</th> : null}
                </tr>
              </thead>

              <tbody>
                {programs.map((program) => (
                  <tr key={program.id}>
                    <td>
                      <EntityLink
                        to={`/chuong-trinh/${program.id}`}
                        donVi={program.donVi}
                      >
                        <strong>{program.tenChuongTrinh}</strong>
                      </EntityLink>
                      <small>{program.maChuongTrinh}</small>
                    </td>
                    <td>{program.capDo || "—"}</td>
                    <td>
                      {program.tongSoBuoi ?? "—"} /{" "}
                      {program.tongSoGio ?? "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge status-badge--${program.trangThai}`}
                      >
                        {program.trangThai === "hoat_dong"
                          ? "Hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>
                    {isHeThong ? (
                      <td>
                        <OrgLink donVi={program.donVi} to="/classes" />
                      </td>
                    ) : null}
                  </tr>
                ))}

                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={isHeThong ? 5 : 4} className="empty-cell">
                      Chưa có chương trình nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {canManage ? (
        <SectionCard
          title="Thêm lớp học"
          subtitle="Mã lớp tự đặt theo quy ước của đơn vị."
        >
          <form
            className="user-create-form"
            onSubmit={handleCreateClass}
          >
            <SelectField
              label="Chương trình"
              value={
                classForm.chuongTrinhDaoTaoId
                  ? String(classForm.chuongTrinhDaoTaoId)
                  : ""
              }
              placeholder="Không gắn chương trình"
              options={programs.map((program) => ({
                value: String(program.id),
                label: `${program.tenChuongTrinh} (${program.maChuongTrinh})`,
              }))}
              onChange={(value) =>
                setClassForm({
                  ...classForm,
                  chuongTrinhDaoTaoId: value ? Number(value) : null,
                })
              }
            />

            <TextField
              label="Mã lớp"
              value={classForm.maLop}
              required
              placeholder="VD: MAM-LA1"
              onChange={(value) =>
                setClassForm({ ...classForm, maLop: value })
              }
            />

            <TextField
              label="Tên lớp"
              value={classForm.tenLop}
              required
              onChange={(value) =>
                setClassForm({ ...classForm, tenLop: value })
              }
            />

            <TextField
              label="Cấp độ"
              value={classForm.capDo}
              onChange={(value) =>
                setClassForm({ ...classForm, capDo: value })
              }
            />

            <DateField
              label="Ngày bắt đầu"
              value={classForm.ngayBatDau}
              onChange={(value) =>
                setClassForm({ ...classForm, ngayBatDau: value })
              }
            />

            <DateField
              label="Ngày kết thúc"
              value={classForm.ngayKetThuc}
              onChange={(value) =>
                setClassForm({ ...classForm, ngayKetThuc: value })
              }
            />

            <NumberInput
              label="Sĩ số tối đa"
              value={classForm.siSoToiDa}
              min={1}
              onChange={(value) =>
                setClassForm({ ...classForm, siSoToiDa: value })
              }
            />

            <TextField
              label="Phòng học"
              value={classForm.phongHoc}
              onChange={(value) =>
                setClassForm({ ...classForm, phongHoc: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingClass}
            >
              {savingClass ? "Đang lưu..." : "Tạo lớp"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách lớp"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${filteredClasses.length} lớp`
        }
      >
        <div className="user-toolbar">
          <TextField
            type="search"
            value={searchText}
            placeholder="Tìm theo tên hoặc mã lớp"
            onChange={setSearchText}
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Lớp học</th>
                <th>Chương trình</th>
                <th>Sĩ số tối đa</th>
                <th>Trạng thái</th>
                {isHeThong ? <th>Đơn vị</th> : null}
              </tr>
            </thead>

            <tbody>
              {filteredClasses.map((item) => (
                <tr key={item.id}>
                  <td>
                    <EntityLink
                      to={`/classes/${item.id}`}
                      donVi={item.donVi}
                    >
                      <strong>{item.tenLop}</strong>
                    </EntityLink>
                    <small>{item.maLop}</small>
                  </td>

                  <td>
                    {item.chuongTrinhDaoTaoId
                      ? (programsById.get(item.chuongTrinhDaoTaoId)
                          ?.tenChuongTrinh ?? "—")
                      : "—"}
                  </td>

                  <td>{item.siSoToiDa ?? "Không giới hạn"}</td>

                  <td>
                    <span
                      className={`status-badge status-badge--${item.trangThai}`}
                    >
                      {TRANG_THAI_LOP_LABEL[item.trangThai]}
                    </span>
                  </td>

                  {isHeThong ? (
                    <td>
                      <OrgLink donVi={item.donVi} to="/classes" />
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={isHeThong ? 5 : 4} className="empty-cell">
                    Chưa có lớp học nào.
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
