import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateField,
  NumberInput,
  SelectField,
  TextAreaField,
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
  createLichHocApi,
  listBuoiHocApi,
  listLichHocApi,
  ngungLichHocApi,
  setBuoiHocTrangThaiApi,
  sinhBuoiHocApi,
  taoBuoiHocBuApi,
} from "../features/lichHoc/lichHocApi";
import type {
  BuoiHocItem,
  LichHocFormInput,
  LichHocItem,
} from "../features/lichHoc/lichHocTypes";
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
import { createTraoDoiApi, listTraoDoiApi } from "../features/traoDoi/traoDoiApi";
import type {
  KenhLienLac,
  NguoiGuiVaiTro,
  TraoDoiFormInput,
  TraoDoiItem,
} from "../features/traoDoi/traoDoiTypes";

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

const THU_TRONG_TUAN_LABEL: Record<number, string> = {
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
  8: "Chủ Nhật",
};

const TRANG_THAI_BUOI_HOC_LABEL: Record<string, string> = {
  du_kien: "Dự kiến",
  da_hoc: "Đã học",
  nghi: "Nghỉ",
  huy: "Huỷ",
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

const emptyTraoDoiForm: TraoDoiFormInput = {
  hocSinhId: "",
  lopHocId: "",
  nguoiGuiVaiTro: "giao_vien",
  kenhLienLac: "truc_tiep",
  noiDung: "",
  ketQua: "",
};

const initialLichHocForm: LichHocFormInput = {
  thuTrongTuanList: [],
  gioBatDau: "",
  gioKetThuc: "",
  phongHoc: "",
  giaoVienId: null,
  ngayApDungTu: "",
  ngayApDungDen: "",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

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

  const [traoDoiItems, setTraoDoiItems] = useState<TraoDoiItem[]>([]);
  const [loadingTraoDoi, setLoadingTraoDoi] = useState(false);
  const [traoDoiForm, setTraoDoiForm] = useState<TraoDoiFormInput>(
    emptyTraoDoiForm,
  );
  const [savingTraoDoi, setSavingTraoDoi] = useState(false);

  const [lichHocList, setLichHocList] = useState<LichHocItem[]>([]);
  const [lichHocForm, setLichHocForm] = useState<LichHocFormInput>(
    initialLichHocForm,
  );
  const [savingLichHoc, setSavingLichHoc] = useState(false);
  const [sinhBuoiHocState, setSinhBuoiHocState] = useState<
    Record<number, string>
  >({});
  const [generatingLichHocId, setGeneratingLichHocId] = useState<
    number | null
  >(null);

  const [buoiHocList, setBuoiHocList] = useState<BuoiHocItem[]>([]);
  const [buoiHocRange, setBuoiHocRange] = useState({
    tuNgay: todayIso(),
    denNgay: addDaysIso(todayIso(), 30),
  });
  const [loadingBuoiHoc, setLoadingBuoiHoc] = useState(false);
  const [makeupForm, setMakeupForm] = useState({
    ngayHoc: "",
    gioBatDau: "",
    gioKetThuc: "",
    phongHoc: "",
    giaoVienId: "",
    ghiChu: "",
  });
  const [savingMakeup, setSavingMakeup] = useState(false);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("lop_hoc.quan_ly")
    );
  }, [auth]);

  const canXemDiemDanh = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("diem_danh.xem") ||
      permissions.includes("diem_danh.thuc_hien")
    );
  }, [auth]);

  // Khớp đúng quyền ghi trao đổi của trang /communications gốc (không dùng
  // canManage của trang này — canManage chỉ xoay quanh lop_hoc.quan_ly, còn
  // ghi trao đổi còn mở cho hoc_sinh.quan_ly/tuyen_sinh.quan_ly).
  const canManageTraoDoi = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_sinh.quan_ly") ||
      permissions.includes("lop_hoc.quan_ly") ||
      permissions.includes("tuyen_sinh.quan_ly")
    );
  }, [auth]);

  async function loadTraoDoi() {
    setLoadingTraoDoi(true);

    try {
      const rows = await listTraoDoiApi({ lopHocId: classId });
      setTraoDoiItems(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải trao đổi.",
      );
    } finally {
      setLoadingTraoDoi(false);
    }
  }

  useEffect(() => {
    void loadTraoDoi();
  }, [classId, auth?.currentOrganization?.id]);

  async function handleCreateTraoDoi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingTraoDoi(true);

    try {
      await createTraoDoiApi({ ...traoDoiForm, lopHocId: String(classId) });
      setNotice("Đã ghi trao đổi.");
      setTraoDoiForm(emptyTraoDoiForm);
      await loadTraoDoi();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Không thể ghi trao đổi.",
      );
    } finally {
      setSavingTraoDoi(false);
    }
  }

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const [
        data,
        programRows,
        teacherRows,
        studentRows,
        classRows,
        lichHocRows,
      ] = await Promise.all([
        getLopHocDetailApi(classId),
        listChuongTrinhApi(),
        listGiaoVienApi(),
        listHocSinhApi(),
        listLopHocApi(),
        listLichHocApi(classId),
      ]);

      setDetail(data);
      setPrograms(programRows);
      setTeachers(teacherRows);
      setStudents(studentRows);
      setOtherClasses(classRows.filter((item) => item.id !== classId));
      setLichHocList(lichHocRows);

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

  async function loadBuoiHoc() {
    if (!Number.isInteger(classId) || classId <= 0) return;

    setLoadingBuoiHoc(true);

    try {
      const rows = await listBuoiHocApi(classId, buoiHocRange);
      setBuoiHocList(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải buổi học.",
      );
    } finally {
      setLoadingBuoiHoc(false);
    }
  }

  useEffect(() => {
    void loadBuoiHoc();
  }, [
    classId,
    buoiHocRange.tuNgay,
    buoiHocRange.denNgay,
    auth?.currentOrganization?.id,
  ]);

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

  function toggleThu(thu: number) {
    setLichHocForm((current) => ({
      ...current,
      thuTrongTuanList: current.thuTrongTuanList.includes(thu)
        ? current.thuTrongTuanList.filter((item) => item !== thu)
        : [...current.thuTrongTuanList, thu],
    }));
  }

  async function handleCreateLichHoc(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingLichHoc(true);

    try {
      await createLichHocApi(classId, lichHocForm);
      setNotice("Đã tạo quy tắc lịch học.");
      setLichHocForm(initialLichHocForm);
      const rows = await listLichHocApi(classId);
      setLichHocList(rows);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Không thể tạo quy tắc lịch học.",
      );
    } finally {
      setSavingLichHoc(false);
    }
  }

  async function handleNgungLichHoc(lichHocId: number) {
    setError("");
    setNotice("");

    try {
      await ngungLichHocApi(lichHocId);
      setNotice("Đã ngừng quy tắc lịch học.");
      const rows = await listLichHocApi(classId);
      setLichHocList(rows);
    } catch (stopError) {
      setError(
        stopError instanceof Error
          ? stopError.message
          : "Không thể ngừng quy tắc lịch học.",
      );
    }
  }

  async function handleSinhBuoiHoc(lichHocId: number) {
    const denNgay = sinhBuoiHocState[lichHocId];

    if (!denNgay) {
      setError("Vui lòng chọn sinh buổi học đến ngày nào.");
      return;
    }

    setError("");
    setNotice("");
    setGeneratingLichHocId(lichHocId);

    try {
      const result = await sinhBuoiHocApi(lichHocId, denNgay);
      setNotice(`Đã sinh ${result.created} buổi học.`);
      await loadBuoiHoc();
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Không thể sinh buổi học.",
      );
    } finally {
      setGeneratingLichHocId(null);
    }
  }

  async function handleSetBuoiHocTrangThai(
    buoiHocId: number,
    trangThai: "du_kien" | "nghi" | "huy",
  ) {
    setError("");
    setNotice("");

    try {
      await setBuoiHocTrangThaiApi(buoiHocId, trangThai);
      setNotice("Đã cập nhật trạng thái buổi học.");
      await loadBuoiHoc();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Không thể cập nhật trạng thái buổi học.",
      );
    }
  }

  async function handleCreateMakeup(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingMakeup(true);

    try {
      await taoBuoiHocBuApi(classId, {
        ngayHoc: makeupForm.ngayHoc,
        gioBatDau: makeupForm.gioBatDau,
        gioKetThuc: makeupForm.gioKetThuc,
        phongHoc: makeupForm.phongHoc,
        giaoVienId: makeupForm.giaoVienId
          ? Number(makeupForm.giaoVienId)
          : null,
        ghiChu: makeupForm.ghiChu,
      });
      setNotice("Đã tạo buổi học bù.");
      setMakeupForm({
        ngayHoc: "",
        gioBatDau: "",
        gioKetThuc: "",
        phongHoc: "",
        giaoVienId: "",
        ghiChu: "",
      });
      await loadBuoiHoc();
    } catch (makeupError) {
      setError(
        makeupError instanceof Error
          ? makeupError.message
          : "Không thể tạo buổi học bù.",
      );
    } finally {
      setSavingMakeup(false);
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

      <SectionCard
        title="Trao đổi phụ huynh"
        subtitle={
          loadingTraoDoi
            ? "Đang tải dữ liệu..."
            : `${traoDoiItems.length} trao đổi trong lớp này`
        }
      >
        {canManageTraoDoi ? (
          <form className="user-create-form" onSubmit={handleCreateTraoDoi}>
            <SelectField
              label="Học sinh"
              value={traoDoiForm.hocSinhId}
              required
              placeholder="Chọn học sinh trong lớp"
              options={detail.hocSinh.map((item) => ({
                value: item.hocSinh.id,
                label: `${item.hocSinh.hoTen} · ${item.hocSinh.maHocSinh}`,
              }))}
              onChange={(value) =>
                setTraoDoiForm({ ...traoDoiForm, hocSinhId: value })
              }
            />

            <SelectField
              label="Vai trò người ghi"
              value={traoDoiForm.nguoiGuiVaiTro}
              required
              options={Object.entries(NGUOI_GUI_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) =>
                setTraoDoiForm({
                  ...traoDoiForm,
                  nguoiGuiVaiTro: value as NguoiGuiVaiTro,
                })
              }
            />

            <SelectField
              label="Kênh liên lạc"
              value={traoDoiForm.kenhLienLac}
              required
              options={Object.entries(KENH_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) =>
                setTraoDoiForm({
                  ...traoDoiForm,
                  kenhLienLac: value as KenhLienLac,
                })
              }
            />

            <TextAreaField
              label="Nội dung trao đổi"
              value={traoDoiForm.noiDung}
              required
              rows={3}
              onChange={(value) =>
                setTraoDoiForm({ ...traoDoiForm, noiDung: value })
              }
            />

            <TextField
              label="Kết quả / hướng xử lý"
              value={traoDoiForm.ketQua}
              placeholder="Ví dụ: Hẹn gặp phụ huynh vào thứ 6"
              onChange={(value) =>
                setTraoDoiForm({ ...traoDoiForm, ketQua: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingTraoDoi}
            >
              {savingTraoDoi ? "Đang lưu..." : "Ghi trao đổi"}
            </button>
          </form>
        ) : null}

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Bên ghi</th>
                <th>Kênh</th>
                <th>Nội dung</th>
                <th>Ngày ghi</th>
              </tr>
            </thead>

            <tbody>
              {traoDoiItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.hocSinh.hoTen}</strong>
                    <small>{item.hocSinh.maHocSinh}</small>
                  </td>
                  <td>{NGUOI_GUI_LABEL[item.nguoiGuiVaiTro]}</td>
                  <td>{KENH_LABEL[item.kenhLienLac]}</td>
                  <td>
                    <small>{item.noiDung}</small>
                    {item.ketQua ? <small>Kết quả: {item.ketQua}</small> : null}
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "Asia/Ho_Chi_Minh",
                    }).format(new Date(item.createdAt))}
                  </td>
                </tr>
              ))}

              {!loadingTraoDoi && traoDoiItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Chưa có trao đổi nào trong lớp này.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Lịch học lặp lại"
        subtitle={`${lichHocList.length} quy tắc`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Thứ</th>
                <th>Giờ</th>
                <th>Phòng</th>
                <th>Giáo viên</th>
                <th>Áp dụng</th>
                <th>Trạng thái</th>
                {canManage ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {lichHocList.map((item) => (
                <tr key={item.id}>
                  <td>{THU_TRONG_TUAN_LABEL[item.thuTrongTuan]}</td>
                  <td>
                    {item.gioBatDau.slice(0, 5)} - {item.gioKetThuc.slice(0, 5)}
                  </td>
                  <td>{item.phongHoc || "—"}</td>
                  <td>
                    {teachers.find((t) => t.id === item.giaoVienId)?.hoTen ||
                      "—"}
                  </td>
                  <td>
                    {item.ngayApDungTu} → {item.ngayApDungDen || "..."}
                  </td>
                  <td>
                    {item.trangThai === "hoat_dong"
                      ? "Đang áp dụng"
                      : "Đã ngừng"}
                  </td>
                  {canManage ? (
                    <td>
                      {item.trangThai === "hoat_dong" ? (
                        <div className="row-actions">
                          <input
                            type="date"
                            className="form-control"
                            value={sinhBuoiHocState[item.id] ?? ""}
                            onChange={(event) =>
                              setSinhBuoiHocState({
                                ...sinhBuoiHocState,
                                [item.id]: event.target.value,
                              })
                            }
                          />

                          <button
                            type="button"
                            className="text-button"
                            disabled={generatingLichHocId === item.id}
                            onClick={() =>
                              void handleSinhBuoiHoc(item.id)
                            }
                          >
                            {generatingLichHocId === item.id
                              ? "Đang sinh..."
                              : "Sinh buổi học"}
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              void handleNgungLichHoc(item.id)
                            }
                          >
                            Ngừng
                          </button>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}

              {lichHocList.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="empty-cell">
                    Chưa có quy tắc lịch học.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <form
            className="user-create-form"
            onSubmit={handleCreateLichHoc}
          >
            <div className="form-field">
              <span className="form-field__label">
                Thứ trong tuần
                <b aria-hidden="true"> *</b>
              </span>

              <div className="row-actions">
                {Object.entries(THU_TRONG_TUAN_LABEL).map(
                  ([value, label]) => (
                    <label key={value} className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={lichHocForm.thuTrongTuanList.includes(
                          Number(value),
                        )}
                        onChange={() => toggleThu(Number(value))}
                      />
                      {label}
                    </label>
                  ),
                )}
              </div>
            </div>

            <TextField
              label="Giờ bắt đầu"
              type="time"
              value={lichHocForm.gioBatDau}
              required
              onChange={(value) =>
                setLichHocForm({ ...lichHocForm, gioBatDau: value })
              }
            />

            <TextField
              label="Giờ kết thúc"
              type="time"
              value={lichHocForm.gioKetThuc}
              required
              onChange={(value) =>
                setLichHocForm({ ...lichHocForm, gioKetThuc: value })
              }
            />

            <TextField
              label="Phòng học"
              value={lichHocForm.phongHoc}
              placeholder={infoForm.phongHoc || "Theo phòng của lớp"}
              onChange={(value) =>
                setLichHocForm({ ...lichHocForm, phongHoc: value })
              }
            />

            <SelectField
              label="Giáo viên"
              value={
                lichHocForm.giaoVienId
                  ? String(lichHocForm.giaoVienId)
                  : ""
              }
              placeholder="Theo giáo viên chính của lớp"
              options={teachers.map((teacher) => ({
                value: String(teacher.id),
                label: `${teacher.hoTen} (${teacher.maGiaoVien})`,
              }))}
              onChange={(value) =>
                setLichHocForm({
                  ...lichHocForm,
                  giaoVienId: value ? Number(value) : null,
                })
              }
            />

            <DateField
              label="Áp dụng từ"
              value={lichHocForm.ngayApDungTu}
              required
              onChange={(value) =>
                setLichHocForm({ ...lichHocForm, ngayApDungTu: value })
              }
            />

            <DateField
              label="Áp dụng đến (tuỳ chọn)"
              value={lichHocForm.ngayApDungDen}
              onChange={(value) =>
                setLichHocForm({ ...lichHocForm, ngayApDungDen: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingLichHoc}
            >
              {savingLichHoc ? "Đang lưu..." : "Thêm quy tắc lịch học"}
            </button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Buổi học"
        subtitle={
          loadingBuoiHoc
            ? "Đang tải..."
            : `${buoiHocList.length} buổi trong khoảng đã chọn`
        }
      >
        <div className="user-toolbar">
          <DateField
            label="Từ ngày"
            value={buoiHocRange.tuNgay}
            onChange={(value) =>
              setBuoiHocRange({ ...buoiHocRange, tuNgay: value })
            }
          />

          <DateField
            label="Đến ngày"
            value={buoiHocRange.denNgay}
            onChange={(value) =>
              setBuoiHocRange({ ...buoiHocRange, denNgay: value })
            }
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Phòng</th>
                <th>Giáo viên</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                {canXemDiemDanh ? <th>Điểm danh</th> : null}
                {canManage ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {buoiHocList.map((item) => (
                <tr key={item.id}>
                  <td>{item.ngayHoc}</td>
                  <td>
                    {item.gioBatDau.slice(0, 5)} - {item.gioKetThuc.slice(0, 5)}
                  </td>
                  <td>{item.phongHoc || "—"}</td>
                  <td>
                    {teachers.find((t) => t.id === item.giaoVienId)?.hoTen ||
                      "—"}
                  </td>
                  <td>{item.loaiBuoi === "bu" ? "Học bù" : "Thường"}</td>
                  <td>{TRANG_THAI_BUOI_HOC_LABEL[item.trangThai]}</td>
                  {canXemDiemDanh ? (
                    <td>
                      {item.trangThai === "nghi" ||
                      item.trangThai === "huy" ? (
                        "—"
                      ) : (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            navigate(
                              `/attendance?buoiHocId=${item.id}`,
                            )
                          }
                        >
                          Điểm danh
                        </button>
                      )}
                    </td>
                  ) : null}
                  {canManage ? (
                    <td>
                      {item.trangThai === "du_kien" ? (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            void handleSetBuoiHocTrangThai(item.id, "nghi")
                          }
                        >
                          Đánh dấu nghỉ
                        </button>
                      ) : item.trangThai === "nghi" ? (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            void handleSetBuoiHocTrangThai(
                              item.id,
                              "du_kien",
                            )
                          }
                        >
                          Mở lại
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}

              {buoiHocList.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      6 +
                      (canXemDiemDanh ? 1 : 0) +
                      (canManage ? 1 : 0)
                    }
                    className="empty-cell"
                  >
                    Chưa có buổi học trong khoảng ngày này.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <form
            className="user-create-form"
            onSubmit={handleCreateMakeup}
          >
            <DateField
              label="Ngày học bù"
              value={makeupForm.ngayHoc}
              required
              onChange={(value) =>
                setMakeupForm({ ...makeupForm, ngayHoc: value })
              }
            />

            <TextField
              label="Giờ bắt đầu"
              type="time"
              value={makeupForm.gioBatDau}
              required
              onChange={(value) =>
                setMakeupForm({ ...makeupForm, gioBatDau: value })
              }
            />

            <TextField
              label="Giờ kết thúc"
              type="time"
              value={makeupForm.gioKetThuc}
              required
              onChange={(value) =>
                setMakeupForm({ ...makeupForm, gioKetThuc: value })
              }
            />

            <TextField
              label="Phòng học"
              value={makeupForm.phongHoc}
              onChange={(value) =>
                setMakeupForm({ ...makeupForm, phongHoc: value })
              }
            />

            <SelectField
              label="Giáo viên"
              value={makeupForm.giaoVienId}
              placeholder="Không chọn"
              options={teachers.map((teacher) => ({
                value: String(teacher.id),
                label: `${teacher.hoTen} (${teacher.maGiaoVien})`,
              }))}
              onChange={(value) =>
                setMakeupForm({ ...makeupForm, giaoVienId: value })
              }
            />

            <TextField
              label="Ghi chú"
              value={makeupForm.ghiChu}
              onChange={(value) =>
                setMakeupForm({ ...makeupForm, ghiChu: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={savingMakeup}
            >
              {savingMakeup ? "Đang lưu..." : "Tạo buổi học bù"}
            </button>
          </form>
        ) : null}
      </SectionCard>
    </div>
  );
}
