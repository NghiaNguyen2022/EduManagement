import { hash } from "bcryptjs";

import { buildTeacherUsername } from "../domain/teacher-account.js";
import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  countGiaoVienTheoMaPrefix,
  createGiaoVien,
  findGiaoVienById,
  listGiaoVienAllDonVi,
  listGiaoVienByDonVi,
  setGiaoVienTrangThai,
  updateGiaoVien,
  updateGiaoVienNguoiDungId,
} from "../db/giaoVien.repository.js";
import { findRoleByCode } from "../db/role.repository.js";
import {
  createUserWithRole,
  findUserById,
  findUserByUsername,
} from "../db/user.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";
import { createTemporaryPassword } from "./user.service.js";

async function sinhMaGiaoVien(donViId: number) {
  const total = await countGiaoVienTheoMaPrefix(donViId, "GV");
  return `GV${String(total + 1).padStart(6, "0")}`;
}

export async function listGiaoVien(donViId: number, loaiDonVi?: string) {
  if (loaiDonVi === "he_thong") {
    return listGiaoVienAllDonVi();
  }

  return listGiaoVienByDonVi(donViId);
}

export async function getGiaoVienDetail(donViId: number, id: number) {
  const found = await findGiaoVienById(donViId, id);

  if (!found) {
    throw new Error("Không tìm thấy giáo viên trong đơn vị hiện tại.");
  }

  return found;
}

export async function createGiaoVienMoi(input: {
  donViId: number;
  hoTen: string;
  dienThoai?: string | null;
  email?: string | null;
  chuyenMon?: string | null;
  trinhDo?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const hoTen = input.hoTen.trim();

  if (!hoTen) {
    throw new Error("Vui lòng nhập họ tên giáo viên.");
  }

  const maGiaoVien = await sinhMaGiaoVien(input.donViId);

  const created = await createGiaoVien({
    donViId: input.donViId,
    maGiaoVien,
    hoTen,
    dienThoai: input.dienThoai?.trim() || null,
    email: input.email?.trim() || null,
    chuyenMon: input.chuyenMon?.trim() || null,
    trinhDo: input.trinhDo?.trim() || null,
    nguoiDungId: null,
  });

  if (!created) {
    throw new Error("Không thể tạo hồ sơ giáo viên.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "giao_vien.create",
    objectType: "GiaoVien",
    objectId: String(created.id),
    content: `Tạo hồ sơ giáo viên ${created.hoTen} (${created.maGiaoVien}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function updateGiaoVienThongTin(input: {
  donViId: number;
  id: number;
  hoTen: string;
  dienThoai?: string | null;
  email?: string | null;
  chuyenMon?: string | null;
  trinhDo?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findGiaoVienById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy giáo viên.");
  }

  const hoTen = input.hoTen.trim();

  if (!hoTen) {
    throw new Error("Vui lòng nhập họ tên giáo viên.");
  }

  const updated = await updateGiaoVien({
    id: input.id,
    hoTen,
    dienThoai: input.dienThoai?.trim() || null,
    email: input.email?.trim() || null,
    chuyenMon: input.chuyenMon?.trim() || null,
    trinhDo: input.trinhDo?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật giáo viên.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "giao_vien.update",
    objectType: "GiaoVien",
    objectId: String(updated.id),
    content: `Cập nhật hồ sơ giáo viên ${updated.hoTen} (${updated.maGiaoVien}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function setGiaoVienStatus(input: {
  donViId: number;
  id: number;
  trangThai: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findGiaoVienById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy giáo viên.");
  }

  if (
    input.trangThai !== "hoat_dong" &&
    input.trangThai !== "ngung_hoat_dong"
  ) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  const updated = await setGiaoVienTrangThai({
    id: input.id,
    trangThai: input.trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật trạng thái.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "giao_vien.set_status",
    objectType: "GiaoVien",
    objectId: String(updated.id),
    content: `Đổi trạng thái giáo viên ${updated.hoTen} sang ${input.trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

async function sinhTenDangNhapGiaoVien(hoTen: string) {
  let soThuTu = 0;
  let candidate = buildTeacherUsername(hoTen, soThuTu);

  while (await findUserByUsername(candidate)) {
    soThuTu += 1;
    candidate = buildTeacherUsername(hoTen, soThuTu);
  }

  return candidate;
}

export async function createGiaoVienAccount(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const teacher = await findGiaoVienById(input.donViId, input.id);

  if (!teacher) {
    throw new Error("Không tìm thấy giáo viên trong đơn vị hiện tại.");
  }

  if (teacher.nguoiDungId) {
    const existingUser = await findUserById(teacher.nguoiDungId);

    return {
      created: false as const,
      nguoiDungId: teacher.nguoiDungId,
      tenDangNhap: existingUser?.tenDangNhap ?? null,
      temporaryPassword: null,
    };
  }

  if (teacher.trangThai !== "hoat_dong") {
    throw new Error(
      "Chỉ có thể tạo tài khoản cho giáo viên đang hoạt động.",
    );
  }

  const role = await findRoleByCode("giao_vien");

  if (!role) {
    throw new Error("Chưa cấu hình vai trò giáo viên trong hệ thống.");
  }

  const tenDangNhap = await sinhTenDangNhapGiaoVien(teacher.hoTen);
  const temporaryPassword = createTemporaryPassword();
  const passwordHash = await hash(temporaryPassword, 12);

  let createdUser;

  try {
    createdUser = await createUserWithRole({
      username: tenDangNhap,
      passwordHash,
      fullName: teacher.hoTen,
      email: teacher.email,
      phone: teacher.dienThoai,
      roleId: role.id,
      organizationId: input.donViId,
    });
  } catch {
    throw new Error(
      "Không thể tạo tài khoản. Email hoặc số điện thoại có thể đã được dùng cho tài khoản khác.",
    );
  }

  await updateGiaoVienNguoiDungId({
    id: teacher.id,
    nguoiDungId: createdUser.id,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "giao_vien.create_account",
    objectType: "GiaoVien",
    objectId: String(teacher.id),
    content: `Tạo tài khoản đăng nhập ${tenDangNhap} cho giáo viên ${teacher.hoTen} (${teacher.maGiaoVien}).`,
    ipAddress: input.ipAddress,
  });

  return {
    created: true as const,
    nguoiDungId: createdUser.id,
    tenDangNhap,
    temporaryPassword,
  };
}
