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
import { TabBar } from "../components/shared/TabBar";
import { useAuth } from "../features/auth/AuthContext";
import { listChuongTrinhApi } from "../features/chuongTrinh/chuongTrinhApi";
import type { ChuongTrinhItem } from "../features/chuongTrinh/chuongTrinhTypes";
import { listGiaoVienApi } from "../features/giaoVien/giaoVienApi";
import type { GiaoVienItem } from "../features/giaoVien/giaoVienTypes";
import { addDanhGiaApi, listHocSinhApi } from "../features/hocSinh/hocSinhApi";
import type {
  HocSinhItem,
  LinhVucPhatTrien,
  LoaiDanhGia,
} from "../features/hocSinh/hocSinhTypes";
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
  XepLopVaLapPhieuResult,
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
  du_kien: "Chưa học",
  dang_hoc: "Đang học",
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

function startOfMonthIso(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(1);
  return date.toISOString().slice(0, 10);
}

function endOfMonthIso(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
}

function addMonthsIso(iso: string, months: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months, 1);
  return date.toISOString().slice(0, 10);
}

function formatThangNam(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return `Tháng ${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}

// Lưới lịch luôn đủ tuần trọn vẹn (Thứ Hai → Chủ Nhật), có thể lòi ra ngày
// của tháng trước/sau ở đầu/cuối lưới — ô đó vẫn hiện buổi học nếu có, chỉ mờ
// đi để phân biệt với ngày thuộc tháng đang xem.
function buildCalendarWeeks(monthStartIso: string, monthEndIso: string) {
  const start = new Date(`${monthStartIso}T00:00:00Z`);
  const startWeekday = (start.getUTCDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setUTCDate(gridStart.getUTCDate() - startWeekday);

  const end = new Date(`${monthEndIso}T00:00:00Z`);
  const endWeekday = (end.getUTCDay() + 6) % 7;
  const gridEnd = new Date(end);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - endWeekday));

  const weeks: string[][] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week: string[] = [];

    for (let i = 0; i < 7; i += 1) {
      week.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
}

type TabId =
  | "thong-tin"
  | "giao-vien"
  | "hoc-sinh"
  | "lich-hoc"
  | "buoi-hoc"
  | "trao-doi";

export function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const classId = Number(id);

  const [activeTab, setActiveTab] = useState<TabId>("thong-tin");
  const [detail, setDetail] = useState<LopHocDetail | null>(null);
  const [programs, setPrograms] = useState<ChuongTrinhItem[]>([]);
  const [teachers, setTeachers] = useState<GiaoVienItem[]>([]);
  const [students, setStudents] = useState<HocSinhItem[]>([]);
  const [otherClasses, setOtherClasses] = useState<LopHocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [xepLopResult, setXepLopResult] = useState<XepLopVaLapPhieuResult | null>(null);
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
    ghiChu: "",
    kemPhieuNhapHoc: false,
  });
  const [savingEnroll, setSavingEnroll] = useState(false);

  const [batchDanhGiaMeta, setBatchDanhGiaMeta] = useState({
    loaiDanhGia: "" as LoaiDanhGia | "",
    linhVucPhatTrien: "" as LinhVucPhatTrien | "",
    ngayDanhGia: todayIso(),
  });
  const [batchDanhGiaRows, setBatchDanhGiaRows] = useState<
    Record<number, { diemSo: string; xepLoai: string; nhanXet: string }>
  >({});
  const [savingBatchDanhGia, setSavingBatchDanhGia] = useState(false);

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
  const [expandedSinhRowId, setExpandedSinhRowId] = useState<number | null>(
    null,
  );
  const [showCreateLichHocForm, setShowCreateLichHocForm] = useState(false);
  const [buoiHocViewMode, setBuoiHocViewMode] = useState<"list" | "calendar">(
    "list",
  );

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
      permissions.includes("lop_hoc.quan_ly") ||
      permissions.includes("hoc_tap.ghi_nhan")
    );
  }, [auth]);

  const canGhiNhanHocTap = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") || permissions.includes("hoc_tap.ghi_nhan")
    );
  }, [auth]);

  const buoiHocByDate = useMemo(() => {
    const map = new Map<string, BuoiHocItem[]>();

    for (const item of buoiHocList) {
      const list = map.get(item.ngayHoc) ?? [];
      list.push(item);
      map.set(item.ngayHoc, list);
    }

    return map;
  }, [buoiHocList]);

  function handleSwitchToCalendar() {
    const monthStart = startOfMonthIso(buoiHocRange.tuNgay || todayIso());
    setBuoiHocRange({
      tuNgay: monthStart,
      denNgay: endOfMonthIso(monthStart),
    });
    setBuoiHocViewMode("calendar");
  }

  function handleGoToMonth(deltaMonths: number) {
    const monthStart = addMonthsIso(
      startOfMonthIso(buoiHocRange.tuNgay),
      deltaMonths,
    );
    setBuoiHocRange({
      tuNgay: monthStart,
      denNgay: endOfMonthIso(monthStart),
    });
  }

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
      const hocSinhId = Number(enrollForm.hocSinhId);
      const result = await xepHocSinhVaoLopApi(classId, {
        hocSinhId,
        ngayVaoLop: enrollForm.ngayVaoLop,
        ghiChuPhieu: enrollForm.ghiChu.trim() || undefined,
        kemPhieuNhapHoc: enrollForm.kemPhieuNhapHoc,
        ngayNhapHoc: enrollForm.ngayVaoLop,
      });
      setXepLopResult(result);
      setEnrollForm({ hocSinhId: "", ngayVaoLop: "", ghiChu: "", kemPhieuNhapHoc: false });
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

  function setBatchDanhGiaRow(
    enrollmentId: number,
    patch: Partial<{ diemSo: string; xepLoai: string; nhanXet: string }>,
  ) {
    setBatchDanhGiaRows((current) => {
      const base = current[enrollmentId] ?? {
        diemSo: "",
        xepLoai: "",
        nhanXet: "",
      };

      return {
        ...current,
        [enrollmentId]: { ...base, ...patch },
      };
    });
  }

  // Ghi kết quả cho cả lớp trong 1 lượt lưu — giáo viên chấm theo lớp (VD sau
  // 1 kỳ thi), không đi từng hồ sơ học sinh như màn hình gốc ở
  // StudentDetailPage. Tái dùng nguyên API `addDanhGiaApi` (1 lệnh gọi/học
  // sinh có nhập điểm/xếp loại/nhận xét), không cần endpoint hàng loạt riêng.
  async function handleSaveBatchDanhGia(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!detail) return;

    if (!batchDanhGiaMeta.loaiDanhGia) {
      setError("Vui lòng chọn loại đánh giá.");
      return;
    }

    const rowsToSave = detail.hocSinh
      .map((item) => ({
        item,
        row: batchDanhGiaRows[item.enrollmentId],
      }))
      .filter(
        ({ row }) =>
          row && (row.diemSo.trim() || row.xepLoai.trim() || row.nhanXet.trim()),
      );

    if (rowsToSave.length === 0) {
      setError("Chưa nhập điểm/xếp loại/nhận xét cho học sinh nào.");
      return;
    }

    setError("");
    setNotice("");
    setSavingBatchDanhGia(true);

    try {
      await Promise.all(
        rowsToSave.map(({ item, row }) =>
          addDanhGiaApi(item.hocSinh.id, {
            enrollmentId: String(item.enrollmentId),
            loaiDanhGia: batchDanhGiaMeta.loaiDanhGia,
            linhVucPhatTrien: batchDanhGiaMeta.linhVucPhatTrien,
            diemSo: row!.diemSo.trim() ? Number(row!.diemSo) : null,
            xepLoai: row!.xepLoai,
            nhanXet: row!.nhanXet,
            ngayDanhGia: batchDanhGiaMeta.ngayDanhGia,
          }),
        ),
      );

      setNotice(`Đã ghi kết quả học tập cho ${rowsToSave.length} học sinh.`);
      setBatchDanhGiaRows({});
    } catch (batchError) {
      setError(
        batchError instanceof Error
          ? batchError.message
          : "Không thể ghi kết quả học tập.",
      );
    } finally {
      setSavingBatchDanhGia(false);
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

  // Gộp "tạo quy tắc" + "sinh buổi học" thành 1 thao tác: ngày bắt đầu/kết
  // thúc lấy thẳng từ thông tin lớp (đã nhập lúc tạo lớp) — tab này chỉ hỏi
  // tần suất (thứ/giờ/phòng/GV), trừ khi lớp chưa có ngày kết thúc thì mới
  // cần hỏi thêm "sinh đến ngày" vì không có mốc nào để tự suy ra.
  async function handleCreateLichHocAndSinh(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!infoForm) return;

    setError("");
    setNotice("");

    const ngayApDungTu = infoForm.ngayBatDau;

    if (!ngayApDungTu) {
      setError(
        "Lớp chưa có ngày bắt đầu — sang tab \"Thông tin\" để bổ sung trước.",
      );
      return;
    }

    const ngaySinhDen = infoForm.ngayKetThuc || lichHocForm.ngayApDungDen;

    if (!ngaySinhDen) {
      setError("Vui lòng chọn ngày sinh buổi học đến.");
      return;
    }

    setSavingLichHoc(true);

    try {
      const createdRules = await createLichHocApi(classId, {
        ...lichHocForm,
        ngayApDungTu,
        ngayApDungDen: ngaySinhDen,
      });

      let tongBuoiTao = 0;
      for (const rule of createdRules) {
        const result = await sinhBuoiHocApi(rule.id, ngaySinhDen);
        tongBuoiTao += result.created;
      }

      setNotice(
        `Đã tạo ${createdRules.length} quy tắc và sinh ${tongBuoiTao} buổi học.`,
      );
      setLichHocForm(initialLichHocForm);
      setShowCreateLichHocForm(false);
      const rows = await listLichHocApi(classId);
      setLichHocList(rows);
      await loadBuoiHoc();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Không thể tạo lịch học.",
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

      <TabBar
        tabs={[
          { id: "thong-tin", label: "Thông tin" },
          { id: "giao-vien", label: "Giáo viên", badge: detail.giaoVien.length },
          { id: "hoc-sinh", label: "Học sinh", badge: detail.hocSinh.length },
          { id: "lich-hoc", label: "Lịch học", badge: lichHocList.length },
          { id: "buoi-hoc", label: "Buổi học", badge: buoiHocList.length },
          { id: "trao-doi", label: "Trao đổi", badge: traoDoiItems.length },
        ]}
        activeId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {activeTab === "thong-tin" ? (
      <>
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
      </>
      ) : null}

      {activeTab === "giao-vien" ? (
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
      ) : null}

      {activeTab === "hoc-sinh" ? (
      <>
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

        {canManage && !xepLopResult ? (
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
              onChange={(value) => {
                const student = students.find((item) => String(item.id) === value);
                setEnrollForm({
                  ...enrollForm,
                  hocSinhId: value,
                  kemPhieuNhapHoc: student?.trangThai === "tiep_nhan",
                });
              }}
            />

            <DateField
              label="Ngày vào lớp"
              value={enrollForm.ngayVaoLop}
              required
              onChange={(value) =>
                setEnrollForm({ ...enrollForm, ngayVaoLop: value })
              }
            />

            <TextField
              label="Ghi chú"
              value={enrollForm.ghiChu}
              onChange={(value) => setEnrollForm({ ...enrollForm, ghiChu: value })}
            />

            <label className="checkbox-inline field-span-full">
              <input
                type="checkbox"
                checked={enrollForm.kemPhieuNhapHoc}
                onChange={(event) =>
                  setEnrollForm({ ...enrollForm, kemPhieuNhapHoc: event.target.checked })
                }
              />
              Kèm phiếu xác nhận nhập học
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={savingEnroll}
            >
              {savingEnroll ? "Đang lưu..." : "Xếp vào lớp"}
            </button>
          </form>
        ) : null}

        {xepLopResult ? (
          <div className="user-create-form">
            <p className="form-success">
              Đã xếp học sinh vào lớp — phiếu {xepLopResult.phieuXepLop.soPhieu}
              {xepLopResult.phieuNhapHoc
                ? ` · phiếu nhập học ${xepLopResult.phieuNhapHoc.soPhieu}`
                : ""}
              .
            </p>

            <div className="row-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  window.open(`/classes/phieu-xep-lop/${xepLopResult.phieuXepLop.id}?in=1`, "_blank")
                }
              >
                In phiếu xếp lớp
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  window.open(`/classes/phieu-xep-lop/${xepLopResult.phieuXepLop.id}`, "_blank")
                }
              >
                Xem trước
              </button>

              {xepLopResult.phieuNhapHoc ? (
                <>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      window.open(
                        `/students/phieu-nhap-hoc/${xepLopResult.phieuNhapHoc!.id}?in=1`,
                        "_blank",
                      )
                    }
                  >
                    In phiếu nhập học
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      window.open(
                        `/students/phieu-nhap-hoc/${xepLopResult.phieuNhapHoc!.id}`,
                        "_blank",
                      )
                    }
                  >
                    Xem trước
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className="text-button"
                onClick={() => setXepLopResult(null)}
              >
                Xếp học sinh khác
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {canGhiNhanHocTap ? (
        <SectionCard
          title="Ghi kết quả học tập cho lớp"
          subtitle="Chọn loại đánh giá và ngày chung, rồi nhập điểm/xếp loại/nhận xét cho từng học sinh — bấm Lưu tất cả 1 lần. Bỏ trống dòng nào thì dòng đó không được lưu."
        >
          <form
            className="user-create-form"
            onSubmit={handleSaveBatchDanhGia}
          >
            <SelectField
              label="Loại đánh giá"
              value={batchDanhGiaMeta.loaiDanhGia}
              required
              placeholder="Chọn loại đánh giá"
              options={[
                { value: "giua_ky", label: "Giữa kỳ" },
                { value: "cuoi_ky", label: "Cuối kỳ" },
                { value: "khac", label: "Khác" },
                { value: "theo_thang", label: "Theo tháng" },
                { value: "theo_quy", label: "Theo quý" },
                { value: "theo_nam", label: "Theo năm" },
              ]}
              onChange={(value) =>
                setBatchDanhGiaMeta({
                  ...batchDanhGiaMeta,
                  loaiDanhGia: value as LoaiDanhGia,
                })
              }
            />

            <SelectField
              label="Lĩnh vực phát triển"
              value={batchDanhGiaMeta.linhVucPhatTrien}
              placeholder="-- Không chọn (không phải mầm non) --"
              options={[
                { value: "the_chat", label: "Thể chất" },
                { value: "nhan_thuc", label: "Nhận thức" },
                { value: "ngon_ngu", label: "Ngôn ngữ" },
                { value: "tinh_cam_ky_nang_xa_hoi", label: "Tình cảm - Kỹ năng xã hội" },
                { value: "tham_my", label: "Thẩm mỹ" },
              ]}
              onChange={(value) =>
                setBatchDanhGiaMeta({
                  ...batchDanhGiaMeta,
                  linhVucPhatTrien: value as LinhVucPhatTrien,
                })
              }
            />

            <DateField
              label="Ngày đánh giá"
              value={batchDanhGiaMeta.ngayDanhGia}
              required
              onChange={(value) =>
                setBatchDanhGiaMeta({
                  ...batchDanhGiaMeta,
                  ngayDanhGia: value,
                })
              }
            />

            <div className="user-table-wrap field-span-full">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Điểm số</th>
                    <th>Xếp loại</th>
                    <th>Nhận xét</th>
                  </tr>
                </thead>

                <tbody>
                  {detail.hocSinh.map((item) => {
                    const row = batchDanhGiaRows[item.enrollmentId] ?? {
                      diemSo: "",
                      xepLoai: "",
                      nhanXet: "",
                    };

                    return (
                      <tr key={item.enrollmentId}>
                        <td>
                          <strong>{item.hocSinh.hoTen}</strong>
                          <small>{item.hocSinh.maHocSinh}</small>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            className="form-control form-control--number"
                            value={row.diemSo}
                            onChange={(event) =>
                              setBatchDanhGiaRow(item.enrollmentId, {
                                diemSo: event.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="VD: Giỏi"
                            value={row.xepLoai}
                            onChange={(event) =>
                              setBatchDanhGiaRow(item.enrollmentId, {
                                xepLoai: event.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={row.nhanXet}
                            onChange={(event) =>
                              setBatchDanhGiaRow(item.enrollmentId, {
                                nhanXet: event.target.value,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {detail.hocSinh.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-cell">
                        Chưa có học sinh trong lớp.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={savingBatchDanhGia || detail.hocSinh.length === 0}
            >
              {savingBatchDanhGia ? "Đang lưu..." : "Lưu tất cả"}
            </button>
          </form>
        </SectionCard>
      ) : null}
      </>
      ) : null}

      {activeTab === "trao-doi" ? (
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
      ) : null}

      {activeTab === "lich-hoc" ? (
      <>
      <SectionCard
        title="Các khung giờ học đã tạo"
        subtitle={`${lichHocList.length} khung giờ đang áp dụng cho lớp này (${
          infoForm.ngayBatDau || "chưa có ngày bắt đầu"
        } → ${infoForm.ngayKetThuc || "chưa có ngày kết thúc"}) — mỗi dòng là 1 khung giờ lặp lại hàng tuần, buổi học cụ thể đã được sinh sẵn.`}
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
                          {expandedSinhRowId === item.id ? (
                            <>
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
                                  : "Xác nhận"}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => setExpandedSinhRowId(item.id)}
                            >
                              Sinh thêm buổi học
                            </button>
                          )}

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

      </SectionCard>

      {canManage ? (
        <SectionCard
          title="Thêm khung giờ học mới"
          subtitle="Dùng khi lớp cần thêm 1 khung giờ khác với các khung ở trên (ví dụ thêm buổi phụ đạo) — không cần dùng nếu lớp đã đủ lịch."
          actions={
            <button
              type="button"
              className="text-button"
              onClick={() => setShowCreateLichHocForm((current) => !current)}
            >
              {showCreateLichHocForm ? "Đóng" : "Thêm khung giờ"}
            </button>
          }
        >
          {!showCreateLichHocForm ? null : !infoForm.ngayBatDau ? (
            <p className="info-note">
              Lớp chưa có ngày bắt đầu — sang tab "Thông tin" để bổ sung
              trước khi tạo lịch học.
            </p>
          ) : (
            <form
              className="user-create-form"
              onSubmit={handleCreateLichHocAndSinh}
            >
              <div className="form-field">
                <span className="form-field__label">
                  Thứ trong tuần
                  <b aria-hidden="true"> *</b>
                </span>

                <div className="day-toggle-group">
                  {Object.entries(THU_TRONG_TUAN_LABEL).map(
                    ([value, label]) => {
                      const active = lichHocForm.thuTrongTuanList.includes(
                        Number(value),
                      );

                      return (
                        <button
                          key={value}
                          type="button"
                          className={`day-toggle${
                            active ? " day-toggle--active" : ""
                          }`}
                          onClick={() => toggleThu(Number(value))}
                        >
                          {label.replace("Thứ ", "T.")}
                        </button>
                      );
                    },
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

              <p className="info-note">
                Áp dụng từ {infoForm.ngayBatDau}
                {infoForm.ngayKetThuc
                  ? ` đến ${infoForm.ngayKetThuc} (theo thông tin lớp).`
                  : " — lớp chưa có ngày kết thúc, chọn ngày sinh buổi học bên dưới."}
              </p>

              {!infoForm.ngayKetThuc ? (
                <DateField
                  label="Sinh buổi học đến ngày"
                  value={lichHocForm.ngayApDungDen}
                  required
                  onChange={(value) =>
                    setLichHocForm({ ...lichHocForm, ngayApDungDen: value })
                  }
                />
              ) : null}

              <button
                type="submit"
                className="primary-button"
                disabled={savingLichHoc}
              >
                {savingLichHoc ? "Đang tạo..." : "Tạo lịch & sinh buổi học"}
              </button>
            </form>
          )}
        </SectionCard>
      ) : null}
      </>
      ) : null}

      {activeTab === "buoi-hoc" ? (
      <SectionCard
        title="Buổi học"
        subtitle={
          loadingBuoiHoc
            ? "Đang tải..."
            : buoiHocViewMode === "calendar"
              ? `${buoiHocList.length} buổi trong ${formatThangNam(buoiHocRange.tuNgay)}`
              : `${buoiHocList.length} buổi trong khoảng đã chọn`
        }
        actions={
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle${
                buoiHocViewMode === "list" ? " view-toggle--active" : ""
              }`}
              onClick={() => setBuoiHocViewMode("list")}
            >
              Danh sách
            </button>
            <button
              type="button"
              className={`view-toggle${
                buoiHocViewMode === "calendar" ? " view-toggle--active" : ""
              }`}
              onClick={() => handleSwitchToCalendar()}
            >
              Lịch
            </button>
          </div>
        }
      >
        {buoiHocViewMode === "list" ? (
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
        ) : (
          <div className="calendar-toolbar">
            <button
              type="button"
              className="text-button"
              onClick={() => handleGoToMonth(-1)}
            >
              ← Tháng trước
            </button>

            <strong>{formatThangNam(buoiHocRange.tuNgay)}</strong>

            <button
              type="button"
              className="text-button"
              onClick={() => handleGoToMonth(1)}
            >
              Tháng sau →
            </button>
          </div>
        )}

        {buoiHocViewMode === "calendar" ? (
          <div className="calendar-grid">
            <div className="calendar-grid__weekday-row">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => (
                <div key={label} className="calendar-grid__weekday">
                  {label}
                </div>
              ))}
            </div>

            {buildCalendarWeeks(
              buoiHocRange.tuNgay,
              buoiHocRange.denNgay,
            ).map((week, weekIndex) => (
              <div className="calendar-grid__week" key={weekIndex}>
                {week.map((dateIso) => {
                  const inMonth =
                    dateIso >= buoiHocRange.tuNgay &&
                    dateIso <= buoiHocRange.denNgay;
                  const sessions = buoiHocByDate.get(dateIso) ?? [];

                  return (
                    <div
                      key={dateIso}
                      className={`calendar-grid__cell${
                        inMonth ? "" : " calendar-grid__cell--outside"
                      }${
                        dateIso === todayIso()
                          ? " calendar-grid__cell--today"
                          : ""
                      }`}
                    >
                      <span className="calendar-grid__date">
                        {Number(dateIso.slice(8, 10))}
                      </span>

                      <div className="calendar-grid__sessions">
                        {sessions.map((item) => {
                          const clickable =
                            canXemDiemDanh &&
                            item.trangThai !== "nghi" &&
                            item.trangThai !== "huy";

                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`calendar-session calendar-session--${item.trangThai}`}
                              disabled={!clickable}
                              title={`${item.gioBatDau.slice(0, 5)}-${item.gioKetThuc.slice(0, 5)} · ${
                                item.phongHoc || "—"
                              }${item.loaiBuoi === "bu" ? " · Học bù" : ""}`}
                              onClick={() =>
                                clickable &&
                                navigate(`/attendance?buoiHocId=${item.id}`)
                              }
                            >
                              {item.gioBatDau.slice(0, 5)}
                              {item.loaiBuoi === "bu" ? " •" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
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
                  <td>
                    <span
                      className={`status-badge status-badge--${item.trangThai}`}
                    >
                      {TRANG_THAI_BUOI_HOC_LABEL[item.trangThai]}
                    </span>
                  </td>
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
        )}

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
      ) : null}
    </div>
  );
}
