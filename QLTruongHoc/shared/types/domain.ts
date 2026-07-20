export type LoaiHinhDaoTao = 'mam_non' | 'ngoai_ngu' | 'tin_hoc' | 'khac';
export type TrangThaiHoatDong = 'hoat_dong' | 'ngung_hoat_dong';
export type TrangThaiHocSinh = 'cho_nhap_hoc' | 'dang_hoc' | 'bao_luu' | 'ngung_hoc' | 'hoan_thanh';
export type TrangThaiLopHoc = 'chuan_bi' | 'dang_hoc' | 'tam_dung' | 'ket_thuc' | 'huy';
export type TrangThaiDiemDanh = 'co_mat' | 'vang_co_phep' | 'vang_khong_phep' | 'di_tre' | 've_som';
export type TrangThaiKyThu = 'nhap' | 'da_phat_hanh' | 'da_khoa' | 'huy';

export interface DonViContext {
  nguoiDungId: number;
  donViId: number;
  maDonVi: string;
  loaiHinhDaoTao: LoaiHinhDaoTao;
  vaiTro: string[];
  muiGio: 'Asia/Ho_Chi_Minh';
}
