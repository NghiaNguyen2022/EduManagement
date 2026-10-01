import { createAuditLog } from "../db/audit.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import {
  createThanhTich,
  deleteThanhTich,
  findThanhTichById,
  listThanhTichByHocSinh,
} from "../db/thanhTich.repository.js";

export async function listThanhTich(donViId: number, hocSinhId: number) {
  const hocSinh = await findHocSinhById(donViId, hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  return listThanhTichByHocSinh(hocSinhId);
}

export async function addThanhTich(input: {
  donViId: number;
  hocSinhId: number;
  tenThanhTich: string;
  ketQua?: string | null;
  ngayDat?: string | null;
  noiCap?: string | null;
  tepMinhChungUrl?: string | null;
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const hocSinh = await findHocSinhById(input.donViId, input.hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  const tenThanhTich = input.tenThanhTich.trim();

  if (!tenThanhTich) {
    throw new Error("Vui lòng nhập tên chứng chỉ/thành tích.");
  }

  const created = await createThanhTich({
    hocSinhId: input.hocSinhId,
    tenThanhTich,
    ketQua: input.ketQua?.trim() || null,
    ngayDat: input.ngayDat || null,
    noiCap: input.noiCap?.trim() || null,
    tepMinhChungUrl: input.tepMinhChungUrl?.trim() || null,
    ghiChu: input.ghiChu?.trim() || null,
    actorUserId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể ghi nhận chứng chỉ/thành tích.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.them_thanh_tich",
    objectType: "HocSinhThanhTich",
    objectId: String(created.id),
    content: `Ghi nhận thành tích "${tenThanhTich}" cho học sinh ${hocSinh.hoTen} (${hocSinh.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function removeThanhTich(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findThanhTichById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy chứng chỉ/thành tích.");
  }

  await deleteThanhTich(input.id);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.xoa_thanh_tich",
    objectType: "HocSinhThanhTich",
    objectId: String(input.id),
    content: `Xoá thành tích "${found.thanhTich.tenThanhTich}".`,
    ipAddress: input.ipAddress,
  });
}
