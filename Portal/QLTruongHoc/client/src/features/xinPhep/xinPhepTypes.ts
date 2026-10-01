export type TrangThaiDonXinPhep = "cho_duyet" | "da_duyet" | "tu_choi";

export type DonXinPhepDetail = {
  id: number;
  donViId: number;
  hocSinhId: number;
  lopHocId: number;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  trangThai: TrangThaiDonXinPhep;
  nguoiTaoId: number;
  nguoiDuyetId: number | null;
  ghiChuDuyet: string | null;
  createdAt: string;
  updatedAt: string;
  duyetAt: string | null;
};

export type DonXinPhepRow = {
  donXinPhep: DonXinPhepDetail;
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
  lopHoc: { id: number; maLop: string; tenLop: string };
};

export type DonXinPhepFormInput = {
  hocSinhId: number;
  lopHocId: number;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
};
