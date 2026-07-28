import type {
  DanhGiaItem,
  GuardianLinkItem,
  HocSinhItem,
  ThanhTichItem,
} from "../hocSinh/hocSinhTypes";
import type { ThoiKhoaBieuItem } from "../lichHoc/lichHocTypes";
import type { NguoiGuiVaiTro, KenhLienLac } from "../traoDoi/traoDoiTypes";

export type ParentPortalTraoDoi = {
  id: number;
  nguoiGuiVaiTro: NguoiGuiVaiTro;
  kenhLienLac: KenhLienLac;
  noiDung: string;
  ketQua: string | null;
  createdAt: string;
  nguoiTao: { id: number; hoTen: string; tenDangNhap: string };
};

export type ParentPortalKhoanPhaiThu = {
  id: number;
  tongTien: string;
  giamTru: string;
  daThu: string;
  trangThai: "chua_thu" | "thu_mot_phan" | "da_thu_du";
  tenKyThu: string;
};

export type ParentPortalAbsence = {
  id: number;
  ngayHoc: string;
  gioBatDau: string;
  tenLop: string;
  trangThai: "vang_khong_phep" | "vang_co_phep";
};

export type ParentPortalLeaveRequest = {
  id: number;
  lopHocId: number;
  tenLop: string;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  trangThai: "cho_duyet" | "da_duyet" | "tu_choi";
  ghiChuDuyet: string | null;
  createdAt: string;
};

export type ParentPortalChild = {
  lienKet: GuardianLinkItem;
  hocSinh: HocSinhItem & {
    donVi?: {
      id: number;
      maDonVi: string;
      tenDonVi: string;
    };
  };
  donVi: {
    id: number;
    maDonVi: string;
    tenDonVi: string;
  };
  activeClasses: Array<{
    enrollmentId: number;
    ngayVaoLop: string;
    ngayRoiLop: string | null;
    trangThai: string;
    lopHoc: {
      id: number;
      maLop: string;
      tenLop: string;
      phongHoc: string | null;
    };
  }>;
  schedules: ThoiKhoaBieuItem[];
  traoDoi: ParentPortalTraoDoi[];
  khoanPhaiThu: ParentPortalKhoanPhaiThu[];
  absences: ParentPortalAbsence[];
  absenceSummary: { unexcused: number };
  donXinPhep: ParentPortalLeaveRequest[];
  thanhTich: ThanhTichItem[];
  danhGia: DanhGiaItem[];
};

export type ParentPortalUpcomingSession = {
  childName: string;
  childCode: string;
  childOrganization: {
    id: number;
    maDonVi: string;
    tenDonVi: string;
  };
  session: ThoiKhoaBieuItem;
};

/**
 * Một phụ huynh có thể có con học ở nhiều đơn vị khác nhau (nhiều con mỗi con
 * một đơn vị, hoặc cùng một con có hồ sơ ở nhiều đơn vị). Portal hiển thị
 * thông tin chung ở đầu trang (không gắn với một đơn vị cụ thể), rồi nhóm
 * chi tiết quản lý theo từng đơn vị bên trong — mỗi nhóm ứng với đúng một
 * `ParentPortalOrganizationGroup`.
 */
export type ParentPortalOrganizationGroup = {
  donVi: { id: number; maDonVi: string; tenDonVi: string };
  children: ParentPortalChild[];
  upcomingSessions: ParentPortalUpcomingSession[];
};

export type ParentPortalOverview = {
  parent: {
    id: number;
    hoTen: string;
    maPhuHuynh: string;
    dienThoai: string;
    email: string | null;
    ngheNghiep: string | null;
    diaChi: string | null;
  };
  children: ParentPortalChild[];
  upcomingSessions: ParentPortalUpcomingSession[];
  organizations: ParentPortalOrganizationGroup[];
};

export type TeacherPortalOverview = {
  teacher: {
    id: number;
    maGiaoVien: string;
    hoTen: string;
    chuyenMon: string | null;
  };
  classes: Array<{
    assignment: {
      id: number;
      vaiTro: "giao_vien_chinh" | "ho_tro" | "chu_nhiem";
      tuNgay: string;
      denNgay: string | null;
    };
    class: {
      id: number;
      maLop: string;
      tenLop: string;
      trangThai: string;
    };
  }>;
  sessions: import("../lichHoc/lichHocTypes").ThoiKhoaBieuItem[];
  sessionsHomNay: number;
  baoGiangChoNhap: number;
  traoDoiGanDay: number;
};
