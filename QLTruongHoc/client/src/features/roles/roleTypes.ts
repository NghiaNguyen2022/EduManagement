export type RoleItem = {
  id: number;
  maVaiTro: string;
  tenVaiTro: string;
  moTa: string | null;
  phamVi: string;
  laVaiTroHeThong: boolean;
  dangHoatDong: boolean;
};

export type PermissionItem = {
  id: number;
  maQuyen: string;
  tenQuyen: string;
  nhomQuyen: string;
  moTa: string | null;
  dangHoatDong: boolean;
};

export type RolePermissionDetail = {
  role: RoleItem;
  permissionIds: number[];
};
