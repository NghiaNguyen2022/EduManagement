import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  countGiaoVienTheoMaPrefix,
  createGiaoVien,
  findGiaoVienById,
  listGiaoVienByDonVi,
  setGiaoVienTrangThai,
  updateGiaoVien,
} from "../db/giaoVien.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";

async function sinhMaGiaoVien(donViId: number) {
  const total = await countGiaoVienTheoMaPrefix(donViId, "GV");
  return `GV${String(total + 1).padStart(6, "0")}`;
}

export async function listGiaoVien(donViId: number) {
  return listGiaoVienByDonVi(donViId);
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
