export type TrangThaiLichHoc = "hoat_dong" | "ngung_hoat_dong";

export type TrangThaiBuoiHoc = "du_kien" | "da_hoc" | "nghi" | "huy";

export type LoaiBuoiHoc = "thuong" | "bu";

export type LichHocItem = {
  id: number;
  lopHocId: number;
  thuTrongTuan: number;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc: string | null;
  giaoVienId: number | null;
  ngayApDungTu: string;
  ngayApDungDen: string | null;
  trangThai: TrangThaiLichHoc;
};

export type LichHocFormInput = {
  thuTrongTuanList: number[];
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc: string;
  giaoVienId: number | null;
  ngayApDungTu: string;
  ngayApDungDen: string;
};

export type BuoiHocItem = {
  id: number;
  lopHocId: number;
  lichHocId: number | null;
  ngayHoc: string;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc: string | null;
  giaoVienId: number | null;
  loaiBuoi: LoaiBuoiHoc;
  trangThai: TrangThaiBuoiHoc;
  ghiChu: string | null;
};

export type ThoiKhoaBieuItem = {
  buoiHoc: BuoiHocItem;
  lopHocTenLop: string;
  lopHocMaLop: string;
  giaoVienHoTen: string | null;
};
