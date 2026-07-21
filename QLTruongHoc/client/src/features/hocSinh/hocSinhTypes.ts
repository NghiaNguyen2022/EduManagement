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
  ngaySinh: string | null;
  gioiTinh: GioiTinh | null;
  diaChi: string | null;
  ngayNhapHoc: string | null;
  trangThai: TrangThaiHocSinh;
};

export type PhuHuynhItem = {
  id: number;
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

export type HocSinhDetail = {
  hocSinh: HocSinhItem;
  phuHuynh: GuardianLinkItem[];
};

export type HocSinhFormInput = {
  hoTen: string;
  tenThuongGoi: string;
  ngaySinh: string;
  gioiTinh: GioiTinh | "";
  diaChi: string;
  ngayNhapHoc: string;
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
