import type { ThoiKhoaBieuItem } from "../lichHoc/lichHocTypes";

export type DashboardSummary = {
  hocSinhDangHoc: number;
  lopDangHoc: number;
  leadMoiThangNay: number;
  congNoHienTai: string;
  lichHocHomNay: ThoiKhoaBieuItem[];
};
