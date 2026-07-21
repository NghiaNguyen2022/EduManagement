export type ChuongTrinhItem = {
  id: number;
  donViId: number;
  maChuongTrinh: string;
  tenChuongTrinh: string;
  capDo: string | null;
  tongSoBuoi: number | null;
  tongSoGio: string | null;
  moTa: string | null;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
};

export type ChuongTrinhFormInput = {
  maChuongTrinh: string;
  tenChuongTrinh: string;
  capDo: string;
  tongSoBuoi: number | null;
  tongSoGio: number | null;
  moTa: string;
};
