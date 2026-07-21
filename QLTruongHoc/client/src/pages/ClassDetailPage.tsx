import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateField,
  NumberInput,
  SelectField,
  TextField,
} from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { listChuongTrinhApi } from "../features/chuongTrinh/chuongTrinhApi";
import type { ChuongTrinhItem } from "../features/chuongTrinh/chuongTrinhTypes";
import { listGiaoVienApi } from "../features/giaoVien/giaoVienApi";
import type { GiaoVienItem } from "../features/giaoVien/giaoVienTypes";
import { listHocSinhApi } from "../features/hocSinh/hocSinhApi";
import type { HocSinhItem } from "../features/hocSinh/hocSinhTypes";
import {
  assignGiaoVienApi,
  chuyenLopApi,
  endGiaoVienAssignmentApi,
  getLopHocDetailApi,
  ketThucXepLopApi,
  listLopHocApi,
  setLopHocStatusApi,
  updateLopHocApi,
  xepHocSinhVaoLopApi,
} from "../features/lopHoc/lopHocApi";
import type {
  LopHocDetail,
  LopHocFormInput,
  LopHocItem,
  TrangThaiLopHoc,
  VaiTroGiaoVienLop,
} from "../features/lopHoc/lopHocTypes";

const TRANG_THAI_LOP_LABEL: Record<string, string> = {
  chuan_bi: "Chuẩn bị",
  dang_hoc: "Đang học",
  tam_dung: "Tạm dừng",
  ket_thuc: "Kết thúc",
  huy: "Hủy",
};

const VAI_TRO_GV_LABEL: Record<string, string> = {
  giao_vien_chinh: "Giáo viên chính",
  ho_tro: "Hỗ trợ",
  chu_nhiem: "Chủ nhiệm",
};

const TRANG_THAI_ENROLLMENT_LABEL: Record<string, string> = {
  dang_hoc: "Đang học",
  bao_luu: "Bảo lưu",
  chuyen_lop: "Đã chuyển lớp",
  ngung_hoc: "Ngừng học",
  hoan_thanh: "Hoàn thành",
};

export function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const classId = Number(id);

  const [detail, setDetail] = useState<LopHocDetail | null>(null);
  const [programs, setPrograms] = useState<ChuongTrinhItem[]>([]);
  const [teachers, setTeachers] = useState<GiaoVienItem[]>([]);
  const [students, setStudents] = useState<HocSinhItem[]>([]);
  const [otherClasses, setOtherClasses] = useState<LopHocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [infoForm, setInfoForm] = useState<LopHocFormInput | null>(
    null,
  );
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const [teacherAssignForm, setTeacherAssignForm] = useState({
    giaoVienId: "",
    vaiTro: "giao_vien_chinh" as VaiTroGiaoVienLop,
    tuNgay: "",
  });
  const [savingTeacherAssign, setSavingTeacherAssign] = useState(false);

  const [enrollForm, setEnrollForm] = useState({
    hocSinhId: "",
    ngayVaoLop: "",
  });
  const [savingEnroll, setSavingEnroll] = useState(false);

  const [transferState, setTransferState] = useState<{
    enrollmentId: number;
    lopHocIdMoi: string;
    ngayChuyen: string;
    lyDo: string;
  } | null>(null);
  const [savingTransfer, setSavingTransfer] = useState(false);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("lop_hoc.quan_ly")
    );
  }, [auth]);

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const [data, programRows, teacherRows, studentRows, classRows] =
        await Promise.all([
          getLopHocDetailApi(classId),
          listChuongTrinhApi(),
          listGiaoVienApi(),
          listHocSinhApi(),
          listLopHocApi(),
        ]);

      setDetail(data);
      setPrograms(programRows);
      setTeachers(teacherRows);
      setStudents(studentRows);
      setOtherClasses(classRows.filter((item) => item.id !== classId));

      setInfoForm({
        chuongTrinhDaoTaoId: data.lopHoc.chuongTrinhDaoTaoId,
        maLop: data.lopHoc.maLop,
        tenLop: data.lopHoc.tenLop,
        capDo: data.lopHoc.capDo ?? "",
        ngayBatDau: data.lopHoc.ngayBatDau ?? "",
        ngayKetThuc: data.lopHoc.ngayKetThuc ?? "",
        siSoToiDa: data.lopHoc.siSoToiDa,
        phongHoc: data.lopHoc.phongHoc ?? "",
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải lớp học.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isInteger(classId) && classId > 0) {
      void loadDetail();
    }
  }, [classId, auth?.currentOrganization?.id]);

  async function handleSaveInfo(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!infoForm) return;

    setError("");
    setNotice("");
    setSavingInfo(true);

    try {
      await updateLopHocApi(classId, infoForm);
      setNotice("Đã cập nhật thông tin lớp.");
      await loadDetail();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể cập nhật.",
      );
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleChangeStatus(trangThai: TrangThaiLopHoc) {
    setError("");
    setNotice("");
    setSavingStatus(true);

    try {
      await setLopHocStatusApi(classId, trangThai);
      setNotice(
        `Đã đổi trạng thái sang ${TRANG_THAI_LOP_LABEL[trangThai]}.`,
      );
      await loadDetail();
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

  async function handleAssignTeacher(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingTeacherAssign(true);

    try {
      await assignGiaoVienApi(classId, {
        giaoVienId: Number(teacherAssignForm.giaoVienId),
        vaiTro: teacherAssignForm.vaiTro,
        tuNgay: teacherAssignForm.tuNgay,
      });
      setNotice("Đã phân công giáo viên.");
      setTeacherAssignForm({
        giaoVienId: "",
        vaiTro: "giao_vien_chinh",
        tuNgay: "",
      });
      await loadDetail();
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : "Không thể phân công giáo viên.",
      );
    } finally {
      setSavingTeacherAssign(false);
    }
  }

  async function handleEndTeacherAssignment(phanCongId: number) {
    const today = new Date().toISOString().slice(0, 10);
    setError("");
    setNotice("");

    try {
      await endGiaoVienAssignmentApi(classId, phanCongId, today);
      setNotice("Đã kết thúc phân công giáo viên.");
      await loadDetail();
    } catch (endError) {
      setError(
        endError instanceof Error
          ? endError.message
          : "Không thể kết thúc phân công.",
      );
    }
  }

  async function handleEnroll(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingEnroll(true);

    try {
      await xepHocSinhVaoLopApi(classId, {
        hocSinhId: Number(enrollForm.hocSinhId),
        ngayVaoLop: enrollForm.ngayVaoLop,
      });
      setNotice("Đã xếp học sinh vào lớp.");
      setEnrollForm({ hocSinhId: "", ngayVaoLop: "" });
      await loadDetail();
    } catch (enrollError) {
      setError(
        enrollError instanceof Error
          ? enrollError.message
          : "Không thể xếp học sinh vào lớp.",
      );
    } finally {
      setSavingEnroll(false);
    }
  }

  async function handleEndEnrollment(
    enrollmentId: number,
    trangThai: "ngung_hoc" | "hoan_thanh",
  ) {
    const today = new Date().toISOString().slice(0, 10);
    setError("");
    setNotice("");

    try {
      await ketThucXepLopApi(enrollmentId, {
        ngayRoiLop: today,
        trangThai,
      });
      setNotice("Đã cập nhật trạng thái học sinh trong lớp.");
      await loadDetail();
    } catch (endError) {
      setError(
        endError instanceof Error
          ? endError.message
          : "Không thể cập nhật.",
      );
    }
  }

  async function handleTransfer(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!transferState) return;

    setError("");
    setNotice("");
    setSavingTransfer(true);

    try {
      await chuyenLopApi(transferState.enrollmentId, {
        lopHocIdMoi: Number(transferState.lopHocIdMoi),
        ngayChuyen: transferState.ngayChuyen,
        lyDo: transferState.lyDo || undefined,
      });
      setNotice("Đã chuyển lớp cho học sinh.");
      setTransferState(null);
      await loadDetail();
    } catch (transferError) {
      setError(
        transferError instanceof Error
          ? transferError.message
          : "Không thể chuyển lớp.",
      );
    } finally {
      setSavingTransfer(false);
    }
  }

  if (loading || !detail || !infoForm) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Lớp học"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={detail.lopHoc.tenLop}
        subtitle={`Mã lớp ${detail.lopHoc.maLop}`}
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/classes")}
          >
            ← Danh sách lớp
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Trạng thái"
        subtitle={`Hiện tại: ${TRANG_THAI_LOP_LABEL[detail.lopHoc.trangThai]}`}
      >
        {canManage ? (
          <SelectField
            value={detail.lopHoc.trangThai}
            options={Object.entries(TRANG_THAI_LOP_LABEL).map(
              ([value, label]) => ({ value, label }),
            )}
            disabled={savingStatus}
            onChange={(value) =>
              void handleChangeStatus(value as TrangThaiLopHoc)
            }
          />
        ) : null}
      </SectionCard>

      <SectionCard title="Thông tin lớp">
        <form className="user-create-form" onSubmit={handleSaveInfo}>
          <SelectField
            label="Chương trình"
            value={
              infoForm.chuongTrinhDaoTaoId
                ? String(infoForm.chuongTrinhDaoTaoId)
                : ""
            }
            placeholder="Không gắn chương trình"
            disabled={!canManage}
            options={programs.map((program) => ({
              value: String(program.id),
              label: `${program.tenChuongTrinh} (${program.maChuongTrinh})`,
            }))}
            onChange={(value) =>
              setInfoForm({
                ...infoForm,
                chuongTrinhDaoTaoId: value ? Number(value) : null,
              })
            }
          />

          <TextField
            label="Tên lớp"
            value={infoForm.tenLop}
            required
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, tenLop: value })
            }
          />

          <TextField
            label="Cấp độ"
            value={infoForm.capDo}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, capDo: value })
            }
          />

          <DateField
            label="Ngày bắt đầu"
            value={infoForm.ngayBatDau}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, ngayBatDau: value })
            }
          />

          <DateField
            label="Ngày kết thúc"
            value={infoForm.ngayKetThuc}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, ngayKetThuc: value })
            }
          />

          <NumberInput
            label="Sĩ số tối đa"
            value={infoForm.siSoToiDa}
            min={1}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, siSoToiDa: value })
            }
          />

          <TextField
            label="Phòng học"
            value={infoForm.phongHoc}
            disabled={!canManage}
            onChange={(value) =>
              setInfoForm({ ...infoForm, phongHoc: value })
            }
          />

          {canManage ? (
            <button
              type="submit"
              className="primary-button"
              disabled={savingInfo}
            >
              {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          ) : null}
        </form>
      </SectionCard>

      <SectionCard
        title="Giáo viên phụ trách"
        subtitle={`${detail.giaoVien.length} phân công`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Giáo viên</th>
                <th>Vai trò</th>
                <th>Từ ngày</th>
                <th>Trạng thái</th>
                {canManage ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {detail.giaoVien.map((item) => (
                <tr key={item.phanCongId}>
                  <td>
                    <strong>{item.giaoVien.hoTen}</strong>
                    <small>{item.giaoVien.maGiaoVien}</small>
                  </td>
                  <td>{VAI_TRO_GV_LABEL[item.vaiTro]}</td>
                  <td>{item.tuNgay}</td>
                  <td>
                    {item.trangThai === "hoat_dong"
                      ? "Đang phụ trách"
                      : `Kết thúc ${item.denNgay ?? ""}`}
                  </td>
                  {canManage ? (
                    <td>
                      {item.trangThai === "hoat_dong" ? (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            void handleEndTeacherAssignment(
                              item.phanCongId,
                            )
                          }
                        >
                          Kết thúc phân công
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}

              {detail.giaoVien.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="empty-cell"
                  >
                    Chưa phân công giáo viên.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <form
            className="user-create-form"
            onSubmit={handleAssignTeacher}
          >
            <SelectField
              label="Giáo viên"
              value={teacherAssignForm.giaoVienId}
              required
              placeholder="Chọn giáo viên"
              options={teachers.map((teacher) => ({
                value: String(teacher.id),
                label: `${teacher.hoTen} (${teacher.maGiaoVien})`,
              }))}
              onChange={(value) =>
                setTeacherAssignForm({
                  ...teacherAssignForm,
                  giaoVienId: value,
                })
              }
            />

            <SelectField
              label="Vai trò"
              value={teacherAssignForm.vaiTro}
              options={Object.entries(VAI_TRO_GV_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) =>
                setTeacherAssignForm({
                  ...teacherAssignForm,
                  vaiTro: value as VaiTroGiaoVienLop,
                })
              }
            />

            <DateField
              label="Từ ngày"
              value={teacherAssignForm.tuNgay}
              required
              onChange={(value) =>
                setTeacherAssignForm({
                  ...teacherAssignForm,
                  tuNgay: value,
                })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingTeacherAssign}
            >
              {savingTeacherAssign ? "Đang lưu..." : "Phân công"}
            </button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Học sinh trong lớp"
        subtitle={`${detail.hocSinh.length} lượt xếp lớp`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Ngày vào lớp</th>
                <th>Trạng thái</th>
                {canManage ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {detail.hocSinh.map((item) => (
                <tr key={item.enrollmentId}>
                  <td>
                    <strong>{item.hocSinh.hoTen}</strong>
                    <small>{item.hocSinh.maHocSinh}</small>
                  </td>
                  <td>{item.ngayVaoLop}</td>
                  <td>
                    {TRANG_THAI_ENROLLMENT_LABEL[item.trangThai]}
                  </td>
                  {canManage ? (
                    <td>
                      {item.trangThai === "dang_hoc" ||
                      item.trangThai === "bao_luu" ? (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              setTransferState({
                                enrollmentId: item.enrollmentId,
                                lopHocIdMoi: "",
                                ngayChuyen: "",
                                lyDo: "",
                              })
                            }
                          >
                            Chuyển lớp
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              void handleEndEnrollment(
                                item.enrollmentId,
                                "ngung_hoc",
                              )
                            }
                          >
                            Ngừng học
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              void handleEndEnrollment(
                                item.enrollmentId,
                                "hoan_thanh",
                              )
                            }
                          >
                            Hoàn thành
                          </button>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}

              {detail.hocSinh.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 4 : 3}
                    className="empty-cell"
                  >
                    Chưa có học sinh trong lớp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {transferState ? (
          <form
            className="user-create-form"
            onSubmit={handleTransfer}
          >
            <SelectField
              label="Chuyển sang lớp"
              value={transferState.lopHocIdMoi}
              required
              placeholder="Chọn lớp đích"
              options={otherClasses.map((item) => ({
                value: String(item.id),
                label: `${item.tenLop} (${item.maLop})`,
              }))}
              onChange={(value) =>
                setTransferState({
                  ...transferState,
                  lopHocIdMoi: value,
                })
              }
            />

            <DateField
              label="Ngày chuyển"
              value={transferState.ngayChuyen}
              required
              onChange={(value) =>
                setTransferState({
                  ...transferState,
                  ngayChuyen: value,
                })
              }
            />

            <TextField
              label="Lý do"
              value={transferState.lyDo}
              onChange={(value) =>
                setTransferState({ ...transferState, lyDo: value })
              }
            />

            <div className="row-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={savingTransfer}
              >
                {savingTransfer ? "Đang chuyển..." : "Xác nhận chuyển lớp"}
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => setTransferState(null)}
                disabled={savingTransfer}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : null}

        {canManage ? (
          <form className="user-create-form" onSubmit={handleEnroll}>
            <SelectField
              label="Học sinh"
              value={enrollForm.hocSinhId}
              required
              placeholder="Chọn học sinh"
              options={students.map((student) => ({
                value: String(student.id),
                label: `${student.hoTen} (${student.maHocSinh})`,
              }))}
              onChange={(value) =>
                setEnrollForm({ ...enrollForm, hocSinhId: value })
              }
            />

            <DateField
              label="Ngày vào lớp"
              value={enrollForm.ngayVaoLop}
              required
              onChange={(value) =>
                setEnrollForm({ ...enrollForm, ngayVaoLop: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingEnroll}
            >
              {savingEnroll ? "Đang lưu..." : "Xếp vào lớp"}
            </button>
          </form>
        ) : null}
      </SectionCard>
    </div>
  );
}
