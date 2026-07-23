export type LoaiDonVi = "he_thong" | "truong" | "trung_tam" | "co_so";
export type LoaiHinhDaoTao = "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac";
export type TrangThaiDonVi = "hoat_dong" | "tam_ngung" | "ngung_hoat_dong";

export type DonViItem = {
  id: number;
  donViChaId: number | null;
  maDonVi: string;
  tenDonVi: string;
  loaiDonVi: LoaiDonVi;
  loaiHinhDaoTao: LoaiHinhDaoTao | null;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  trangThai: TrangThaiDonVi;
};

export type DonViFormInput = {
  maDonVi: string;
  tenDonVi: string;
  loaiDonVi: LoaiDonVi;
  loaiHinhDaoTao: LoaiHinhDaoTao | null;
  diaChi: string;
  soDienThoai: string;
  email: string;
};
