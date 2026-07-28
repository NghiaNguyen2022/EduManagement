export type GioiTinh = "nam" | "nu" | "khac";

export type TrangThaiHocSinh =
  | "tiep_nhan"
  | "dang_hoc"
  | "bao_luu"
  | "ngung_hoc"
  | "hoan_thanh";

export type MoiQuanHe =
  | "cha"
  | "me"
  | "ong"
  | "ba"
  | "nguoi_giam_ho"
  | "khac";

export type HocSinhItem = {
  id: number;
  donViId: number;
  maHocSinh: string;
  hoTen: string;
  tenThuongGoi: string | null;
  hinhAnhUrl: string | null;
  ngaySinh: string | null;
  gioiTinh: GioiTinh | null;
  soDinhDanh: string | null;
  noiSinh: string | null;
  danToc: string | null;
  quocTich: string | null;
  diaChi: string | null;
  truongLopTruocDo: string | null;
  ngayNhapHoc: string | null;
  dienChinhSach: string | null;
  chieuCaoCm: string | null;
  canNangKg: string | null;
  diUngBenhNen: string | null;
  lienHeKhanCapHoTen: string | null;
  lienHeKhanCapSdt: string | null;
  nguyenVongLop: string | null;
  ketQuaTestDauVao: string | null;
  trangThai: TrangThaiHocSinh;
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type PhuHuynhItem = {
  id: number;
  nguoiDungId: number | null;
  maPhuHuynh: string;
  hoTen: string;
  dienThoai: string;
  email: string | null;
  ngheNghiep: string | null;
  diaChi: string | null;
};

export type GuardianLinkItem = {
  lienKetId: number;
  moiQuanHe: MoiQuanHe;
  laLienHeChinh: boolean;
  duocDonTre: boolean;
  nhanThongBao: boolean;
  nhanThongTinHocPhi: boolean;
  phuHuynh: PhuHuynhItem;
};

export type TrangThaiLichSuItem = {
  id: number;
  hocSinhId: number;
  trangThaiCu: TrangThaiHocSinh | null;
  trangThaiMoi: TrangThaiHocSinh;
  lyDo: string | null;
  ngayHieuLuc: string;
  actorUserId: number | null;
  createdAt: string;
};

export type EnrollmentSummaryItem = {
  enrollmentId: number;
  ngayVaoLop: string;
  ngayRoiLop: string | null;
  trangThai:
    | "dang_hoc"
    | "bao_luu"
    | "chuyen_lop"
    | "ngung_hoc"
    | "hoan_thanh";
  lopHoc: {
    id: number;
    maLop: string;
    tenLop: string;
  };
};

export type HocSinhDetail = {
  hocSinh: HocSinhItem;
  phuHuynh: GuardianLinkItem[];
  lichSuTrangThai: TrangThaiLichSuItem[];
  lopHoc: EnrollmentSummaryItem[];
};

export type ThanhTichItem = {
  id: number;
  hocSinhId: number;
  tenThanhTich: string;
  ketQua: string | null;
  ngayDat: string | null;
  noiCap: string | null;
  tepMinhChungUrl: string | null;
  ghiChu: string | null;
  createdAt: string;
};

export type ThanhTichFormInput = {
  tenThanhTich: string;
  ketQua: string;
  ngayDat: string;
  noiCap: string;
  tepMinhChungUrl: string | null;
  ghiChu: string;
};

export type LoaiDanhGia = "giua_ky" | "cuoi_ky" | "khac";

export type DanhGiaItem = {
  id: number;
  enrollmentId: number;
  loaiDanhGia: LoaiDanhGia;
  diemSo: string | null;
  xepLoai: string | null;
  nhanXet: string | null;
  ngayDanhGia: string;
  lopHoc: {
    id: number;
    maLop: string;
    tenLop: string;
  };
};

export type DanhGiaFormInput = {
  enrollmentId: string;
  loaiDanhGia: LoaiDanhGia | "";
  diemSo: number | null;
  xepLoai: string;
  nhanXet: string;
  ngayDanhGia: string;
};

export type HocSinhFormInput = {
  hoTen: string;
  tenThuongGoi: string;
  hinhAnhUrl: string | null;
  ngaySinh: string;
  gioiTinh: GioiTinh | "";
  soDinhDanh: string;
  noiSinh: string;
  danToc: string;
  quocTich: string;
  diaChi: string;
  truongLopTruocDo: string;
  ngayNhapHoc: string;
  dienChinhSach: string;
  chieuCaoCm: number | null;
  canNangKg: number | null;
  diUngBenhNen: string;
  lienHeKhanCapHoTen: string;
  lienHeKhanCapSdt: string;
};

export type GhiDanhTrucTiepFormInput = {
  hoTenHocVien: string;
  ngaySinh: string;
  gioiTinh: GioiTinh | "";
  diaChiHocVien: string;
  ngayNhapHoc: string;
  hoTenNguoiLienHe: string;
  soDienThoaiNguoiLienHe: string;
  emailNguoiLienHe: string;
  moiQuanHe: MoiQuanHe | "";
};

export type GuardianFormInput = {
  dienThoai: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinh | "";
  email: string;
  ngheNghiep: string;
  diaChi: string;
  moiQuanHe: MoiQuanHe | "";
  laLienHeChinh: boolean;
  duocDonTre: boolean;
  nhanThongBao: boolean;
  nhanThongTinHocPhi: boolean;
};
