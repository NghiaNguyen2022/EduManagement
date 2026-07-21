export type GiaoVienItem = {
  id: number;
  donViId: number;
  nguoiDungId: number | null;
  maGiaoVien: string;
  hoTen: string;
  dienThoai: string | null;
  email: string | null;
  chuyenMon: string | null;
  trinhDo: string | null;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
};

export type GiaoVienFormInput = {
  hoTen: string;
  dienThoai: string;
  email: string;
  chuyenMon: string;
  trinhDo: string;
};
