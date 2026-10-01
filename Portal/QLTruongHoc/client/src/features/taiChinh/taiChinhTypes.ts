export type LoaiKhoanThu = "hoc_phi" | "tien_an" | "dich_vu" | "tai_lieu" | "khac";

export type LoaiChiPhi = "luong" | "mat_bang" | "dien_nuoc" | "vat_tu" | "marketing" | "khac";

export type TrangThaiDuyetDanhMuc = "khong_can_duyet" | "cho_duyet" | "da_duyet" | "tu_choi";

export type DanhMucChiPhiItem = {
  id: number;
  donViId: number;
  maChiPhi: string;
  tenChiPhi: string;
  loaiChiPhi: LoaiChiPhi;
  trangThai: "hoat_dong" | "ngung_ap_dung";
  trangThaiDuyet: TrangThaiDuyetDanhMuc;
  nguoiTaoId: number | null;
  nguoiDuyetId: number | null;
  ghiChuDuyet: string | null;
  duyetAt: string | null;
  nguoiTaoHoTen?: string | null;
  nguoiDuyetHoTen?: string | null;
};

export type TrangThaiChiPhi = "cho_duyet" | "da_duyet" | "tu_choi";
export type LoaiDeXuatChi = "dinh_ky" | "dot_xuat";

export type CauHinhTaiChinhDonVi = {
  donViId: number;
  duyetDanhMucChiPhi: boolean;
  duyetChiDinhKy: boolean;
  duyetChiDotXuat: boolean;
};

export type ChiPhiItem = {
  id: number;
  donViId: number;
  danhMucChiPhiId: number;
  soTien: string;
  ngayChi: string;
  moTa: string | null;
  loaiDeXuat: LoaiDeXuatChi;
  trangThai: TrangThaiChiPhi;
  nguoiTaoId: number;
  nguoiDuyetId: number | null;
  ghiChuDuyet: string | null;
  createdAt: string;
  duyetAt: string | null;
  nguoiTao: { id: number; hoTen: string; tenDangNhap: string };
  nguoiDuyet: { id: number; hoTen: string; tenDangNhap: string } | null;
  danhMuc: { id: number; maChiPhi: string; tenChiPhi: string; loaiChiPhi: LoaiChiPhi };
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type DanhMucKhoanThuItem = {
  id: number;
  donViId: number;
  maKhoanThu: string;
  tenKhoanThu: string;
  loaiKhoanThu: LoaiKhoanThu;
  soTienMacDinh: string | null;
  batBuoc: "co" | "khong";
  trangThai: "hoat_dong" | "ngung_ap_dung";
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type DanhMucKhoanThuFormInput = {
  tenKhoanThu: string;
  loaiKhoanThu: LoaiKhoanThu;
  soTienMacDinh: number | null;
  batBuoc: boolean;
};

export type LoaiKy = "thang" | "khoa_hoc" | "hoc_ky" | "dot";

export type KyThuItem = {
  id: number;
  donViId: number;
  maKyThu: string;
  tenKyThu: string;
  loaiKy: LoaiKy;
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string | null;
  trangThai: "nhap" | "da_mo" | "da_dong";
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type KyThuFormInput = {
  tenKyThu: string;
  loaiKy: LoaiKy;
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string;
};

export type KhoanApDungItem = {
  danhMucKhoanThuId: number;
  tenKhoanThu: string;
  maKhoanThu: string;
  loaiKhoanThu: LoaiKhoanThu;
  soTien: string;
  ghiChu: string | null;
};

export type KyThuDetail = {
  kyThu: KyThuItem;
  khoanApDung: KhoanApDungItem[];
};

export type TrangThaiKhoanPhaiThu = "chua_thu" | "thu_mot_phan" | "da_thu_du";

export type KhoanPhaiThuItem = {
  id: number;
  kyThuId: number;
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
  lopHoc: { id: number; maLop: string; tenLop: string } | null;
  tongTien: string;
  giamTru: string;
  daThu: string;
  conLai: string;
  trangThai: TrangThaiKhoanPhaiThu;
  kyThu?: { id: number; maKyThu: string; tenKyThu: string; hanThanhToan?: string | null };
};

export type PhuongThucThu = "tien_mat" | "chuyen_khoan" | "the" | "khac";

export type PhieuThuItem = {
  id: number;
  donViId: number;
  khoanPhaiThuId: number;
  hocSinhId: number;
  soPhieu: string;
  soTien: string;
  phuongThuc: PhuongThucThu;
  ghiChu: string | null;
  nguoiThuId: number;
  ngayThu: string;
};

export type SinhKhoanPhaiThuResult = {
  daTao: number;
  boQua: number;
  tongSoHocSinh: number;
};

export type BaoCaoKyThuItem = {
  kyThu: { id: number; maKyThu: string; tenKyThu: string; trangThai: string };
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
  phaiThu: string;
  daThu: string;
  conLai: string;
};

export type BaoCaoTaiChinh = {
  tongThu: string;
  tongHoanPhi: string;
  tongThuRong: string;
  soPhieuThu: number;
  tongCongNo: string;
  tongChiPhi: string;
  laiLoRong: string;
  theoKyThu: BaoCaoKyThuItem[];
};

export type DonViInPhieu = {
  tenDonVi: string;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  hinhAnhUrl: string | null;
};

export type MauInPhieu = {
  hienThiLogo: boolean;
  ghiChuFooter: string | null;
  nhanKyNguoiLap: string;
  nhanKyNguoiNop: string;
  nhanKyDaiDienDonVi: string;
};

export type PhieuThuDetail = {
  id: number;
  soPhieu: string;
  soTien: string;
  phuongThuc: PhuongThucThu;
  ghiChu: string | null;
  ngayThu: string;
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
  kyThu: { id: number; maKyThu: string; tenKyThu: string };
  lopHoc: { id: number; maLop: string; tenLop: string } | null;
  khoanPhaiThu: KhoanPhaiThuItem;
  donVi: DonViInPhieu;
  mauIn: MauInPhieu;
};

export type LoaiDieuChinh = "hoan_phi" | "chuyen_phi" | "bao_luu";
export type TrangThaiDieuChinh = "cho_duyet" | "da_duyet" | "tu_choi";

export type DieuChinhItem = {
  id: number;
  donViId: number;
  khoanPhaiThuId: number;
  khoanPhaiThuDichId: number | null;
  loaiDieuChinh: LoaiDieuChinh;
  soTien: string;
  lyDo: string;
  trangThai: TrangThaiDieuChinh;
  nguoiTaoId: number;
  nguoiDuyetId: number | null;
  ghiChuDuyet: string | null;
  createdAt: string;
  duyetAt: string | null;
  nguoiTao: { id: number; hoTen: string; tenDangNhap: string };
  nguoiDuyet: { id: number; hoTen: string; tenDangNhap: string } | null;
};

export type DieuChinhListItem = DieuChinhItem & {
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
  kyThu: { id: number; maKyThu: string; tenKyThu: string };
  donVi?: { id: number; maDonVi: string; tenDonVi: string };
};

export type DieuChinhFormInput = {
  loaiDieuChinh: LoaiDieuChinh;
  khoanPhaiThuDichId: string;
  soTien: number | null;
  lyDo: string;
};
