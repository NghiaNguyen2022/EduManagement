export type UserListItem = {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  email: string | null;
  soDienThoai: string | null;
  trangThai: "hoat_dong" | "tam_khoa" | "ngung";
  batBuocDoiMatKhau: boolean;
  roleId: number;
  maVaiTro: string;
  tenVaiTro: string;
  assignmentActive: boolean;
};

export type RoleOption = {
  id: number;
  maVaiTro: string;
  tenVaiTro: string;
  phamVi: string;
};
