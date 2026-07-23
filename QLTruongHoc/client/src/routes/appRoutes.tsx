import type { ReactNode } from "react";

export type LoaiHinhDaoTao = "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac";

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
  /**
   * Ẩn mục menu này khi đứng ở đơn vị hệ thống (`loaiDonVi = 'he_thong'`) —
   * dùng cho các chức năng chỉ có ý nghĩa tại một trường/trung tâm cụ thể
   * (đơn vị hệ thống không tổ chức lớp/lịch riêng, đã chốt phạm vi ở A01),
   * khác với `loaiHinhDaoTao` (lọc theo loại hình, không phải theo cấp đơn
   * vị). Quản trị hệ thống vẫn bị ẩn như mọi vai trò khác — mục này không có
   * gì để xem ở đó, không phải vấn đề phân quyền.
   */
  hideAtHeThong?: boolean;
  /**
   * Chỉ hiện mục menu này khi đứng ở đơn vị hệ thống — dùng cho các nghiệp vụ
   * quản trị toàn hệ thống (cây đơn vị, vai trò/phân quyền, nhật ký, cấu
   * hình): nên làm hẳn ở trang quản trị, không rải rác theo từng đơn vị con
   * đang đứng. Không áp dụng cho "Quản lý người dùng" — trang đó vẫn cần
   * dùng tại từng đơn vị con để tạo tài khoản nhân sự riêng của đơn vị đó.
   */
  onlyAtHeThong?: boolean;
  element?: ReactNode;
  /**
   * Chức năng chưa hoàn thiện (còn là PlaceholderPage). Hiện trong menu với
   * kiểu chữ gạch dưới để phân biệt, không ẩn đi vì người dùng vẫn cần biết
   * mục này tồn tại trong lộ trình.
   */
  comingSoon?: boolean;
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
    group: "Tổng quan",
    permissions: ["tuyen_sinh.xem", "tuyen_sinh.quan_ly"],
  },
  {
    id: "students",
    path: "/students",
    label: "Học sinh · Học viên",
    group: "Đào tạo",
    permissions: ["hoc_sinh.xem", "hoc_sinh.quan_ly"],
  },
  {
    id: "teachers",
    path: "/teachers",
    label: "Giáo viên",
    group: "Đào tạo",
    permissions: ["lop_hoc.xem", "lop_hoc.quan_ly"],
  },
  {
    id: "classes",
    path: "/classes",
    label: "Lớp học",
    group: "Đào tạo",
    permissions: ["lop_hoc.xem", "lop_hoc.quan_ly"],
  },
  {
    id: "schedule",
    path: "/schedule",
    label: "Lịch học",
    group: "Đào tạo",
    permissions: ["lop_hoc.xem", "lop_hoc.quan_ly"],
    hideAtHeThong: true,
  },
  {
    id: "attendance",
    path: "/attendance",
    label: "Điểm danh",
    group: "Đào tạo",
    permissions: ["diem_danh.xem", "diem_danh.thuc_hien"],
    hideAtHeThong: true,
  },
  {
    id: "finance",
    path: "/finance",
    label: "Học phí · Công nợ",
    group: "Tài chính",
    permissions: ["tai_chinh.xem", "tai_chinh.quan_ly"],
  },
  {
    id: "notifications",
    path: "/notifications",
    label: "Thông báo nội bộ",
    group: "Tổng quan",
    permissions: [
      "don_vi.quan_ly",
      "tuyen_sinh.quan_ly",
      "hoc_sinh.quan_ly",
      "lop_hoc.quan_ly",
      "tai_chinh.quan_ly",
    ],
  },
  {
    id: "communications",
    path: "/communications",
    label: "Trao đổi phụ huynh",
    group: "Tổng quan",
    permissions: [
      "hoc_sinh.xem",
      "lop_hoc.xem",
      "hoc_sinh.quan_ly",
      "lop_hoc.quan_ly",
      "tuyen_sinh.quan_ly",
    ],
    hideAtHeThong: true,
  },
  {
    id: "organizations",
    path: "/organizations",
    label: "Cây đơn vị",
    group: "Hệ thống",
    permissions: ["don_vi.xem", "don_vi.quan_ly", "he_thong.quan_tri"],
    onlyAtHeThong: true,
  },
  {
    id: "users",
    path: "/users",
    label: "Quản lý người dùng",
    group: "Hệ thống",
    permissions: ["nguoi_dung.xem", "nguoi_dung.quan_ly"],
  },
  {
    id: "roles",
    path: "/roles",
    label: "Vai trò · Phân quyền",
    group: "Hệ thống",
    permissions: ["phan_quyen.xem", "phan_quyen.quan_ly"],
    onlyAtHeThong: true,
  },
  {
    id: "audit-logs",
    path: "/audit-logs",
    label: "Nhật ký hệ thống",
    group: "Hệ thống",
    permissions: ["phan_quyen.xem", "phan_quyen.quan_ly"],
    onlyAtHeThong: true,
  },
  {
    id: "settings",
    path: "/settings",
    label: "Cấu hình hệ thống",
    group: "Hệ thống",
    permissions: ["he_thong.quan_tri", "don_vi.quan_ly"],
    onlyAtHeThong: true,
    comingSoon: true,
  },
];

export function findRouteByPath(pathname: string) {
  return (
    appRoutes.find((route) => pathname === route.path || pathname.startsWith(`${route.path}/`)) ??
    appRoutes[0]
  );
}
