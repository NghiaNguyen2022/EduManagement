import type { GiaoVienItem } from "../giaoVien/giaoVienTypes";
import type { HocSinhItem } from "../hocSinh/hocSinhTypes";

export type TrangThaiLopHoc =
  | "chuan_bi"
  | "dang_hoc"
  | "tam_dung"
  | "ket_thuc"
  | "huy";

export type VaiTroGiaoVienLop =
  | "giao_vien_chinh"
  | "ho_tro"
  | "chu_nhiem";

export type LopHocItem = {
  id: number;
  donViId: number;
  chuongTrinhDaoTaoId: number | null;
  maLop: string;
  tenLop: string;
  capDo: string | null;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  siSoToiDa: number | null;
  phongHoc: string | null;
  trangThai: TrangThaiLopHoc;
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type LopHocFormInput = {
  chuongTrinhDaoTaoId: number | null;
  tenLop: string;
  capDo: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  siSoToiDa: number | null;
  phongHoc: string;
};

export type PhanCongGiaoVienItem = {
  phanCongId: number;
  vaiTro: VaiTroGiaoVienLop;
  tuNgay: string;
  denNgay: string | null;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
  giaoVien: GiaoVienItem;
};

export type EnrollmentItem = {
  enrollmentId: number;
  ngayVaoLop: string;
  ngayRoiLop: string | null;
  trangThai:
    | "dang_hoc"
    | "bao_luu"
    | "chuyen_lop"
    | "ngung_hoc"
    | "hoan_thanh";
  hocSinh: HocSinhItem;
};

export type LopHocDetail = {
  lopHoc: LopHocItem;
  giaoVien: PhanCongGiaoVienItem[];
  hocSinh: EnrollmentItem[];
};

// Bản ghi HocSinhLopHoc thô trả về ngay sau khi xếp lớp (khác `EnrollmentItem`,
// vốn là dạng đã join kèm `hocSinh` dùng để hiển thị danh sách) — đủ để lấy
// `id` (enrollmentId) gọi lập phiếu xếp lớp ngay mà không cần tải lại danh sách.
export type EnrollmentCreateResult = {
  id: number;
  hocSinhId: number;
  lopHocId: number;
  ngayVaoLop: string;
  trangThai: string;
};

export type DonViInPhieu = {
  tenDonVi: string;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  hinhAnhUrl: string | null;
};

export type MauInPhieu = {
  hienThiLogo: boolean;
  ghiChuFooter: string | null;
  nhanKyNguoiLap: string;
  nhanKyNguoiNop: string;
  nhanKyDaiDienDonVi: string;
};

export type XepLopVaLapPhieuResult = {
  enrollment: EnrollmentCreateResult;
  phieuXepLop: { id: number; soPhieu: string };
  phieuNhapHoc: { id: number; soPhieu: string } | null;
};

export type PhieuXepLopDetail = {
  id: number;
  soPhieu: string;
  ghiChu: string | null;
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
  lopHoc: { id: number; maLop: string; tenLop: string; phongHoc: string | null };
  ngayVaoLop: string;
  ketQuaTestDauVao: string | null;
  nguoiLap: { id: number; hoTen: string };
  donVi: DonViInPhieu;
  mauIn: MauInPhieu;
};
