export type AuthUser = {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  email: string | null;
  soDienThoai: string | null;
  batBuocDoiMatKhau: boolean;
};

export type AuthOrganization = {
  id: number;
  maDonVi: string;
  tenDonVi: string;
  loaiDonVi: string;
  loaiHinhDaoTao: string | null;
  vaiTro: string[];
  quyen: string[];
};

export type AuthContextData = {
  sessionId: number;
  user: AuthUser;
  currentOrganization: AuthOrganization | null;
  organizations: AuthOrganization[];
};
