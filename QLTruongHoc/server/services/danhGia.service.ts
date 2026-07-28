import { createAuditLog } from "../db/audit.repository.js";
import {
  createDanhGia,
  deleteDanhGia,
  findDanhGiaById,
  listDanhGiaByHocSinh,
} from "../db/danhGia.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import { findEnrollmentById } from "../db/lopHoc.repository.js";

const LOAI_DANH_GIA_HOP_LE = ["giua_ky", "cuoi_ky", "khac"];

export async function listDanhGia(donViId: number, hocSinhId: number) {
  const hocSinh = await findHocSinhById(donViId, hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  return listDanhGiaByHocSinh(hocSinhId);
}

export async function addDanhGia(input: {
  donViId: number;
  hocSinhId: number;
  enrollmentId: number;
  loaiDanhGia: string;
  diemSo?: string | null;
  xepLoai?: string | null;
  nhanXet?: string | null;
  ngayDanhGia: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const enrollment = await findEnrollmentById(input.enrollmentId);

  if (!enrollment || enrollment.donViId !== input.donViId) {
    throw new Error("Không tìm thấy lượt xếp lớp trong đơn vị hiện tại.");
  }

  if (enrollment.enrollment.hocSinhId !== input.hocSinhId) {
    throw new Error("Lượt xếp lớp không thuộc học sinh này.");
  }

  if (!LOAI_DANH_GIA_HOP_LE.includes(input.loaiDanhGia)) {
    throw new Error("Loại đánh giá không hợp lệ.");
  }

  if (!input.ngayDanhGia) {
    throw new Error("Vui lòng chọn ngày đánh giá.");
  }

  const created = await createDanhGia({
    enrollmentId: input.enrollmentId,
    loaiDanhGia: input.loaiDanhGia as "giua_ky" | "cuoi_ky" | "khac",
    diemSo: input.diemSo || null,
    xepLoai: input.xepLoai?.trim() || null,
    nhanXet: input.nhanXet?.trim() || null,
    ngayDanhGia: input.ngayDanhGia,
    actorUserId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể ghi nhận kết quả học tập.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.them_danh_gia",
    objectType: "HocSinhLopHocDanhGia",
    objectId: String(created.id),
    content: `Ghi nhận kết quả học tập (${input.loaiDanhGia}) cho lượt xếp lớp #${input.enrollmentId}.`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function removeDanhGia(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findDanhGiaById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy kết quả học tập.");
  }

  await deleteDanhGia(input.id);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.xoa_danh_gia",
    objectType: "HocSinhLopHocDanhGia",
    objectId: String(input.id),
    content: `Xoá kết quả học tập #${input.id}.`,
    ipAddress: input.ipAddress,
  });
}
