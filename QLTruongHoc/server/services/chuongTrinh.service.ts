import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createChuongTrinh,
  findChuongTrinhByMa,
  findChuongTrinhById,
  listChuongTrinhByDonVi,
  setChuongTrinhTrangThai,
  updateChuongTrinh,
} from "../db/chuongTrinh.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";

export async function listChuongTrinh(donViId: number) {
  return listChuongTrinhByDonVi(donViId);
}

export async function createChuongTrinhMoi(input: {
  donViId: number;
  maChuongTrinh: string;
  tenChuongTrinh: string;
  capDo?: string | null;
  tongSoBuoi?: number | null;
  tongSoGio?: string | null;
  moTa?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const maChuongTrinh = input.maChuongTrinh.trim().toUpperCase();
  const tenChuongTrinh = input.tenChuongTrinh.trim();

  if (!maChuongTrinh) {
    throw new Error("Vui lòng nhập mã chương trình.");
  }

  if (!tenChuongTrinh) {
    throw new Error("Vui lòng nhập tên chương trình.");
  }

  const existed = await findChuongTrinhByMa(
    input.donViId,
    maChuongTrinh,
  );

  if (existed) {
    throw new Error("Mã chương trình đã tồn tại.");
  }

  const created = await createChuongTrinh({
    donViId: input.donViId,
    maChuongTrinh,
    tenChuongTrinh,
    capDo: input.capDo?.trim() || null,
    tongSoBuoi: input.tongSoBuoi ?? null,
    tongSoGio: input.tongSoGio ?? null,
    moTa: input.moTa?.trim() || null,
  });

  if (!created) {
    throw new Error("Không thể tạo chương trình.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "chuong_trinh.create",
    objectType: "ChuongTrinhDaoTao",
    objectId: String(created.id),
    content: `Tạo chương trình ${created.tenChuongTrinh} (${created.maChuongTrinh}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function updateChuongTrinhThongTin(input: {
  donViId: number;
  id: number;
  tenChuongTrinh: string;
  capDo?: string | null;
  tongSoBuoi?: number | null;
  tongSoGio?: string | null;
  moTa?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findChuongTrinhById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy chương trình.");
  }

  const tenChuongTrinh = input.tenChuongTrinh.trim();

  if (!tenChuongTrinh) {
    throw new Error("Vui lòng nhập tên chương trình.");
  }

  const updated = await updateChuongTrinh({
    id: input.id,
    tenChuongTrinh,
    capDo: input.capDo?.trim() || null,
    tongSoBuoi: input.tongSoBuoi ?? null,
    tongSoGio: input.tongSoGio ?? null,
    moTa: input.moTa?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật chương trình.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "chuong_trinh.update",
    objectType: "ChuongTrinhDaoTao",
    objectId: String(updated.id),
    content: `Cập nhật chương trình ${updated.tenChuongTrinh} (${updated.maChuongTrinh}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function setChuongTrinhStatus(input: {
  donViId: number;
  id: number;
  trangThai: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findChuongTrinhById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy chương trình.");
  }

  if (
    input.trangThai !== "hoat_dong" &&
    input.trangThai !== "ngung_hoat_dong"
  ) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  const updated = await setChuongTrinhTrangThai({
    id: input.id,
    trangThai: input.trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật trạng thái.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "chuong_trinh.set_status",
    objectType: "ChuongTrinhDaoTao",
    objectId: String(updated.id),
    content: `Đổi trạng thái chương trình ${updated.tenChuongTrinh} sang ${input.trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}
