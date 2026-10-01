import type { NavigationGroup } from "../types/navigation";

export const navigationGroups: NavigationGroup[] = [
  {
    id: "tong-quan",
    label: "Tổng quan",
    items: [
      { id: "dashboard", label: "Bảng điều hành", icon: "⌂" },
      { id: "don-vi", label: "Trường & trung tâm", icon: "▦" },
    ],
  },
  {
    id: "tuyen-sinh",
    label: "Tuyển sinh",
    items: [
      { id: "tiep-nhan", label: "Tiếp nhận tư vấn", icon: "◎" },
      { id: "dang-ky", label: "Hồ sơ đăng ký", icon: "▤", badge: "12" },
      { id: "hoc-sinh", label: "Học sinh", icon: "♙" },
      { id: "phu-huynh", label: "Phụ huynh", icon: "♧" },
    ],
  },
  {
    id: "dao-tao",
    label: "Đào tạo",
    items: [
      { id: "chuong-trinh", label: "Chương trình đào tạo", icon: "◇" },
      { id: "lop-hoc", label: "Lớp học", icon: "▣" },
      { id: "lich-hoc", label: "Lịch học", icon: "◫" },
      { id: "diem-danh", label: "Điểm danh", icon: "✓" },
      { id: "bao-giang", label: "Báo giảng", icon: "✎" },
      { id: "ket-qua", label: "Kết quả học tập", icon: "◈" },
    ],
  },
  {
    id: "tai-chinh",
    label: "Tài chính",
    items: [
      { id: "ky-thu", label: "Kỳ thu học phí", icon: "◉" },
      { id: "cong-no", label: "Công nợ học viên", icon: "≋" },
      { id: "phieu-thu", label: "Phiếu thu", icon: "▥" },
    ],
  },
  {
    id: "tuong-tac",
    label: "Tương tác",
    items: [
      { id: "thong-bao", label: "Thông báo", icon: "◌" },
      { id: "xin-phep", label: "Đơn xin phép", icon: "□", badge: "3" },
      { id: "trao-doi", label: "Trao đổi phụ huynh", icon: "◍" },
    ],
  },
  {
    id: "he-thong",
    label: "Hệ thống",
    items: [
      { id: "nguoi-dung", label: "Người dùng", icon: "♙" },
      { id: "phan-quyen", label: "Phân quyền", icon: "⌘" },
      { id: "cau-hinh", label: "Cấu hình", icon: "⚙" },
    ],
  },
];
