import {
  countGiaoVienHoatDong,
  countGiaoVienHoatDongAllDonVi,
  countHocSinhBaoLuu,
  countHocSinhBaoLuuTheoDonVi,
  countHocSinhDangHoc,
  countHocSinhDangHocAllDonVi,
  countLeadMoiTheoDonVi,
  countLeadMoiTuNgay,
  countLeadMoiTuNgayAllDonVi,
  countLopDangHoc,
  countLopDangHocAllDonVi,
} from "../db/dashboard.repository.js";
import { countHocSinhChoXepLop } from "../db/hocSinh.repository.js";
import {
  countLeadDangXuLy,
  countLichHenTuVanHomNay,
  layTyLeChuyenDoiLead,
} from "../db/lead.repository.js";
import { countBuoiHocCanDieuChinh, listBuoiHocAllDonVi } from "../db/lichHoc.repository.js";
import { listSiSoTheoLop } from "../db/lopHoc.repository.js";
import {
  countDieuChinhChoDuyet,
  countDieuChinhChoDuyetAllDonVi,
  countHocSinhChuaCoKhoanPhaiThu,
  countHocSinhChuaCoKhoanPhaiThuAllDonVi,
  countKhoanThuTheoHan,
  countKhoanThuTheoHanAllDonVi,
  sumCongNoAllDonVi,
  sumCongNoByDonVi,
  sumCongNoTheoDonVi,
  sumDoanhThuTheoDonVi,
} from "../db/taiChinh.repository.js";
import { countChiPhiChoDuyet, countChiPhiChoDuyetAllDonVi } from "../db/chiPhi.repository.js";
import { countDonXinPhepChoDuyet } from "../db/xinPhep.repository.js";
import { listThoiKhoaBieu } from "./lichHoc.service.js";

function dauThangHienTai() {
  const now = new Date();
  const dauThang = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  return dauThang.toISOString().slice(0, 19).replace("T", " ");
}

function homNayIso() {
  return new Date().toISOString().slice(0, 10);
}

function congNgayIso(iso: string, soNgay: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + soNgay);

  return date.toISOString().slice(0, 10);
}

/**
 * Bảng "quản trị đa chi nhánh" cho quản trị hệ thống: mỗi đơn vị 1 dòng —
 * doanh thu, công nợ, học sinh bảo lưu, lead mới trong tháng. Gộp 4 truy vấn
 * theo đơn vị (đã có sẵn "xem gộp thành 1 số", nhưng chưa có "tách theo từng
 * đơn vị") lại theo `donVi.id`. Chỉ tính cho quản trị hệ thống — không tính
 * cho các vai trò xem gộp khác (VD kế toán tổng) vì gộp nhiều mảng nghiệp vụ
 * (tài chính + tuyển sinh + học sinh) vào 1 bảng vượt phạm vi quyền của họ.
 */
async function getTongQuanTheoDonVi(tuNgay: string) {
  const [doanhThu, congNo, hocSinhBaoLuu, leadMoi] = await Promise.all([
    sumDoanhThuTheoDonVi(tuNgay, homNayIso()),
    sumCongNoTheoDonVi(),
    countHocSinhBaoLuuTheoDonVi(),
    countLeadMoiTheoDonVi(tuNgay),
  ]);

  const map = new Map<
    number,
    {
      donVi: { id: number; maDonVi: string; tenDonVi: string };
      doanhThu: string;
      congNo: string;
      hocSinhBaoLuu: number;
      leadMoi: number;
    }
  >();

  function ensure(donVi: { id: number; maDonVi: string; tenDonVi: string }) {
    let item = map.get(donVi.id);

    if (!item) {
      item = { donVi, doanhThu: "0.00", congNo: "0.00", hocSinhBaoLuu: 0, leadMoi: 0 };
      map.set(donVi.id, item);
    }

    return item;
  }

  for (const row of doanhThu) {
    ensure(row.donVi).doanhThu = row.doanhThu;
  }

  for (const row of congNo) {
    ensure(row.donVi).congNo = row.congNo;
  }

  for (const row of hocSinhBaoLuu) {
    ensure(row.donVi).hocSinhBaoLuu = row.soLuong;
  }

  for (const row of leadMoi) {
    ensure(row.donVi).leadMoi = row.soLuong;
  }

  return Array.from(map.values()).sort((left, right) =>
    left.donVi.tenDonVi.localeCompare(right.donVi.tenDonVi),
  );
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
  const canViewAttendance =
    isSystemAdmin ||
    permissions.includes("diem_danh.xem") ||
    permissions.includes("diem_danh.thuc_hien");

  const [hocSinhDangHoc, giaoVienHoatDong, lopDangHoc, leadMoiThangNay, congNo, lichHocHomNay] =
    await Promise.all([
      canViewStudents
        ? isHeThong
          ? countHocSinhDangHocAllDonVi()
          : countHocSinhDangHoc(donViId)
        : 0,
      canViewClasses
        ? isHeThong
          ? countGiaoVienHoatDongAllDonVi()
          : countGiaoVienHoatDong(donViId)
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

  // Bảng đa chi nhánh (doanh thu/công nợ/bảo lưu/lead theo từng đơn vị) và
  // lịch chung hôm nay chỉ dành cho quản trị hệ thống đứng ở đơn vị hệ
  // thống — đây là màn "quản trị" duy nhất gộp nhiều mảng nghiệp vụ khác
  // nhau vào 1 bảng, không mở cho các vai trò xem gộp khác (VD kế toán
  // tổng chỉ xem gộp trong đúng mảng tài chính, ở trang Tài chính riêng).
  const showTongQuanChiNhanh = isHeThong && isSystemAdmin;

  const [theoDonVi, lichChungHomNay] = await Promise.all([
    showTongQuanChiNhanh ? getTongQuanTheoDonVi(tuNgay) : [],
    showTongQuanChiNhanh ? listBuoiHocAllDonVi({ tuNgay: homNay, denNgay: homNay }) : [],
  ]);

  // Sĩ số lớp và đơn xin phép chỉ có ý nghĩa khi đứng tại 1 đơn vị cụ thể —
  // đơn vị hệ thống không tổ chức lớp/xin phép riêng, và gộp sĩ số của mọi
  // lớp trên toàn hệ thống thành 1 bảng phẳng không còn hữu ích. Ngược lại,
  // khoản thu theo hạn và yêu cầu điều chỉnh CHỜ DUYỆT là đúng thứ kế toán
  // tổng cần xem gộp toàn hệ thống, nên vẫn tính ở nhánh hệ thống.
  const [
    siSoTheoLop,
    donXinPhepChoDuyet,
    khoanThuTheoHan,
    dieuChinhChoDuyet,
    chiPhiChoDuyet,
    hocSinhChuaCoKhoanPhaiThu,
  ] = await Promise.all([
    !isHeThong && canViewClasses ? listSiSoTheoLop(donViId) : [],
    !isHeThong && canViewAttendance ? countDonXinPhepChoDuyet(donViId) : 0,
    canViewFinance
      ? isHeThong
        ? countKhoanThuTheoHanAllDonVi(homNay, congNgayIso(homNay, 7))
        : countKhoanThuTheoHan(donViId, homNay, congNgayIso(homNay, 7))
      : { sapDenHan: { soLuong: 0, tongTien: "0.00" }, quaHan: { soLuong: 0, tongTien: "0.00" } },
    canViewFinance
      ? isHeThong
        ? countDieuChinhChoDuyetAllDonVi()
        : countDieuChinhChoDuyet(donViId)
      : 0,
    canViewFinance
      ? isHeThong
        ? countChiPhiChoDuyetAllDonVi()
        : countChiPhiChoDuyet(donViId)
      : 0,
    canViewFinance
      ? isHeThong
        ? countHocSinhChuaCoKhoanPhaiThuAllDonVi()
        : countHocSinhChuaCoKhoanPhaiThu(donViId)
      : 0,
  ]);

  // Số liệu riêng cho Portal tuyển sinh/học vụ — cả 2 Portal này đều ẩn ở
  // đơn vị hệ thống (`hideAtHeThong: true` trong appRoutes.tsx) nên chỉ cần
  // tính khi đứng tại một đơn vị cụ thể, không cần biến thể "AllDonVi".
  const [
    leadDangXuLy,
    lichHenTuVanHomNay,
    tyLeChuyenDoiLead,
    buoiHocCanDieuChinh,
    hocSinhBaoLuu,
    hocSinhChoXepLop,
  ] = await Promise.all([
    !isHeThong && canViewAdmissions ? countLeadDangXuLy(donViId) : 0,
    !isHeThong && canViewAdmissions ? countLichHenTuVanHomNay(donViId, homNay) : 0,
    !isHeThong && canViewAdmissions
      ? layTyLeChuyenDoiLead(donViId)
      : { daDangKy: 0, tongLead: 0 },
    !isHeThong && canViewClasses
      ? countBuoiHocCanDieuChinh({ donViId, tuNgay: homNay, denNgay: congNgayIso(homNay, 6) })
      : 0,
    !isHeThong && canViewStudents ? countHocSinhBaoLuu(donViId) : 0,
    // Đúng số liệu Cổng học vụ dùng để xếp lớp — gác bằng canViewClasses
    // (lop_hoc.xem/quan_ly), khớp quyền endpoint /hoc-sinh/cho-xep-lop.
    !isHeThong && canViewClasses ? countHocSinhChoXepLop(donViId) : 0,
  ]);

  return {
    hocSinhDangHoc,
    giaoVienHoatDong,
    lopDangHoc,
    leadMoiThangNay,
    congNoHienTai: congNo.tongCongNo,
    lichHocHomNay: lichHocHomNay
      .sort((left, right) => left.buoiHoc.gioBatDau.localeCompare(right.buoiHoc.gioBatDau))
      .slice(0, 8),
    theoDonVi,
    lichChungHomNay,
    siSoTheoLop,
    donXinPhepChoDuyet,
    khoanThuTheoHan,
    dieuChinhChoDuyet,
    chiPhiChoDuyet,
    hocSinhChuaCoKhoanPhaiThu,
    leadDangXuLy,
    lichHenTuVanHomNay,
    tyLeChuyenDoiLead,
    buoiHocCanDieuChinh,
    hocSinhBaoLuu,
    hocSinhChoXepLop,
  };
}
