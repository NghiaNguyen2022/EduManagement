import {
  createAuditLog,
} from "../db/audit.repository.js";
import { findChuongTrinhById } from "../db/chuongTrinh.repository.js";
import { findGiaoVienById } from "../db/giaoVien.repository.js";
import {
  createTrangThaiLichSu,
  findHocSinhById,
  updateHocSinhTrangThai,
} from "../db/hocSinh.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";
import { lapPhieuNhapHoc } from "./hocSinh.service.js";
import {
  closeEnrollment,
  countHocSinhDangHocTrongLop,
  countLopHocTheoMaPrefix,
  countPhieuXepLopTheoPrefix,
  createEnrollment,
  createLopHoc,
  createPhanCongGiaoVien,
  createPhieuXepLop,
  endPhanCongGiaoVien,
  findEnrollmentById,
  findEnrollmentDangHoc,
  findGiaoVienChinhDangHoatDong,
  findLopHocById,
  findPhanCongGiaoVienById,
  findPhieuXepLopById,
  listActiveEnrollmentsByHocSinh,
  listHocSinhTrongLop,
  listLopHocAllDonVi,
  listLopHocByDonVi,
  listPhanCongGiaoVien,
  setLopHocTrangThai,
  updateLopHoc,
} from "../db/lopHoc.repository.js";
import { getCauHinhMauIn } from "../db/mauIn.repository.js";

async function sinhMaLopHoc(donViId: number) {
  const total = await countLopHocTheoMaPrefix(donViId, "LOP");
  return `LOP${String(total + 1).padStart(4, "0")}`;
}

type TrangThaiLopHoc =
  | "chuan_bi"
  | "dang_hoc"
  | "tam_dung"
  | "ket_thuc"
  | "huy";

const TRANG_THAI_LOP_HOP_LE: TrangThaiLopHoc[] = [
  "chuan_bi",
  "dang_hoc",
  "tam_dung",
  "ket_thuc",
  "huy",
];

const VAI_TRO_GIAO_VIEN_HOP_LE = ["giao_vien_chinh", "ho_tro", "chu_nhiem"];

export async function listLopHoc(donViId: number, loaiDonVi?: string) {
  if (loaiDonVi === "he_thong") {
    return listLopHocAllDonVi();
  }

  return listLopHocByDonVi(donViId);
}

export async function getLopHocDetail(
  donViId: number,
  id: number,
) {
  const found = await findLopHocById(donViId, id);

  if (!found) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  const [giaoVienList, hocSinhList] = await Promise.all([
    listPhanCongGiaoVien(id),
    listHocSinhTrongLop(id),
  ]);

  return {
    lopHoc: found,
    giaoVien: giaoVienList.map((row) => ({
      phanCongId: row.phanCong.id,
      vaiTro: row.phanCong.vaiTro,
      tuNgay: row.phanCong.tuNgay,
      denNgay: row.phanCong.denNgay,
      trangThai: row.phanCong.trangThai,
      giaoVien: row.giaoVien,
    })),
    hocSinh: hocSinhList.map((row) => ({
      enrollmentId: row.enrollment.id,
      ngayVaoLop: row.enrollment.ngayVaoLop,
      ngayRoiLop: row.enrollment.ngayRoiLop,
      trangThai: row.enrollment.trangThai,
      hocSinh: row.hocSinh,
    })),
  };
}

export async function createLopHocMoi(input: {
  donViId: number;
  chuongTrinhDaoTaoId?: number | null;
  tenLop: string;
  capDo?: string | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  siSoToiDa?: number | null;
  phongHoc?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const tenLop = input.tenLop.trim();

  if (!tenLop) {
    throw new Error("Vui lòng nhập tên lớp.");
  }

  if (
    input.siSoToiDa !== undefined &&
    input.siSoToiDa !== null &&
    input.siSoToiDa <= 0
  ) {
    throw new Error("Sĩ số tối đa phải lớn hơn 0.");
  }

  // Mã do hệ thống tự sinh (LOP<số thứ tự>) — người dùng không nhập tay.
  const maLop = await sinhMaLopHoc(input.donViId);

  if (input.chuongTrinhDaoTaoId) {
    const chuongTrinh = await findChuongTrinhById(
      input.donViId,
      input.chuongTrinhDaoTaoId,
    );

    if (!chuongTrinh) {
      throw new Error("Không tìm thấy chương trình đào tạo.");
    }
  }

  const created = await createLopHoc({
    donViId: input.donViId,
    chuongTrinhDaoTaoId: input.chuongTrinhDaoTaoId ?? null,
    maLop,
    tenLop,
    capDo: input.capDo?.trim() || null,
    ngayBatDau: input.ngayBatDau || null,
    ngayKetThuc: input.ngayKetThuc || null,
    siSoToiDa: input.siSoToiDa ?? null,
    phongHoc: input.phongHoc?.trim() || null,
  });

  if (!created) {
    throw new Error("Không thể tạo lớp học.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.create",
    objectType: "LopHoc",
    objectId: String(created.id),
    content: `Tạo lớp ${created.tenLop} (${created.maLop}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function updateLopHocThongTin(input: {
  donViId: number;
  id: number;
  chuongTrinhDaoTaoId?: number | null;
  tenLop: string;
  capDo?: string | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  siSoToiDa?: number | null;
  phongHoc?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLopHocById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  const tenLop = input.tenLop.trim();

  if (!tenLop) {
    throw new Error("Vui lòng nhập tên lớp.");
  }

  if (
    input.siSoToiDa !== undefined &&
    input.siSoToiDa !== null &&
    input.siSoToiDa <= 0
  ) {
    throw new Error("Sĩ số tối đa phải lớn hơn 0.");
  }

  if (input.chuongTrinhDaoTaoId) {
    const chuongTrinh = await findChuongTrinhById(
      input.donViId,
      input.chuongTrinhDaoTaoId,
    );

    if (!chuongTrinh) {
      throw new Error("Không tìm thấy chương trình đào tạo.");
    }
  }

  const updated = await updateLopHoc({
    id: input.id,
    chuongTrinhDaoTaoId: input.chuongTrinhDaoTaoId ?? null,
    tenLop,
    capDo: input.capDo?.trim() || null,
    ngayBatDau: input.ngayBatDau || null,
    ngayKetThuc: input.ngayKetThuc || null,
    siSoToiDa: input.siSoToiDa ?? null,
    phongHoc: input.phongHoc?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật lớp học.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.update",
    objectType: "LopHoc",
    objectId: String(updated.id),
    content: `Cập nhật lớp ${updated.tenLop} (${updated.maLop}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function setLopHocStatus(input: {
  donViId: number;
  id: number;
  trangThai: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLopHocById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  if (!TRANG_THAI_LOP_HOP_LE.includes(input.trangThai as TrangThaiLopHoc)) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  const trangThai = input.trangThai as TrangThaiLopHoc;

  const updated = await setLopHocTrangThai({
    id: input.id,
    trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật trạng thái lớp.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.set_status",
    objectType: "LopHoc",
    objectId: String(updated.id),
    content: `Đổi trạng thái lớp ${updated.tenLop} sang ${trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function assignGiaoVienVaoLop(input: {
  donViId: number;
  lopHocId: number;
  giaoVienId: number;
  vaiTro: string;
  tuNgay: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const lop = await findLopHocById(input.donViId, input.lopHocId);

  if (!lop) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  const teacher = await findGiaoVienById(
    input.donViId,
    input.giaoVienId,
  );

  if (!teacher) {
    throw new Error("Không tìm thấy giáo viên trong đơn vị hiện tại.");
  }

  if (!VAI_TRO_GIAO_VIEN_HOP_LE.includes(input.vaiTro)) {
    throw new Error("Vai trò phân công không hợp lệ.");
  }

  if (!input.tuNgay) {
    throw new Error("Vui lòng chọn ngày hiệu lực.");
  }

  if (input.vaiTro === "giao_vien_chinh") {
    const existingChinh = await findGiaoVienChinhDangHoatDong(
      input.lopHocId,
    );

    if (existingChinh) {
      throw new Error(
        "Lớp đã có giáo viên chính đang hoạt động. Vui lòng kết thúc phân công cũ trước.",
      );
    }
  }

  const created = await createPhanCongGiaoVien({
    lopHocId: input.lopHocId,
    giaoVienId: input.giaoVienId,
    vaiTro: input.vaiTro as "giao_vien_chinh" | "ho_tro" | "chu_nhiem",
    tuNgay: input.tuNgay,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.assign_teacher",
    objectType: "LopHocGiaoVien",
    objectId: created ? String(created.id) : null,
    content: `Phân công giáo viên ${teacher.hoTen} (${teacher.maGiaoVien}) vào lớp ${lop.tenLop}.`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function endGiaoVienAssignment(input: {
  donViId: number;
  phanCongId: number;
  denNgay: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findPhanCongGiaoVienById(input.phanCongId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy phân công giáo viên.");
  }

  if (!input.denNgay) {
    throw new Error("Vui lòng chọn ngày kết thúc.");
  }

  await endPhanCongGiaoVien({
    id: input.phanCongId,
    denNgay: input.denNgay,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.end_teacher_assignment",
    objectType: "LopHocGiaoVien",
    objectId: String(input.phanCongId),
    content: "Kết thúc phân công giáo viên.",
    ipAddress: input.ipAddress,
  });
}

/**
 * BPD 7.2 "Không vượt sĩ số nếu không có quyền phê duyệt" — trước đây chặn
 * cứng với mọi vai trò (kể cả quản lý đơn vị/quản trị hệ thống), không đúng
 * quy tắc gốc vốn ngụ ý phải có đường "phê duyệt vượt sĩ số" cho vai trò đủ
 * thẩm quyền. `coQuyenVuotSiSo` do router truyền xuống theo đúng quyền
 * `don_vi.quan_ly`/`he_thong.quan_tri` của actor — không mở cho học vụ/giáo
 * vụ thường (`lop_hoc.quan_ly`), giữ đúng tinh thần "phê duyệt", không phải
 * "ai xếp lớp cũng vượt được".
 */
async function validateXepLop(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId: number;
  ngayVaoLop: string;
  coQuyenVuotSiSo?: boolean;
}) {
  const [student, lop] = await Promise.all([
    findHocSinhById(input.donViId, input.hocSinhId),
    findLopHocById(input.donViId, input.lopHocId),
  ]);

  if (!student) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  if (!lop) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  if (
    student.trangThai === "ngung_hoc" ||
    student.trangThai === "hoan_thanh"
  ) {
    throw new Error(
      "Học sinh đã ngừng học hoặc đã hoàn thành, không thể xếp lớp.",
    );
  }

  if (!input.ngayVaoLop) {
    throw new Error("Vui lòng chọn ngày vào lớp.");
  }

  if (
    student.ngayNhapHoc &&
    input.ngayVaoLop < student.ngayNhapHoc
  ) {
    throw new Error(
      "Ngày vào lớp không được trước ngày nhập học của học sinh.",
    );
  }

  const existingEnrollment = await findEnrollmentDangHoc(
    input.hocSinhId,
    input.lopHocId,
  );

  if (existingEnrollment) {
    throw new Error("Học sinh đã ở trong lớp này.");
  }

  let vuotSiSo = false;

  if (lop.siSoToiDa) {
    const total = await countHocSinhDangHocTrongLop(input.lopHocId);

    if (total >= lop.siSoToiDa) {
      if (!input.coQuyenVuotSiSo) {
        throw new Error("Lớp đã đủ sĩ số tối đa.");
      }

      vuotSiSo = true;
    }
  }

  return { student, lop, vuotSiSo };
}

export async function xepHocSinhVaoLop(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId: number;
  ngayVaoLop: string;
  coQuyenVuotSiSo?: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const { student, lop, vuotSiSo } = await validateXepLop(input);

  const created = await createEnrollment({
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    ngayVaoLop: input.ngayVaoLop,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.enroll_student",
    objectType: "HocSinhLopHoc",
    objectId: created ? String(created.id) : null,
    content: `Xếp học sinh ${student.hoTen} (${student.maHocSinh}) vào lớp ${lop.tenLop}${
      vuotSiSo ? " (vượt sĩ số tối đa, được duyệt bởi vai trò quản lý)" : ""
    }.`,
    ipAddress: input.ipAddress,
  });

  return created;
}

/**
 * Gộp "xếp lớp" + "lập phiếu xếp lớp" (và tuỳ chọn phiếu xác nhận nhập học)
 * thành 1 bước — đúng luồng UI mới: người dùng xác nhận 1 lần trên panel là
 * xong cả lưu lẫn có phiếu để in ngay, không cần thao tác lập phiếu riêng.
 */
export async function xepHocSinhVaoLopVaLapPhieu(input: {
  donViId: number;
  lopHocId: number;
  hocSinhId: number;
  ngayVaoLop: string;
  ghiChuPhieu?: string | null;
  kemPhieuNhapHoc?: boolean;
  ngayNhapHoc?: string | null;
  coQuyenVuotSiSo?: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const enrollment = await xepHocSinhVaoLop({
    donViId: input.donViId,
    lopHocId: input.lopHocId,
    hocSinhId: input.hocSinhId,
    ngayVaoLop: input.ngayVaoLop,
    coQuyenVuotSiSo: input.coQuyenVuotSiSo,
    actorUserId: input.actorUserId,
    ipAddress: input.ipAddress,
  });

  if (!enrollment) {
    throw new Error("Không thể xếp học sinh vào lớp.");
  }

  const phieuXepLopMoi = await lapPhieuXepLop({
    donViId: input.donViId,
    enrollmentId: enrollment.id,
    ghiChu: input.ghiChuPhieu,
    actorUserId: input.actorUserId,
    ipAddress: input.ipAddress,
  });

  let phieuNhapHocMoi = null;

  if (input.kemPhieuNhapHoc) {
    phieuNhapHocMoi = await lapPhieuNhapHoc({
      donViId: input.donViId,
      hocSinhId: input.hocSinhId,
      ngayNhapHoc: input.ngayNhapHoc || input.ngayVaoLop,
      ghiChu: null,
      actorUserId: input.actorUserId,
      ipAddress: input.ipAddress,
    });
  }

  return {
    enrollment,
    phieuXepLop: phieuXepLopMoi,
    phieuNhapHoc: phieuNhapHocMoi,
  };
}

export async function chuyenLopHocSinh(input: {
  donViId: number;
  enrollmentId: number;
  lopHocIdMoi: number;
  ngayChuyen: string;
  lyDo?: string | null;
  coQuyenVuotSiSo?: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findEnrollmentById(input.enrollmentId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy hồ sơ xếp lớp.");
  }

  if (found.enrollment.ngayRoiLop) {
    throw new Error("Hồ sơ xếp lớp này đã kết thúc.");
  }

  const { student, lop, vuotSiSo } = await validateXepLop({
    donViId: input.donViId,
    hocSinhId: found.enrollment.hocSinhId,
    lopHocId: input.lopHocIdMoi,
    ngayVaoLop: input.ngayChuyen,
    coQuyenVuotSiSo: input.coQuyenVuotSiSo,
  });

  await closeEnrollment({
    id: input.enrollmentId,
    ngayRoiLop: input.ngayChuyen,
    lyDoRoiLop: input.lyDo?.trim() || null,
    trangThai: "chuyen_lop",
  });

  const created = await createEnrollment({
    hocSinhId: found.enrollment.hocSinhId,
    lopHocId: input.lopHocIdMoi,
    ngayVaoLop: input.ngayChuyen,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.transfer_student",
    objectType: "HocSinhLopHoc",
    objectId: created ? String(created.id) : null,
    content: `Chuyển học sinh ${student.hoTen} (${student.maHocSinh}) sang lớp ${lop.tenLop}${
      vuotSiSo ? " (vượt sĩ số tối đa, được duyệt bởi vai trò quản lý)" : ""
    }.`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function ketThucXepLop(input: {
  donViId: number;
  enrollmentId: number;
  ngayRoiLop: string;
  lyDoRoiLop?: string | null;
  trangThai: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findEnrollmentById(input.enrollmentId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy hồ sơ xếp lớp.");
  }

  if (found.enrollment.ngayRoiLop) {
    throw new Error("Hồ sơ xếp lớp này đã kết thúc.");
  }

  if (
    input.trangThai !== "ngung_hoc" &&
    input.trangThai !== "hoan_thanh"
  ) {
    throw new Error("Trạng thái kết thúc không hợp lệ.");
  }

  if (!input.ngayRoiLop) {
    throw new Error("Vui lòng chọn ngày rời lớp.");
  }

  await closeEnrollment({
    id: input.enrollmentId,
    ngayRoiLop: input.ngayRoiLop,
    lyDoRoiLop: input.lyDoRoiLop?.trim() || null,
    trangThai: input.trangThai as "ngung_hoc" | "hoan_thanh",
  });

  // Đồng bộ ngược lại hồ sơ chung của học sinh: nếu đây là lượt xếp lớp đang
  // hoạt động (chưa hẳn duy nhất) cuối cùng kết thúc, hồ sơ chung phải phản
  // ánh đúng "đã hoàn thành/ngừng học", tránh lệch kiểu enrollment đã kết
  // thúc nhưng HocSinh.trangThai vẫn còn "dang_hoc" (xem D06, cùng tinh thần
  // đồng bộ một chiều ngược lại của `setHocSinhTrangThai`).
  const student = await findHocSinhById(
    input.donViId,
    found.enrollment.hocSinhId,
  );

  if (
    student &&
    (student.trangThai === "dang_hoc" || student.trangThai === "bao_luu")
  ) {
    const remainingActiveEnrollments = await listActiveEnrollmentsByHocSinh(
      found.enrollment.hocSinhId,
    );

    if (remainingActiveEnrollments.length === 0) {
      const trangThaiMoi = input.trangThai as "ngung_hoc" | "hoan_thanh";

      await updateHocSinhTrangThai({
        id: student.id,
        trangThai: trangThaiMoi,
      });

      await createTrangThaiLichSu({
        hocSinhId: student.id,
        trangThaiCu: student.trangThai,
        trangThaiMoi,
        lyDo: "Tự động đồng bộ khi lượt xếp lớp cuối cùng kết thúc.",
        ngayHieuLuc: input.ngayRoiLop,
        actorUserId: input.actorUserId,
      });
    }
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lop_hoc.end_enrollment",
    objectType: "HocSinhLopHoc",
    objectId: String(input.enrollmentId),
    content: `Kết thúc xếp lớp, trạng thái ${input.trangThai}.`,
    ipAddress: input.ipAddress,
  });
}

// ---------------------------------------------------------------
// Phiếu xếp lớp
// ---------------------------------------------------------------

async function sinhSoPhieuXepLop(donViId: number) {
  const nam = new Date().getFullYear();
  const prefix = `XL${nam}`;
  const total = await countPhieuXepLopTheoPrefix(donViId, prefix);

  return `${prefix}${String(total + 1).padStart(5, "0")}`;
}

export async function lapPhieuXepLop(input: {
  donViId: number;
  enrollmentId: number;
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findEnrollmentById(input.enrollmentId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy hồ sơ xếp lớp.");
  }

  const soPhieu = await sinhSoPhieuXepLop(input.donViId);

  const phieu = await createPhieuXepLop({
    donViId: input.donViId,
    enrollmentId: input.enrollmentId,
    hocSinhId: found.enrollment.hocSinhId,
    lopHocId: found.enrollment.lopHocId,
    soPhieu,
    nguoiLapId: input.actorUserId,
    ghiChu: input.ghiChu?.trim() || null,
  });

  if (!phieu) {
    throw new Error("Không thể lập phiếu xếp lớp.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "phieu_xep_lop.create",
    objectType: "PhieuXepLop",
    objectId: String(phieu.id),
    content: `Lập phiếu xếp lớp ${phieu.soPhieu} cho hồ sơ xếp lớp #${input.enrollmentId}.`,
    ipAddress: input.ipAddress,
  });

  return phieu;
}

export async function getPhieuXepLopDetail(donViId: number, id: number) {
  const found = await findPhieuXepLopById(donViId, id);

  if (!found) {
    throw new Error("Không tìm thấy phiếu xếp lớp trong đơn vị hiện tại.");
  }

  const mauIn = await getCauHinhMauIn(donViId);

  return {
    id: found.phieuXepLop.id,
    soPhieu: found.phieuXepLop.soPhieu,
    ghiChu: found.phieuXepLop.ghiChu,
    hocSinh: {
      id: found.hocSinh.id,
      maHocSinh: found.hocSinh.maHocSinh,
      hoTen: found.hocSinh.hoTen,
    },
    lopHoc: {
      id: found.lopHoc.id,
      maLop: found.lopHoc.maLop,
      tenLop: found.lopHoc.tenLop,
      phongHoc: found.lopHoc.phongHoc,
    },
    ngayVaoLop: found.enrollment.ngayVaoLop,
    ketQuaTestDauVao: found.hocSinh.ketQuaTestDauVao,
    nguoiLap: found.nguoiLap,
    donVi: {
      tenDonVi: found.donVi.tenDonVi,
      diaChi: found.donVi.diaChi,
      soDienThoai: found.donVi.soDienThoai,
      email: found.donVi.email,
      hinhAnhUrl: found.donVi.hinhAnhUrl,
    },
    mauIn: {
      hienThiLogo: mauIn.hienThiLogo,
      ghiChuFooter: mauIn.ghiChuFooter,
      nhanKyNguoiLap: mauIn.nhanKyNguoiLap,
      nhanKyNguoiNop: mauIn.nhanKyNguoiNop,
      nhanKyDaiDienDonVi: mauIn.nhanKyDaiDienDonVi,
    },
  };
}
