export type UserRoleSummary = {
  id: number;
  maVaiTro: string;
  tenVaiTro: string;
};

export type UserListItem = {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  email: string | null;
  soDienThoai: string | null;
  trangThai:
    | "hoat_dong"
    | "tam_khoa"
    | "ngung";
  batBuocDoiMatKhau: boolean;
  roles: UserRoleSummary[];
};

export type RoleOption = {
  id: number;
  maVaiTro: string;
  tenVaiTro: string;
  phamVi: string;
};

export type UserDetail = {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  email: string | null;
  soDienThoai: string | null;
  trangThai: "hoat_dong" | "tam_khoa" | "ngung";
  batBuocDoiMatKhau: boolean;
};
