export type CauHinhMauIn = {
  donViId: number;
  hienThiLogo: boolean;
  ghiChuFooter: string | null;
  nhanKyNguoiLap: string;
  nhanKyNguoiNop: string;
  nhanKyDaiDienDonVi: string;
};

export type CauHinhMauInFormInput = {
  hienThiLogo: boolean;
  ghiChuFooter: string;
  nhanKyNguoiLap: string;
  nhanKyNguoiNop: string;
  nhanKyDaiDienDonVi: string;
};

export type DonViInPhieu = {
  tenDonVi: string;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  hinhAnhUrl: string | null;
};
