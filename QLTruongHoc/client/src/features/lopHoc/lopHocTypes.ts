import type { GiaoVienItem } from "../giaoVien/giaoVienTypes";
import type { HocSinhItem } from "../hocSinh/hocSinhTypes";

export type TrangThaiLopHoc =
  | "chuan_bi"
  | "dang_hoc"
  | "tam_dung"
  | "ket_thuc"
  | "huy";

export type VaiTroGiaoVienLop =
  | "giao_vien_chinh"
  | "ho_tro"
  | "chu_nhiem";

export type LopHocItem = {
  id: number;
  donViId: number;
  chuongTrinhDaoTaoId: number | null;
  maLop: string;
  tenLop: string;
  capDo: string | null;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  siSoToiDa: number | null;
  phongHoc: string | null;
  trangThai: TrangThaiLopHoc;
};

export type LopHocFormInput = {
  chuongTrinhDaoTaoId: number | null;
  maLop: string;
  tenLop: string;
  capDo: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  siSoToiDa: number | null;
  phongHoc: string;
};

export type PhanCongGiaoVienItem = {
  phanCongId: number;
  vaiTro: VaiTroGiaoVienLop;
  tuNgay: string;
  denNgay: string | null;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
  giaoVien: GiaoVienItem;
};

export type EnrollmentItem = {
  enrollmentId: number;
  ngayVaoLop: string;
  ngayRoiLop: string | null;
  trangThai:
    | "dang_hoc"
    | "bao_luu"
    | "chuyen_lop"
    | "ngung_hoc"
    | "hoan_thanh";
  hocSinh: HocSinhItem;
};

export type LopHocDetail = {
  lopHoc: LopHocItem;
  giaoVien: PhanCongGiaoVienItem[];
  hocSinh: EnrollmentItem[];
};
