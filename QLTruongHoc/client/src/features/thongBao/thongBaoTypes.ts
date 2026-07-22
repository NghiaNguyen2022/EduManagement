export type PhamViThongBao = "toan_truong" | "theo_lop" | "ca_nhan";

export type ThongBaoItem = {
  id: number;
  donViId: number;
  maThongBao: string;
  tieuDe: string;
  noiDung: string;
  tepDinhKemTen: string | null;
  tepDinhKemUrl: string | null;
  phamVi: PhamViThongBao;
  doiTuong: string | null;
  nguoiTaoId: number;
  createdAt: string;
  updatedAt: string;
  daDocAt: string | null;
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type ThongBaoFormInput = {
  tieuDe: string;
  noiDung: string;
  tepDinhKemTen: string;
  tepDinhKemUrl: string;
  phamVi: PhamViThongBao;
  doiTuong: string;
};
