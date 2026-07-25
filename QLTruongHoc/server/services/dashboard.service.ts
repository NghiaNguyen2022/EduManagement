import {
  countHocSinhDangHoc,
  countHocSinhDangHocAllDonVi,
  countLeadMoiTuNgay,
  countLeadMoiTuNgayAllDonVi,
  countLopDangHoc,
  countLopDangHocAllDonVi,
} from "../db/dashboard.repository.js";
import { sumCongNoAllDonVi, sumCongNoByDonVi } from "../db/taiChinh.repository.js";
import { listThoiKhoaBieu } from "./lichHoc.service.js";

function dauThangHienTai() {
  const now = new Date();
  const dauThang = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  return dauThang.toISOString().slice(0, 19).replace("T", " ");
}

function homNayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Số liệu tổng hợp cho `/dashboard` — thay số liệu cứng cũ bằng dữ liệu thật.
 * Đơn vị hệ thống xem gộp toàn bộ đơn vị đang hoạt động, giống các trang
 * xem gộp khác (StudentsPage, ClassesPage...).
 */
export async function getDashboardSummary(
  donViId: number,
  loaiDonVi: string | undefined,
  permissions: readonly string[],
) {
  const isHeThong = loaiDonVi === "he_thong";
  const tuNgay = dauThangHienTai();
  const homNay = homNayIso();
  const isSystemAdmin = permissions.includes("he_thong.quan_tri");
  const canViewStudents =
    isSystemAdmin ||
    permissions.includes("hoc_sinh.xem") ||
    permissions.includes("hoc_sinh.quan_ly");
  const canViewClasses =
    isSystemAdmin ||
    permissions.includes("lop_hoc.xem") ||
    permissions.includes("lop_hoc.quan_ly");
  const canViewAdmissions =
    isSystemAdmin ||
    permissions.includes("tuyen_sinh.xem") ||
    permissions.includes("tuyen_sinh.quan_ly");
  const canViewFinance =
    isSystemAdmin ||
    permissions.includes("tai_chinh.xem") ||
    permissions.includes("tai_chinh.quan_ly");

  const [hocSinhDangHoc, lopDangHoc, leadMoiThangNay, congNo, lichHocHomNay] = await Promise.all([
    canViewStudents
      ? isHeThong
        ? countHocSinhDangHocAllDonVi()
        : countHocSinhDangHoc(donViId)
      : 0,
    canViewClasses
      ? isHeThong
        ? countLopDangHocAllDonVi()
        : countLopDangHoc(donViId)
      : 0,
    canViewAdmissions
      ? isHeThong
        ? countLeadMoiTuNgayAllDonVi(tuNgay)
        : countLeadMoiTuNgay(donViId, tuNgay)
      : 0,
    canViewFinance
      ? isHeThong
        ? sumCongNoAllDonVi()
        : sumCongNoByDonVi(donViId)
      : { tongCongNo: "0" },
    // Đơn vị hệ thống không tổ chức lớp/lịch học riêng (xem A01_cay_don_vi.md
    // mục 11) nên không có lịch hôm nay để gộp — trả danh sách rỗng, không
    // phải lỗi.
    isHeThong || !canViewClasses
      ? []
      : listThoiKhoaBieu({ donViId, tuNgay: homNay, denNgay: homNay }),
  ]);

  return {
    hocSinhDangHoc,
    lopDangHoc,
    leadMoiThangNay,
    congNoHienTai: congNo.tongCongNo,
    lichHocHomNay: lichHocHomNay
      .sort((left, right) => left.buoiHoc.gioBatDau.localeCompare(right.buoiHoc.gioBatDau))
      .slice(0, 8),
  };
}
