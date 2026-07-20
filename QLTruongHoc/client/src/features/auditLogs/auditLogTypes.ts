export type AuditLevel =
  | "thong_tin"
  | "canh_bao"
  | "loi";

export type AuditLogItem = {
  id: number;
  nguoiDungId: number | null;
  donViId: number | null;
  hanhDong: string;
  doiTuong: string | null;
  doiTuongId: string | null;
  noiDung: string | null;
  mucDo: AuditLevel;
  diaChiIp: string | null;
  createdAt: string;
  nguoiDungHoTen: string | null;
  nguoiDungTenDangNhap: string | null;
  donViTen: string | null;
  donViMa: string | null;
};

export type AuditLogDetail =
  AuditLogItem & {
    duLieu: unknown;
  };

export type AuditLogListResult = {
  items: AuditLogItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
