import type { ThoiKhoaBieuItem } from "../lichHoc/lichHocTypes";

export type DonViRef = { id: number; maDonVi: string; tenDonVi: string };

export type TongQuanTheoDonViItem = {
  donVi: DonViRef;
  doanhThu: string;
  congNo: string;
  hocSinhBaoLuu: number;
  leadMoi: number;
};

export type LichChungItem = ThoiKhoaBieuItem & { donVi: DonViRef };

export type SiSoLopItem = {
  id: number;
  tenLop: string;
  maLop: string;
  siSoToiDa: number | null;
  siSoHienTai: number;
};

export type KhoanThuTheoHanBucket = { soLuong: number; tongTien: string };

export type KhoanThuTheoHan = {
  sapDenHan: KhoanThuTheoHanBucket;
  quaHan: KhoanThuTheoHanBucket;
};

export type TyLeChuyenDoiLead = { daDangKy: number; tongLead: number };

export type DashboardSummary = {
  hocSinhDangHoc: number;
  giaoVienHoatDong: number;
  lopDangHoc: number;
  leadMoiThangNay: number;
  congNoHienTai: string;
  lichHocHomNay: ThoiKhoaBieuItem[];
  theoDonVi: TongQuanTheoDonViItem[];
  lichChungHomNay: LichChungItem[];
  siSoTheoLop: SiSoLopItem[];
  donXinPhepChoDuyet: number;
  khoanThuTheoHan: KhoanThuTheoHan;
  dieuChinhChoDuyet: number;
  chiPhiChoDuyet: number;
  hocSinhChuaCoKhoanPhaiThu: number;
  leadDangXuLy: number;
  lichHenTuVanHomNay: number;
  tyLeChuyenDoiLead: TyLeChuyenDoiLead;
  buoiHocCanDieuChinh: number;
  hocSinhBaoLuu: number;
  hocSinhChoXepLop: number;
};
