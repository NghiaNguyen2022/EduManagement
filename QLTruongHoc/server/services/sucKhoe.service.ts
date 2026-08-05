import { createAuditLog } from "../db/audit.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import {
  createSucKhoe,
  deleteSucKhoe,
  findSucKhoeById,
  listSucKhoeByHocSinh,
  syncHocSinhSucKhoeSnapshot,
} from "../db/sucKhoe.repository.js";
import { notifyGuardiansOfHocSinh } from "./phuHuynh.service.js";

const LOAI_GHI_NHAN_HOP_LE = ["theo_tuan", "theo_thang", "theo_quy", "khac"];

export async function listSucKhoe(donViId: number, hocSinhId: number) {
  const hocSinh = await findHocSinhById(donViId, hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  return listSucKhoeByHocSinh(hocSinhId);
}

export async function addSucKhoe(input: {
  donViId: number;
  hocSinhId: number;
  ngayGhiNhan: string;
  loaiGhiNhan: string;
  chieuCaoCm?: string | null;
  canNangKg?: string | null;
  diUngBenhNen?: string | null;
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const hocSinh = await findHocSinhById(input.donViId, input.hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  if (!input.ngayGhiNhan) {
    throw new Error("Vui lòng chọn ngày ghi nhận.");
  }

  if (!LOAI_GHI_NHAN_HOP_LE.includes(input.loaiGhiNhan)) {
    throw new Error("Loại ghi nhận không hợp lệ.");
  }

  const chieuCaoCm = input.chieuCaoCm?.trim() || null;
  const canNangKg = input.canNangKg?.trim() || null;
  const diUngBenhNen = input.diUngBenhNen?.trim() || null;

  if (!chieuCaoCm && !canNangKg && !diUngBenhNen && !input.ghiChu?.trim()) {
    throw new Error("Vui lòng nhập ít nhất một chỉ số hoặc ghi chú.");
  }

  const created = await createSucKhoe({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    ngayGhiNhan: input.ngayGhiNhan,
    loaiGhiNhan: input.loaiGhiNhan as "theo_tuan" | "theo_thang" | "theo_quy" | "khac",
    chieuCaoCm,
    canNangKg,
    diUngBenhNen,
    ghiChu: input.ghiChu?.trim() || null,
    actorUserId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể ghi nhận sổ sức khỏe.");
  }

  // Đồng bộ ngược 3 cột tĩnh trên HocSinh bằng giá trị mới nhất — chỉ ghi
  // đè khi lần ghi này có giá trị, tránh xoá mất dữ liệu cũ bằng ô trống.
  await syncHocSinhSucKhoeSnapshot({
    hocSinhId: input.hocSinhId,
    chieuCaoCm: chieuCaoCm ?? hocSinh.chieuCaoCm,
    canNangKg: canNangKg ?? hocSinh.canNangKg,
    diUngBenhNen: diUngBenhNen ?? hocSinh.diUngBenhNen,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.them_suc_khoe",
    objectType: "HocSinhSucKhoe",
    objectId: String(created.id),
    content: `Ghi nhận sổ sức khỏe (${input.loaiGhiNhan}) cho học sinh ${hocSinh.hoTen} (${hocSinh.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  await notifyGuardiansOfHocSinh({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    loaiSuKien: "suc_khoe.moi",
    tieuDe: "Cập nhật sổ sức khỏe",
    noiDung: `Nhà trường vừa ghi nhận sổ sức khỏe mới cho ${hocSinh.hoTen}.`,
  });

  return created;
}

export async function removeSucKhoe(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findSucKhoeById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy bản ghi sổ sức khỏe.");
  }

  await deleteSucKhoe(input.id);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.xoa_suc_khoe",
    objectType: "HocSinhSucKhoe",
    objectId: String(input.id),
    content: `Xoá bản ghi sổ sức khỏe #${input.id}.`,
    ipAddress: input.ipAddress,
  });
}
