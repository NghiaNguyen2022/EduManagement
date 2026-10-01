export type NguoiGuiVaiTro = "giao_vien" | "phu_huynh" | "hoc_vu" | "khac";

export type KenhLienLac = "truc_tiep" | "dien_thoai" | "nhan_tin" | "email" | "khac";

export type TraoDoiItem = {
  id: number;
  donViId: number;
  hocSinhId: number;
  lopHocId: number | null;
  nguoiGuiVaiTro: NguoiGuiVaiTro;
  kenhLienLac: KenhLienLac;
  noiDung: string;
  ketQua: string | null;
  nguoiTaoId: number;
  createdAt: string;
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
  lopHoc?: { id: number; maLop: string; tenLop: string } | null;
  nguoiTao: { id: number; hoTen: string; tenDangNhap: string };
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type TraoDoiFormInput = {
  hocSinhId: string;
  lopHocId: string;
  nguoiGuiVaiTro: NguoiGuiVaiTro | "";
  kenhLienLac: KenhLienLac | "";
  noiDung: string;
  ketQua: string;
};
