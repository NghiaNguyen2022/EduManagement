import type {
  ReactNode,
} from "react";

export type LoaiHinhDaoTao =
  | "mam_non"
  | "ngoai_ngu"
  | "tin_hoc"
  | "khac";

export type AppRouteDefinition = {
  id: string;
  path: string;
  label: string;
  group: string;
  permissions?: string[];
  /**
   * Loại hình đào tạo được phép thấy mục menu này. Không khai báo (undefined)
   * nghĩa là dùng chung cho mọi loại hình, kể cả đơn vị hệ thống gốc.
   */
  loaiHinhDaoTao?: LoaiHinhDaoTao[];
  element?: ReactNode;
};

export const appRoutes: AppRouteDefinition[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Bảng điều hành",
    group: "Tổng quan",
  },
  {
    id: "admissions",
    path: "/admissions",
    label: "Tuyển sinh",
    group: "Tuyển sinh",
    permissions: [
      "tuyen_sinh.xem",
      "tuyen_sinh.quan_ly",
    ],
  },
  {
    id: "students",
    path: "/students",
    label: "Học sinh · Học viên",
    group: "Đào tạo",
    permissions: [
      "hoc_sinh.xem",
      "hoc_sinh.quan_ly",
    ],
  },
  {
    id: "teachers",
    path: "/teachers",
    label: "Giáo viên",
    group: "Đào tạo",
    permissions: [
      "lop_hoc.xem",
      "lop_hoc.quan_ly",
    ],
  },
  {
    id: "classes",
    path: "/classes",
    label: "Lớp học",
    group: "Đào tạo",
    permissions: [
      "lop_hoc.xem",
      "lop_hoc.quan_ly",
    ],
  },
  {
    id: "schedule",
    path: "/schedule",
    label: "Lịch học",
    group: "Đào tạo",
    permissions: [
      "lop_hoc.xem",
      "lop_hoc.quan_ly",
    ],
  },
  {
    id: "attendance",
    path: "/attendance",
    label: "Điểm danh",
    group: "Đào tạo",
    permissions: [
      "diem_danh.xem",
      "diem_danh.thuc_hien",
    ],
  },
  {
    id: "finance",
    path: "/finance",
    label: "Học phí · Công nợ",
    group: "Tài chính",
    permissions: [
      "tai_chinh.xem",
      "tai_chinh.quan_ly",
    ],
  },
  {
    id: "organizations",
    path: "/organizations",
    label: "Cây đơn vị",
    group: "Hệ thống",
    permissions: [
      "don_vi.xem",
      "don_vi.quan_ly",
      "he_thong.quan_tri",
    ],
  },
  {
    id: "users",
    path: "/users",
    label: "Quản lý người dùng",
    group: "Hệ thống",
    permissions: [
      "nguoi_dung.xem",
      "nguoi_dung.quan_ly",
    ],
  },
  {
    id: "roles",
    path: "/roles",
    label: "Vai trò · Phân quyền",
    group: "Hệ thống",
    permissions: [
      "phan_quyen.xem",
      "phan_quyen.quan_ly",
    ],
  },
  {
    id: "audit-logs",
    path: "/audit-logs",
    label: "Nhật ký hệ thống",
    group: "Hệ thống",
    permissions: [
      "phan_quyen.xem",
      "phan_quyen.quan_ly",
    ],
  },
  {
    id: "settings",
    path: "/settings",
    label: "Cấu hình hệ thống",
    group: "Hệ thống",
    permissions: [
      "he_thong.quan_tri",
      "don_vi.quan_ly",
    ],
  },
];

export function findRouteByPath(
  pathname: string,
) {
  return (
    appRoutes.find(
      (route) =>
        pathname === route.path ||
        pathname.startsWith(
          `${route.path}/`,
        ),
    ) ?? appRoutes[0]
  );
}
