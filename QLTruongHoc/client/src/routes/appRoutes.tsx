import type { ReactNode } from "react";

export type LoaiHinhDaoTao = "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac";

export type AppRouteDefinition = {
      id: string;
      path: string;
      label: string;
      group: string;
      permissions?: string[];
      roles?: string[];
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
       * quản trị toàn hệ thống (Danh mục đơn vị, vai trò/phân quyền, nhật ký, cấu
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
  /**
   * Không hiện ở menu bên trái — dùng cho trang mở từ nơi khác (VD: tên
   * người dùng ở góc phải Topbar), nhưng vẫn cần khai báo ở đây để tiêu đề
   * tab trình duyệt (`findRouteByPath` trong `AppShell.tsx`) nhận đúng tên.
   */
  hideFromSidebar?: boolean;
};

export const appRoutes: AppRouteDefinition[] = [
      {
            id: "portal-parent",
            path: "/portal/parent",
            label: "Cổng phụ huynh",
            group: "Cổng làm việc",
            roles: ["phu_huynh"],
            hideFromSidebar: true,
      },
      {
            id: "portal-he-thong",
            path: "/portal/he-thong",
            label: "Cổng quản trị hệ thống",
            group: "Cổng làm việc",
            roles: ["quan_tri_he_thong"],
            onlyAtHeThong: true,
            hideFromSidebar: true,
      },
      {
            id: "portal-giao-vien",
            path: "/portal/giao-vien",
            label: "Cổng giáo viên",
            group: "Cổng làm việc",
            roles: ["giao_vien"],
            hideAtHeThong: true,
      },
      {
            id: "portal-hoc-vu",
            path: "/portal/hoc-vu",
            label: "Cổng học vụ",
            group: "Cổng làm việc",
            roles: ["hoc_vu"],
            hideAtHeThong: true,
      },
      {
            id: "portal-ke-toan",
            path: "/portal/ke-toan",
            label: "Cổng kế toán",
            group: "Cổng làm việc",
            roles: ["ke_toan"],
      },
      {
            id: "portal-tuyen-sinh",
            path: "/portal/tuyen-sinh",
            label: "Cổng tư vấn · tuyển sinh",
            group: "Cổng làm việc",
            roles: ["tu_van", "tuyen_sinh"],
            hideAtHeThong: true,
      },
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
            id: "leave-requests",
            path: "/attendance/xin-phep",
            label: "Đơn xin phép",
            group: "Đào tạo",
            permissions: ["diem_danh.xem", "diem_danh.thuc_hien"],
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
            label: "Danh mục đơn vị",
            group: "Hệ thống",
            permissions: ["don_vi.xem", "don_vi.quan_ly", "he_thong.quan_tri"],
            onlyAtHeThong: true,
      },
      {
            id: "tim-kiem",
            path: "/tim-kiem",
            label: "Tìm kiếm xuyên đơn vị",
            group: "Hệ thống",
            permissions: ["he_thong.quan_tri"],
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
            permissions: ["he_thong.quan_tri"],
            onlyAtHeThong: true,
      },
      {
            id: "my-profile",
            path: "/thong-tin-ca-nhan",
            label: "Thông tin cá nhân",
            group: "Tổng quan",
            hideFromSidebar: true,
      },
];

const fallbackRoute: AppRouteDefinition = {
      id: "unknown",
      path: "",
      label: "Quản lý trường học",
      group: "Hệ thống",
      hideFromSidebar: true,
};

function findBestRouteMatch(pathname: string) {
      return appRoutes
            .filter((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
            .sort((left, right) => right.path.length - left.path.length)[0] ?? null;
}

export function findRouteByPath(pathname: string) {
      return findBestRouteMatch(pathname) ?? fallbackRoute;
}

export function findRouteAccessByPath(pathname: string) {
      return findBestRouteMatch(pathname);
}
