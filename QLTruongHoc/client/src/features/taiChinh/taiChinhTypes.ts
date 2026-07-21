export type LoaiKhoanThu =
  | "hoc_phi"
  | "tien_an"
  | "dich_vu"
  | "tai_lieu"
  | "khac";

export type DanhMucKhoanThuItem = {
  id: number;
  donViId: number;
  maKhoanThu: string;
  tenKhoanThu: string;
  loaiKhoanThu: LoaiKhoanThu;
  soTienMacDinh: string | null;
  batBuoc: "co" | "khong";
  trangThai: "hoat_dong" | "ngung_ap_dung";
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type DanhMucKhoanThuFormInput = {
  maKhoanThu: string;
  tenKhoanThu: string;
  loaiKhoanThu: LoaiKhoanThu;
  soTienMacDinh: number | null;
  batBuoc: boolean;
};

export type LoaiKy = "thang" | "khoa_hoc" | "hoc_ky" | "dot";

export type KyThuItem = {
  id: number;
  donViId: number;
  maKyThu: string;
  tenKyThu: string;
  loaiKy: LoaiKy;
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string | null;
  trangThai: "nhap" | "da_mo" | "da_dong";
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type KyThuFormInput = {
  maKyThu: string;
  tenKyThu: string;
  loaiKy: LoaiKy;
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string;
};

export type KhoanApDungItem = {
  danhMucKhoanThuId: number;
  tenKhoanThu: string;
  maKhoanThu: string;
  loaiKhoanThu: LoaiKhoanThu;
  soTien: string;
  ghiChu: string | null;
};

export type KyThuDetail = {
  kyThu: KyThuItem;
  khoanApDung: KhoanApDungItem[];
};
