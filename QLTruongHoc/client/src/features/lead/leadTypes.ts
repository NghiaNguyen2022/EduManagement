export type NguonLead =
  | "gioi_thieu"
  | "facebook"
  | "website"
  | "walk_in"
  | "khac";

export type TrangThaiLead =
  | "moi"
  | "dang_cham_soc"
  | "da_hen_lich"
  | "da_hoc_thu"
  | "da_dang_ky"
  | "khong_tiep_tuc";

export type LoaiHoatDong =
  | "goi_dien"
  | "gap_truc_tiep"
  | "nhan_tin"
  | "hen_lich"
  | "hoc_thu"
  | "khac";

export type LeadItem = {
  id: number;
  donViId: number;
  maLead: string;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  nguon: NguonLead;
  doTuoiHoacTrinhDo: string | null;
  nhuCau: string | null;
  tuVanVienId: number | null;
  trangThai: TrangThaiLead;
  lyDoKhongTiepTuc: string | null;
  hocSinhId: number | null;
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type LeadHoatDongItem = {
  id: number;
  leadId: number;
  loaiHoatDong: LoaiHoatDong;
  noiDung: string;
  ketQua: string | null;
  nguoiThucHienId: number;
  thoiGian: string;
};

export type LeadDetail = {
  lead: LeadItem;
  hoatDong: LeadHoatDongItem[];
};

export type LeadFormInput = {
  hoTen: string;
  soDienThoai: string;
  email: string;
  nguon: NguonLead;
  doTuoiHoacTrinhDo: string;
  nhuCau: string;
};

export type LeadActivityFormInput = {
  loaiHoatDong: LoaiHoatDong | "";
  noiDung: string;
  ketQua: string;
  trangThaiMoi: TrangThaiLead | "";
};

export type ConfirmRegistrationInput = {
  hoTenHocVien: string;
  ngaySinh: string;
  gioiTinh: "nam" | "nu" | "khac" | "";
  diaChiHocVien: string;
  ngayNhapHoc: string;
  moiQuanHe:
    | "cha"
    | "me"
    | "ong"
    | "ba"
    | "nguoi_giam_ho"
    | "khac"
    | "";
};
