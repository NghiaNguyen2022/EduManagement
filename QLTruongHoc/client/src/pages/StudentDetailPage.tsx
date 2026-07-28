import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateField,
  FileUploadField,
  NumberInput,
  SelectField,
  TextAreaField,
  TextField,
} from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { TabBar } from "../components/shared/TabBar";
import { useAuth } from "../features/auth/AuthContext";
import {
  addDanhGiaApi,
  addGuardianApi,
  addThanhTichApi,
  createGuardianAccountApi,
  CrossOrgGuardianConfirmError,
  getHocSinhDetailApi,
  listDanhGiaApi,
  listThanhTichApi,
  removeDanhGiaApi,
  removeGuardianApi,
  removeThanhTichApi,
  setHocSinhTrangThaiApi,
  updateGuardianApi,
  updateHocSinhApi,
} from "../features/hocSinh/hocSinhApi";
import type { CrossOrgGuardianInfo } from "../features/hocSinh/hocSinhApi";
import type {
  DanhGiaFormInput,
  DanhGiaItem,
  GuardianFormInput,
  GuardianLinkItem,
  HocSinhDetail,
  HocSinhFormInput,
  LoaiDanhGia,
  ThanhTichFormInput,
  ThanhTichItem,
  TrangThaiHocSinh,
} from "../features/hocSinh/hocSinhTypes";

const TRANG_THAI_ENROLLMENT_LABEL: Record<string, string> = {
  dang_hoc: "Đang học",
  bao_luu: "Bảo lưu",
  chuyen_lop: "Đã chuyển lớp",
  ngung_hoc: "Ngừng học",
  hoan_thanh: "Hoàn thành",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const TRANG_THAI_LABEL: Record<string, string> = {
  tiep_nhan: "Tiếp nhận",
  dang_hoc: "Đang học",
  bao_luu: "Bảo lưu",
  ngung_hoc: "Ngừng học",
  hoan_thanh: "Hoàn thành",
};

const MOI_QUAN_HE_LABEL: Record<string, string> = {
  cha: "Cha",
  me: "Mẹ",
  ong: "Ông",
  ba: "Bà",
  nguoi_giam_ho: "Người giám hộ",
  khac: "Khác",
};

const emptyGuardianForm: GuardianFormInput = {
  dienThoai: "",
  hoTen: "",
  ngaySinh: "",
  gioiTinh: "",
  email: "",
  ngheNghiep: "",
  diaChi: "",
  moiQuanHe: "",
  laLienHeChinh: false,
  duocDonTre: true,
  nhanThongBao: true,
  nhanThongTinHocPhi: true,
};

const emptyThanhTichForm: ThanhTichFormInput = {
  tenThanhTich: "",
  ketQua: "",
  ngayDat: "",
  noiCap: "",
  tepMinhChungUrl: null,
  ghiChu: "",
};

const emptyDanhGiaForm: DanhGiaFormInput = {
  enrollmentId: "",
  loaiDanhGia: "",
  diemSo: null,
  xepLoai: "",
  nhanXet: "",
  ngayDanhGia: todayIso(),
};

const LOAI_DANH_GIA_LABEL: Record<LoaiDanhGia, string> = {
  giua_ky: "Giữa kỳ",
  cuoi_ky: "Cuối kỳ",
  khac: "Khác",
};

type TabId = "thong-tin" | "phu-huynh" | "lich-su" | "thanh-tich";

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const studentId = Number(id);

  const [activeTab, setActiveTab] = useState<TabId>("thong-tin");
  const [detail, setDetail] = useState<HocSinhDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [infoForm, setInfoForm] = useState<HocSinhFormInput | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState({
    trangThai: "" as TrangThaiHocSinh | "",
    lyDo: "",
    ngayHieuLuc: todayIso(),
  });
  const [guardianForm, setGuardianForm] = useState<GuardianFormInput>(emptyGuardianForm);
  const [savingGuardian, setSavingGuardian] = useState(false);
  const [pendingCrossOrgGuardian, setPendingCrossOrgGuardian] =
    useState<CrossOrgGuardianInfo | null>(null);
  const [confirmCrossOrgBusy, setConfirmCrossOrgBusy] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<GuardianLinkItem | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [creatingAccountLinkId, setCreatingAccountLinkId] = useState<number | null>(null);

  const [thanhTichList, setThanhTichList] = useState<ThanhTichItem[]>([]);
  const [thanhTichForm, setThanhTichForm] = useState<ThanhTichFormInput>(emptyThanhTichForm);
  const [savingThanhTich, setSavingThanhTich] = useState(false);
  const [removingThanhTichId, setRemovingThanhTichId] = useState<number | null>(null);

  const [danhGiaList, setDanhGiaList] = useState<DanhGiaItem[]>([]);
  const [danhGiaForm, setDanhGiaForm] = useState<DanhGiaFormInput>(emptyDanhGiaForm);
  const [savingDanhGia, setSavingDanhGia] = useState(false);
  const [removingDanhGiaId, setRemovingDanhGiaId] = useState<number | null>(null);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return permissions.includes("he_thong.quan_tri") || permissions.includes("hoc_sinh.quan_ly");
  }, [auth]);

  const canGhiNhanHocTap = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") || permissions.includes("hoc_tap.ghi_nhan")
    );
  }, [auth]);

  const timelineEvents = useMemo(() => {
    if (!detail) return [];

    const events: {
      key: string;
      date: string;
      title: string;
      detail?: string;
      kind: "enroll" | "leave" | "status";
    }[] = [];

    for (const item of detail.lopHoc) {
      events.push({
        key: `enroll-${item.enrollmentId}`,
        date: item.ngayVaoLop,
        title: `Vào lớp ${item.lopHoc.tenLop}`,
        detail: item.lopHoc.maLop,
        kind: "enroll",
      });

      if (item.ngayRoiLop) {
        events.push({
          key: `leave-${item.enrollmentId}`,
          date: item.ngayRoiLop,
          title: `Rời lớp ${item.lopHoc.tenLop}`,
          detail: TRANG_THAI_ENROLLMENT_LABEL[item.trangThai],
          kind: "leave",
        });
      }
    }

    for (const item of detail.lichSuTrangThai) {
      events.push({
        key: `status-${item.id}`,
        date: item.ngayHieuLuc,
        title: `Đổi trạng thái: ${
          item.trangThaiCu ? TRANG_THAI_LABEL[item.trangThaiCu] : "Tạo mới"
        } → ${TRANG_THAI_LABEL[item.trangThaiMoi]}`,
        detail: item.lyDo || undefined,
        kind: "status",
      });
    }

    return events.sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
    );
  }, [detail]);

  const canCreateGuardianAccount = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_sinh.quan_ly") ||
      permissions.includes("tuyen_sinh.quan_ly")
    );
  }, [auth]);

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const data = await getHocSinhDetailApi(studentId);
      setDetail(data);
      setStatusForm({
        trangThai: data.hocSinh.trangThai,
        lyDo: "",
        ngayHieuLuc: todayIso(),
      });
      setInfoForm({
        hoTen: data.hocSinh.hoTen,
        tenThuongGoi: data.hocSinh.tenThuongGoi ?? "",
        hinhAnhUrl: data.hocSinh.hinhAnhUrl,
        ngaySinh: data.hocSinh.ngaySinh ?? "",
        gioiTinh: data.hocSinh.gioiTinh ?? "",
        soDinhDanh: data.hocSinh.soDinhDanh ?? "",
        noiSinh: data.hocSinh.noiSinh ?? "",
        danToc: data.hocSinh.danToc ?? "",
        quocTich: data.hocSinh.quocTich ?? "",
        diaChi: data.hocSinh.diaChi ?? "",
        truongLopTruocDo: data.hocSinh.truongLopTruocDo ?? "",
        ngayNhapHoc: data.hocSinh.ngayNhapHoc ?? "",
        dienChinhSach: data.hocSinh.dienChinhSach ?? "",
        chieuCaoCm: data.hocSinh.chieuCaoCm ? Number(data.hocSinh.chieuCaoCm) : null,
        canNangKg: data.hocSinh.canNangKg ? Number(data.hocSinh.canNangKg) : null,
        diUngBenhNen: data.hocSinh.diUngBenhNen ?? "",
        lienHeKhanCapHoTen: data.hocSinh.lienHeKhanCapHoTen ?? "",
        lienHeKhanCapSdt: data.hocSinh.lienHeKhanCapSdt ?? "",
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải học sinh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isInteger(studentId) && studentId > 0) {
      void loadDetail();
    }
  }, [studentId, auth?.currentOrganization?.id]);

  async function loadThanhTichVaDanhGia() {
    try {
      const [thanhTichRows, danhGiaRows] = await Promise.all([
        listThanhTichApi(studentId),
        listDanhGiaApi(studentId),
      ]);
      setThanhTichList(thanhTichRows);
      setDanhGiaList(danhGiaRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải thành tích/kết quả học tập.",
      );
    }
  }

  useEffect(() => {
    if (Number.isInteger(studentId) && studentId > 0) {
      void loadThanhTichVaDanhGia();
    }
  }, [studentId, auth?.currentOrganization?.id]);

  async function handleSaveInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!infoForm) return;

    setError("");
    setNotice("");
    setSavingInfo(true);

    try {
      await updateHocSinhApi(studentId, infoForm);
      setNotice("Đã cập nhật hồ sơ học sinh.");
      await loadDetail();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể cập nhật.");
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleChangeStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!statusForm.trangThai) return;

    setError("");
    setNotice("");
    setSavingStatus(true);

    try {
      await setHocSinhTrangThaiApi(studentId, {
        trangThai: statusForm.trangThai,
        lyDo: statusForm.lyDo || undefined,
        ngayHieuLuc: statusForm.ngayHieuLuc || undefined,
      });
      setNotice(`Đã đổi trạng thái sang ${TRANG_THAI_LABEL[statusForm.trangThai]}.`);
      await loadDetail();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Không thể đổi trạng thái.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function submitAddGuardian(confirmCrossOrgReuse: boolean) {
    setError("");
    setNotice("");

    try {
      const result = await addGuardianApi(studentId, {
        ...guardianForm,
        confirmCrossOrgReuse,
      });
      setNotice(`Đã thêm phụ huynh ${result.guardian.hoTen} (${result.guardian.maPhuHuynh}).`);
      setGuardianForm(emptyGuardianForm);
      setPendingCrossOrgGuardian(null);
      await loadDetail();
    } catch (guardianError) {
      if (guardianError instanceof CrossOrgGuardianConfirmError) {
        setPendingCrossOrgGuardian(guardianError.guardianInfo);
        return;
      }

      setError(
        guardianError instanceof Error ? guardianError.message : "Không thể thêm phụ huynh.",
      );
    }
  }

  async function handleAddGuardian(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingGuardian(true);

    try {
      await submitAddGuardian(false);
    } finally {
      setSavingGuardian(false);
    }
  }

  async function executeConfirmCrossOrgGuardian() {
    setConfirmCrossOrgBusy(true);

    try {
      await submitAddGuardian(true);
    } finally {
      setConfirmCrossOrgBusy(false);
    }
  }

  async function handleSetPrimary(link: GuardianLinkItem) {
    setError("");
    setNotice("");

    try {
      await updateGuardianApi(studentId, link.lienKetId, {
        moiQuanHe: link.moiQuanHe,
        laLienHeChinh: true,
        duocDonTre: link.duocDonTre,
        nhanThongBao: link.nhanThongBao,
        nhanThongTinHocPhi: link.nhanThongTinHocPhi,
      });
      setNotice(`Đã đặt ${link.phuHuynh.hoTen} làm liên hệ chính.`);
      await loadDetail();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Không thể cập nhật liên hệ chính.",
      );
    }
  }

  async function handleCreateAccount(link: GuardianLinkItem) {
    setCreatingAccountLinkId(link.lienKetId);
    setError("");
    setNotice("");

    try {
      const result = await createGuardianAccountApi(studentId, link.lienKetId);

      if (result.created) {
        setNotice(
          `Đã tạo tài khoản cho ${link.phuHuynh.hoTen}. Tên đăng nhập: ${result.tenDangNhap} · Mật khẩu tạm: ${result.temporaryPassword} (hiển thị một lần duy nhất).`,
        );
      } else {
        setNotice(
          `${link.phuHuynh.hoTen} đã có tài khoản đăng nhập: ${result.tenDangNhap ?? "(không xác định)"}.`,
        );
      }

      await loadDetail();
    } catch (accountError) {
      setError(
        accountError instanceof Error ? accountError.message : "Không thể tạo tài khoản đăng nhập.",
      );
    } finally {
      setCreatingAccountLinkId(null);
    }
  }

  async function executeRemoveGuardian() {
    if (!pendingRemove) return;

    setRemoveBusy(true);
    setError("");
    setNotice("");

    try {
      await removeGuardianApi(studentId, pendingRemove.lienKetId);
      setNotice(`Đã gỡ liên kết với ${pendingRemove.phuHuynh.hoTen}.`);
      setPendingRemove(null);
      await loadDetail();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Không thể gỡ liên kết.");
    } finally {
      setRemoveBusy(false);
    }
  }

  async function handleAddThanhTich(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingThanhTich(true);

    try {
      await addThanhTichApi(studentId, thanhTichForm);
      setNotice("Đã ghi nhận thành tích.");
      setThanhTichForm(emptyThanhTichForm);
      await loadThanhTichVaDanhGia();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Không thể ghi nhận thành tích.");
    } finally {
      setSavingThanhTich(false);
    }
  }

  async function handleRemoveThanhTich(item: ThanhTichItem) {
    setError("");
    setNotice("");
    setRemovingThanhTichId(item.id);

    try {
      await removeThanhTichApi(item.id);
      setNotice(`Đã xoá thành tích "${item.tenThanhTich}".`);
      await loadThanhTichVaDanhGia();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Không thể xoá thành tích.");
    } finally {
      setRemovingThanhTichId(null);
    }
  }

  async function handleAddDanhGia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!danhGiaForm.enrollmentId || !danhGiaForm.loaiDanhGia) return;

    setError("");
    setNotice("");
    setSavingDanhGia(true);

    try {
      await addDanhGiaApi(studentId, danhGiaForm);
      setNotice("Đã ghi nhận kết quả học tập.");
      setDanhGiaForm(emptyDanhGiaForm);
      await loadThanhTichVaDanhGia();
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Không thể ghi nhận kết quả học tập.",
      );
    } finally {
      setSavingDanhGia(false);
    }
  }

  async function handleRemoveDanhGia(item: DanhGiaItem) {
    setError("");
    setNotice("");
    setRemovingDanhGiaId(item.id);

    try {
      await removeDanhGiaApi(item.id);
      setNotice("Đã xoá kết quả học tập.");
      await loadThanhTichVaDanhGia();
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : "Không thể xoá kết quả học tập.",
      );
    } finally {
      setRemovingDanhGiaId(null);
    }
  }

  if (loading || !detail || !infoForm) {
    return (
      <div className="page-stack">
        <PageHeader title="Học sinh" subtitle={error || "Đang tải dữ liệu..."} />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="profile-header">
        {detail.hocSinh.hinhAnhUrl ? (
          <img
            src={detail.hocSinh.hinhAnhUrl}
            alt=""
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar profile-avatar--placeholder">🎒</div>
        )}

        <PageHeader
          title={detail.hocSinh.hoTen}
          subtitle={`Mã học sinh ${detail.hocSinh.maHocSinh}`}
          action={
            <button type="button" className="text-button" onClick={() => navigate("/students")}>
              ← Danh sách học sinh
            </button>
          }
        />
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <TabBar
        tabs={[
          { id: "thong-tin", label: "Thông tin" },
          { id: "phu-huynh", label: "Phụ huynh", badge: detail.phuHuynh.length },
          { id: "lich-su", label: "Lịch sử học tập", badge: timelineEvents.length },
          {
            id: "thanh-tich",
            label: "Thành tích",
            badge: thanhTichList.length + danhGiaList.length,
          },
        ]}
        activeId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {activeTab === "thong-tin" ? (
      <>
      <SectionCard
        title="Trạng thái"
        subtitle={`Hiện tại: ${TRANG_THAI_LABEL[detail.hocSinh.trangThai]}`}
      >
        {canManage ? (
          <form className="user-create-form" onSubmit={handleChangeStatus}>
            <SelectField
              label="Trạng thái mới"
              value={statusForm.trangThai}
              options={Object.entries(TRANG_THAI_LABEL).map(([value, label]) => ({ value, label }))}
              onChange={(value) =>
                setStatusForm({
                  ...statusForm,
                  trangThai: value as TrangThaiHocSinh,
                })
              }
            />

            <DateField
              label="Ngày hiệu lực"
              value={statusForm.ngayHieuLuc}
              onChange={(value) =>
                setStatusForm({
                  ...statusForm,
                  ngayHieuLuc: value,
                })
              }
            />

            <TextField
              label="Lý do (tuỳ chọn)"
              value={statusForm.lyDo}
              onChange={(value) => setStatusForm({ ...statusForm, lyDo: value })}
            />

            <button
              type="submit"
              className="primary-button"
              disabled={
                savingStatus ||
                !statusForm.trangThai ||
                statusForm.trangThai === detail.hocSinh.trangThai
              }
            >
              {savingStatus ? "Đang lưu..." : "Đổi trạng thái"}
            </button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard title="Thông tin học sinh" subtitle="Chỉnh sửa hồ sơ đầy đủ theo chuẩn hồ sơ đào tạo">
        <form className="user-create-form" onSubmit={handleSaveInfo}>
          <h3 className="form-section-title">Ảnh & thông tin cơ bản</h3>

          {canManage ? (
            <FileUploadField
              label="Ảnh chân dung"
              value={infoForm.hinhAnhUrl}
              className="field-span-full"
              onChange={(value) => setInfoForm({ ...infoForm, hinhAnhUrl: value })}
            />
          ) : null}

          <TextField
            label="Họ tên"
            value={infoForm.hoTen}
            required
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, hoTen: value })}
          />

          <TextField
            label="Tên thường gọi"
            value={infoForm.tenThuongGoi}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, tenThuongGoi: value })}
          />

          <DateField
            label="Ngày sinh"
            value={infoForm.ngaySinh}
            required
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, ngaySinh: value })}
          />

          <SelectField
            label="Giới tính"
            value={infoForm.gioiTinh}
            placeholder="Chọn giới tính"
            disabled={!canManage}
            options={[
              { value: "nam", label: "Nam" },
              { value: "nu", label: "Nữ" },
              { value: "khac", label: "Khác" },
            ]}
            onChange={(value) =>
              setInfoForm({
                ...infoForm,
                gioiTinh: value as HocSinhFormInput["gioiTinh"],
              })
            }
          />

          <TextField
            label="Địa chỉ"
            value={infoForm.diaChi}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, diaChi: value })}
          />

          <DateField
            label="Ngày nhập học"
            value={infoForm.ngayNhapHoc}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, ngayNhapHoc: value })}
          />

          <h3 className="form-section-title">Định danh</h3>

          <TextField
            label="Số CCCD / định danh cá nhân"
            helpText="Hoặc số giấy khai sinh nếu chưa có CCCD"
            value={infoForm.soDinhDanh}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, soDinhDanh: value })}
          />

          <TextField
            label="Nơi sinh"
            value={infoForm.noiSinh}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, noiSinh: value })}
          />

          <TextField
            label="Dân tộc"
            value={infoForm.danToc}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, danToc: value })}
          />

          <TextField
            label="Quốc tịch"
            value={infoForm.quocTich}
            placeholder="Việt Nam"
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, quocTich: value })}
          />

          <TextField
            label="Diện chính sách / ưu tiên"
            value={infoForm.dienChinhSach}
            placeholder="VD: Hộ nghèo, dân tộc thiểu số, con thương binh liệt sĩ..."
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, dienChinhSach: value })}
          />

          <TextField
            label="Trường/lớp học trước đó"
            value={infoForm.truongLopTruocDo}
            placeholder="Nếu chuyển đến từ trường/lớp khác"
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, truongLopTruocDo: value })}
          />

          <h3 className="form-section-title">Sức khoẻ &amp; liên hệ khẩn cấp</h3>

          <NumberInput
            label="Chiều cao (cm)"
            value={infoForm.chieuCaoCm}
            allowDecimal
            min={0}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, chieuCaoCm: value })}
          />

          <NumberInput
            label="Cân nặng (kg)"
            value={infoForm.canNangKg}
            allowDecimal
            min={0}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, canNangKg: value })}
          />

          <TextAreaField
            label="Dị ứng / bệnh nền"
            value={infoForm.diUngBenhNen}
            rows={3}
            disabled={!canManage}
            className="field-span-full"
            onChange={(value) => setInfoForm({ ...infoForm, diUngBenhNen: value })}
          />

          <TextField
            label="Họ tên người liên hệ khẩn cấp"
            value={infoForm.lienHeKhanCapHoTen}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, lienHeKhanCapHoTen: value })}
          />

          <TextField
            label="Số điện thoại khẩn cấp"
            type="tel"
            value={infoForm.lienHeKhanCapSdt}
            disabled={!canManage}
            onChange={(value) => setInfoForm({ ...infoForm, lienHeKhanCapSdt: value })}
          />

          {canManage ? (
            <button type="submit" className="primary-button" disabled={savingInfo}>
              {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          ) : null}
        </form>
      </SectionCard>
      </>
      ) : null}

      {activeTab === "phu-huynh" ? (
      <>
      <SectionCard
        title="Phụ huynh · Người giám hộ"
        subtitle={`${detail.phuHuynh.length} người liên kết`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Phụ huynh</th>
                <th>Quan hệ</th>
                <th>Liên hệ chính</th>
                <th>Được đón trẻ</th>
                <th>Tài khoản</th>
                {canManage || canCreateGuardianAccount ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {detail.phuHuynh.map((link) => (
                <tr key={link.lienKetId}>
                  <td>
                    <strong>{link.phuHuynh.hoTen}</strong>
                    <small>
                      {link.phuHuynh.dienThoai} · {link.phuHuynh.maPhuHuynh}
                    </small>
                  </td>

                  <td>{MOI_QUAN_HE_LABEL[link.moiQuanHe]}</td>

                  <td>
                    {link.laLienHeChinh ? (
                      <span className="status-badge status-badge--hoat_dong">Liên hệ chính</span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{link.duocDonTre ? "Có" : "Không"}</td>

                  <td>
                    {link.phuHuynh.nguoiDungId ? (
                      <span className="status-badge status-badge--hoat_dong">Đã có tài khoản</span>
                    ) : (
                      "Chưa có"
                    )}
                  </td>

                  {canManage || canCreateGuardianAccount ? (
                    <td>
                      <div className="row-actions">
                        {canManage && !link.laLienHeChinh ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => void handleSetPrimary(link)}
                          >
                            Đặt liên hệ chính
                          </button>
                        ) : null}

                        {canCreateGuardianAccount && !link.phuHuynh.nguoiDungId ? (
                          <button
                            type="button"
                            className="text-button"
                            disabled={creatingAccountLinkId === link.lienKetId}
                            onClick={() => void handleCreateAccount(link)}
                          >
                            {creatingAccountLinkId === link.lienKetId
                              ? "Đang tạo..."
                              : "Tạo tài khoản đăng nhập"}
                          </button>
                        ) : null}

                        {canManage ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setError("");
                              setPendingRemove(link);
                            }}
                          >
                            Gỡ liên kết
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}

              {detail.phuHuynh.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage || canCreateGuardianAccount ? 6 : 5}
                    className="empty-cell"
                  >
                    Chưa có phụ huynh liên kết.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {canManage ? (
        <SectionCard
          title="Thêm phụ huynh"
          subtitle="Nhập số điện thoại trước — nếu đã có phụ huynh với số này trong hệ thống, hệ thống sẽ tái sử dụng hồ sơ cũ."
        >
          <form className="user-create-form" onSubmit={handleAddGuardian}>
            <TextField
              label="Số điện thoại"
              type="tel"
              value={guardianForm.dienThoai}
              required
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  dienThoai: value,
                })
              }
            />

            <TextField
              label="Họ tên (nếu là phụ huynh mới)"
              value={guardianForm.hoTen}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  hoTen: value,
                })
              }
            />

            <SelectField
              label="Mối quan hệ"
              value={guardianForm.moiQuanHe}
              required
              placeholder="Chọn mối quan hệ"
              options={Object.entries(MOI_QUAN_HE_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  moiQuanHe: value as GuardianFormInput["moiQuanHe"],
                })
              }
            />

            <TextField
              label="Email"
              type="email"
              value={guardianForm.email}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  email: value,
                })
              }
            />

            <TextField
              label="Nghề nghiệp"
              value={guardianForm.ngheNghiep}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  ngheNghiep: value,
                })
              }
            />

            <TextField
              label="Địa chỉ"
              value={guardianForm.diaChi}
              onChange={(value) =>
                setGuardianForm({
                  ...guardianForm,
                  diaChi: value,
                })
              }
            />

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.laLienHeChinh}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    laLienHeChinh: event.target.checked,
                  })
                }
              />
              Đặt làm liên hệ chính
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.duocDonTre}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    duocDonTre: event.target.checked,
                  })
                }
              />
              Được đón trẻ
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.nhanThongBao}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    nhanThongBao: event.target.checked,
                  })
                }
              />
              Nhận thông báo
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={guardianForm.nhanThongTinHocPhi}
                onChange={(event) =>
                  setGuardianForm({
                    ...guardianForm,
                    nhanThongTinHocPhi: event.target.checked,
                  })
                }
              />
              Nhận thông tin học phí
            </label>

            <button type="submit" className="primary-button" disabled={savingGuardian}>
              {savingGuardian ? "Đang lưu..." : "Thêm phụ huynh"}
            </button>
          </form>
        </SectionCard>
      ) : null}
      </>
      ) : null}

      {activeTab === "lich-su" ? (
      <SectionCard
        title="Lịch sử học tập"
        subtitle={`${timelineEvents.length} sự kiện — gộp lớp học và thay đổi trạng thái theo thời gian`}
      >
        {timelineEvents.length === 0 ? (
          <div className="empty-cell">Chưa có lịch sử học tập.</div>
        ) : (
          <ul className="timeline">
            {timelineEvents.map((event) => (
              <li
                key={event.key}
                className={`timeline__item timeline__item--${event.kind}`}
              >
                <span className="timeline__dot" />
                <div className="timeline__content">
                  <div className="timeline__date">{event.date}</div>
                  <div className="timeline__title">{event.title}</div>
                  {event.detail ? (
                    <div className="timeline__detail">{event.detail}</div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      ) : null}

      {activeTab === "thanh-tich" ? (
      <>
      <SectionCard
        title="Chứng chỉ / Thành tích"
        subtitle={`${thanhTichList.length} mục — VD: IELTS 8.0, TOEIC 900, giải thưởng cuộc thi...`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Kết quả</th>
                <th>Ngày đạt</th>
                <th>Nơi cấp</th>
                <th>Minh chứng</th>
                {canGhiNhanHocTap ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {thanhTichList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.tenThanhTich}</strong>
                    {item.ghiChu ? <small>{item.ghiChu}</small> : null}
                  </td>
                  <td>{item.ketQua || "—"}</td>
                  <td>{item.ngayDat || "—"}</td>
                  <td>{item.noiCap || "—"}</td>
                  <td>
                    {item.tepMinhChungUrl ? (
                      <a
                        href={item.tepMinhChungUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-button"
                      >
                        Xem tệp
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  {canGhiNhanHocTap ? (
                    <td>
                      <button
                        type="button"
                        className="text-button"
                        disabled={removingThanhTichId === item.id}
                        onClick={() => void handleRemoveThanhTich(item)}
                      >
                        {removingThanhTichId === item.id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}

              {thanhTichList.length === 0 ? (
                <tr>
                  <td colSpan={canGhiNhanHocTap ? 6 : 5} className="empty-cell">
                    Chưa có chứng chỉ/thành tích nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canGhiNhanHocTap ? (
          <form className="user-create-form" onSubmit={handleAddThanhTich}>
            <TextField
              label="Tên chứng chỉ/thành tích"
              value={thanhTichForm.tenThanhTich}
              required
              placeholder="VD: IELTS, TOEIC, HSK, giải thưởng..."
              onChange={(value) =>
                setThanhTichForm({ ...thanhTichForm, tenThanhTich: value })
              }
            />

            <TextField
              label="Kết quả"
              value={thanhTichForm.ketQua}
              placeholder="VD: 8.0, 900/990, Giải nhất"
              onChange={(value) => setThanhTichForm({ ...thanhTichForm, ketQua: value })}
            />

            <DateField
              label="Ngày đạt"
              value={thanhTichForm.ngayDat}
              onChange={(value) => setThanhTichForm({ ...thanhTichForm, ngayDat: value })}
            />

            <TextField
              label="Nơi cấp"
              value={thanhTichForm.noiCap}
              placeholder="VD: IDP Việt Nam, Nội bộ trung tâm"
              onChange={(value) => setThanhTichForm({ ...thanhTichForm, noiCap: value })}
            />

            <FileUploadField
              label="Minh chứng (ảnh/PDF)"
              value={thanhTichForm.tepMinhChungUrl}
              accept="image/*,application/pdf"
              previewAsImage={false}
              onChange={(value) =>
                setThanhTichForm({ ...thanhTichForm, tepMinhChungUrl: value })
              }
            />

            <TextAreaField
              label="Ghi chú"
              value={thanhTichForm.ghiChu}
              rows={2}
              className="field-span-full"
              onChange={(value) => setThanhTichForm({ ...thanhTichForm, ghiChu: value })}
            />

            <button type="submit" className="primary-button" disabled={savingThanhTich}>
              {savingThanhTich ? "Đang lưu..." : "Ghi nhận thành tích"}
            </button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Kết quả học tập theo lớp"
        subtitle={`${danhGiaList.length} lần đánh giá — giữa kỳ/cuối kỳ theo từng lượt xếp lớp`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Lớp</th>
                <th>Loại đánh giá</th>
                <th>Điểm</th>
                <th>Xếp loại</th>
                <th>Nhận xét</th>
                <th>Ngày</th>
                {canGhiNhanHocTap ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {danhGiaList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.lopHoc.tenLop}</strong>
                    <small>{item.lopHoc.maLop}</small>
                  </td>
                  <td>{LOAI_DANH_GIA_LABEL[item.loaiDanhGia]}</td>
                  <td>{item.diemSo ?? "—"}</td>
                  <td>{item.xepLoai || "—"}</td>
                  <td>{item.nhanXet || "—"}</td>
                  <td>{item.ngayDanhGia}</td>
                  {canGhiNhanHocTap ? (
                    <td>
                      <button
                        type="button"
                        className="text-button"
                        disabled={removingDanhGiaId === item.id}
                        onClick={() => void handleRemoveDanhGia(item)}
                      >
                        {removingDanhGiaId === item.id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}

              {danhGiaList.length === 0 ? (
                <tr>
                  <td colSpan={canGhiNhanHocTap ? 7 : 6} className="empty-cell">
                    Chưa có kết quả học tập nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canGhiNhanHocTap ? (
          <form className="user-create-form" onSubmit={handleAddDanhGia}>
            <SelectField
              label="Lớp"
              value={danhGiaForm.enrollmentId}
              required
              placeholder="Chọn lượt xếp lớp"
              options={detail.lopHoc.map((item) => ({
                value: String(item.enrollmentId),
                label: `${item.lopHoc.tenLop} (${item.lopHoc.maLop}) — ${item.ngayVaoLop}`,
              }))}
              onChange={(value) =>
                setDanhGiaForm({ ...danhGiaForm, enrollmentId: value })
              }
            />

            <SelectField
              label="Loại đánh giá"
              value={danhGiaForm.loaiDanhGia}
              required
              placeholder="Chọn loại đánh giá"
              options={Object.entries(LOAI_DANH_GIA_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) =>
                setDanhGiaForm({
                  ...danhGiaForm,
                  loaiDanhGia: value as DanhGiaFormInput["loaiDanhGia"],
                })
              }
            />

            <NumberInput
              label="Điểm số"
              value={danhGiaForm.diemSo}
              allowDecimal
              min={0}
              onChange={(value) => setDanhGiaForm({ ...danhGiaForm, diemSo: value })}
            />

            <TextField
              label="Xếp loại"
              value={danhGiaForm.xepLoai}
              placeholder="VD: Giỏi, Khá, Đạt"
              onChange={(value) => setDanhGiaForm({ ...danhGiaForm, xepLoai: value })}
            />

            <DateField
              label="Ngày đánh giá"
              value={danhGiaForm.ngayDanhGia}
              required
              onChange={(value) => setDanhGiaForm({ ...danhGiaForm, ngayDanhGia: value })}
            />

            <TextAreaField
              label="Nhận xét"
              value={danhGiaForm.nhanXet}
              rows={2}
              className="field-span-full"
              onChange={(value) => setDanhGiaForm({ ...danhGiaForm, nhanXet: value })}
            />

            <button type="submit" className="primary-button" disabled={savingDanhGia}>
              {savingDanhGia ? "Đang lưu..." : "Ghi nhận kết quả"}
            </button>
          </form>
        ) : null}
      </SectionCard>
      </>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Gỡ liên kết phụ huynh"
        message={`Gỡ liên kết giữa học sinh và ${pendingRemove?.phuHuynh.hoTen ?? ""}?`}
        confirmLabel="Gỡ liên kết"
        danger
        busy={removeBusy}
        error={pendingRemove ? error : ""}
        onConfirm={() => void executeRemoveGuardian()}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingCrossOrgGuardian)}
        title="Phụ huynh đã có ở đơn vị khác"
        message={`Số điện thoại này đã là phụ huynh ${pendingCrossOrgGuardian?.hoTen ?? ""} (${pendingCrossOrgGuardian?.maPhuHuynh ?? ""}) tại đơn vị ${pendingCrossOrgGuardian?.donVi.tenDonVi ?? ""}. Xác nhận đây đúng là cùng một phụ huynh (có con học nhiều đơn vị) để dùng chung hồ sơ?`}
        confirmLabel="Xác nhận dùng chung hồ sơ"
        busy={confirmCrossOrgBusy}
        error={pendingCrossOrgGuardian ? error : ""}
        onConfirm={() => void executeConfirmCrossOrgGuardian()}
        onCancel={() => setPendingCrossOrgGuardian(null)}
      />
    </div>
  );
}
