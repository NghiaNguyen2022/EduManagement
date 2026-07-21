import {
  createAuditLog,
} from "../db/audit.repository.js";
import { findChuongTrinhById } from "../db/chuongTrinh.repository.js";
import { findGiaoVienById } from "../db/giaoVien.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import {
  closeEnrollment,
  countHocSinhDangHocTrongLop,
  createEnrollment,
  createLopHoc,
  createPhanCongGiaoVien,
  endPhanCongGiaoVien,
  findEnrollmentById,
  findEnrollmentDangHoc,
  findGiaoVienChinhDangHoatDong,
  findLopHocByMa,
  findLopHocById,
  findPhanCongGiaoVienById,
  listHocSinhTrongLop,
  listLopHocByDonVi,
  listPhanCongGiaoVien,
  setLopHocTrangThai,
  updateLopHoc,
} from "../db/lopHoc.repository.js";

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

export async function listLopHoc(donViId: number) {
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
  maLop: string;
  tenLop: string;
  capDo?: string | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  siSoToiDa?: number | null;
  phongHoc?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const maLop = input.maLop.trim().toUpperCase();
  const tenLop = input.tenLop.trim();

  if (!maLop) {
    throw new Error("Vui lòng nhập mã lớp.");
  }

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

  const existed = await findLopHocByMa(input.donViId, maLop);

  if (existed) {
    throw new Error("Mã lớp đã tồn tại.");
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

async function validateXepLop(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId: number;
  ngayVaoLop: string;
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

  if (lop.siSoToiDa) {
    const total = await countHocSinhDangHocTrongLop(input.lopHocId);

    if (total >= lop.siSoToiDa) {
      throw new Error("Lớp đã đủ sĩ số tối đa.");
    }
  }

  return { student, lop };
}

export async function xepHocSinhVaoLop(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId: number;
  ngayVaoLop: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const { student, lop } = await validateXepLop(input);

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
    content: `Xếp học sinh ${student.hoTen} (${student.maHocSinh}) vào lớp ${lop.tenLop}.`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function chuyenLopHocSinh(input: {
  donViId: number;
  enrollmentId: number;
  lopHocIdMoi: number;
  ngayChuyen: string;
  lyDo?: string | null;
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

  const { student, lop } = await validateXepLop({
    donViId: input.donViId,
    hocSinhId: found.enrollment.hocSinhId,
    lopHocId: input.lopHocIdMoi,
    ngayVaoLop: input.ngayChuyen,
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
    content: `Chuyển học sinh ${student.hoTen} (${student.maHocSinh}) sang lớp ${lop.tenLop}.`,
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
