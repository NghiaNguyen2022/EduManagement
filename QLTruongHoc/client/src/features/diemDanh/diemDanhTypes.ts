import type { BuoiHocItem } from "../lichHoc/lichHocTypes";

export type TrangThaiDiemDanh =
  | "co_mat"
  | "vang_co_phep"
  | "vang_khong_phep"
  | "di_tre"
  | "ve_som";

export type DiemDanhHocSinhItem = {
  hocSinh: {
    id: number;
    maHocSinh: string;
    hoTen: string;
    tenThuongGoi: string | null;
  };
  trangThai: TrangThaiDiemDanh;
  ghiChu: string | null;
  nhanXet: string | null;
  daDiemDanh: boolean;
};

export type DiemDanhRoster = {
  buoiHoc: BuoiHocItem;
  hocSinh: DiemDanhHocSinhItem[];
};
