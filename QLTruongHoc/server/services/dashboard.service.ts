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
export async function getDashboardSummary(donViId: number, loaiDonVi?: string) {
  const isHeThong = loaiDonVi === "he_thong";
  const tuNgay = dauThangHienTai();
  const homNay = homNayIso();

  const [hocSinhDangHoc, lopDangHoc, leadMoiThangNay, congNo, lichHocHomNay] = await Promise.all([
    isHeThong ? countHocSinhDangHocAllDonVi() : countHocSinhDangHoc(donViId),
    isHeThong ? countLopDangHocAllDonVi() : countLopDangHoc(donViId),
    isHeThong ? countLeadMoiTuNgayAllDonVi(tuNgay) : countLeadMoiTuNgay(donViId, tuNgay),
    isHeThong ? sumCongNoAllDonVi() : sumCongNoByDonVi(donViId),
    // Đơn vị hệ thống không tổ chức lớp/lịch học riêng (xem A01_cay_don_vi.md
    // mục 11) nên không có lịch hôm nay để gộp — trả danh sách rỗng, không
    // phải lỗi.
    isHeThong ? [] : listThoiKhoaBieu({ donViId, tuNgay: homNay, denNgay: homNay }),
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
