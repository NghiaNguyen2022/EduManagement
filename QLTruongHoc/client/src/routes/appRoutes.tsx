import type {
  ReactNode,
} from "react";

export type AppRouteDefinition = {
  id: string;
  path: string;
  label: string;
  icon: string;
  group: string;
  permissions?: string[];
  element?: ReactNode;
};

export const appRoutes: AppRouteDefinition[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Bảng điều hành",
    icon: "⌂",
    group: "Tổng quan",
  },
  {
    id: "admissions",
    path: "/admissions",
    label: "Hồ sơ tuyển sinh",
    icon: "◎",
    group: "Tuyển sinh",
    permissions: [
      "tuyen_sinh.xem",
      "tuyen_sinh.quan_ly",
    ],
  },
  {
    id: "consulting",
    path: "/consulting",
    label: "Tư vấn tuyển sinh",
    icon: "◇",
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
    icon: "◉",
    group: "Đào tạo",
    permissions: [
      "hoc_sinh.xem",
      "hoc_sinh.quan_ly",
    ],
  },
  {
    id: "classes",
    path: "/classes",
    label: "Lớp học",
    icon: "▦",
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
    icon: "◫",
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
    icon: "✓",
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
    icon: "₫",
    group: "Tài chính",
    permissions: [
      "tai_chinh.xem",
      "tai_chinh.quan_ly",
    ],
  },
  {
    id: "users",
    path: "/users",
    label: "Quản lý người dùng",
    icon: "♙",
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
    icon: "⚿",
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
    icon: "≡",
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
    icon: "⚙",
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
