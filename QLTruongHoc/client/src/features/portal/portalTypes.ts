import type { GuardianLinkItem, HocSinhItem } from "../hocSinh/hocSinhTypes";
import type { ThoiKhoaBieuItem } from "../lichHoc/lichHocTypes";

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
  scores: {
    available: boolean;
    title: string;
    detail: string;
  };
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
