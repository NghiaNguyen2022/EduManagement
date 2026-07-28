export type ThongBaoSuKienItem = {
  id: number;
  donViId: number;
  nguoiNhanId: number;
  loaiSuKien: string;
  tieuDe: string;
  noiDung: string;
  duongDan: string | null;
  daHienThi: boolean;
  daHienThiAt: string | null;
  daDoc: boolean;
  daDocAt: string | null;
  createdAt: string;
};

export type ThongBaoSuKienDanhSach = {
  items: ThongBaoSuKienItem[];
  soChuaDoc: number;
};
