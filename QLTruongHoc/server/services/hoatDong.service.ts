import { createAuditLog } from "../db/audit.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import {
  createHoatDong,
  deleteHoatDong,
  findHoatDongById,
  listHoatDongByLopHoc,
} from "../db/hoatDong.repository.js";
import {
  findLopHocById,
  listActiveEnrollmentsByHocSinh,
  listHocSinhTrongLop,
} from "../db/lopHoc.repository.js";
import { findGuardianChildByHocSinhId, notifyGuardiansOfHocSinh } from "./phuHuynh.service.js";

export async function listHoatDong(donViId: number, lopHocId: number) {
  const lopHoc = await findLopHocById(donViId, lopHocId);

  if (!lopHoc) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  return listHoatDongByLopHoc(lopHocId);
}

/**
 * Album ảnh cho phụ huynh xem — chỉ đúng lớp đang học hiện tại của con, và
 * chỉ những hoạt động không gắn thẻ học sinh nào (áp dụng cả lớp) hoặc có
 * gắn thẻ đúng con của phụ huynh này.
 */
export async function listHoatDongForGuardian(userId: number, hocSinhId: number) {
  const child = await findGuardianChildByHocSinhId(userId, hocSinhId);

  if (!child) {
    throw new Error("Không tìm thấy học sinh trong danh sách con của bạn.");
  }

  const activeEnrollments = await listActiveEnrollmentsByHocSinh(hocSinhId);
  const lopHocIds = [...new Set(activeEnrollments.map((item) => item.lopHocId))];

  const rowsByLop = await Promise.all(lopHocIds.map((id) => listHoatDongByLopHoc(id)));

  return rowsByLop
    .flat()
    .filter((row) => row.hocSinhIds.length === 0 || row.hocSinhIds.includes(hocSinhId))
    .sort((a, b) => (a.hoatDong.ngayHoatDong < b.hoatDong.ngayHoatDong ? 1 : -1));
}

export async function addHoatDong(input: {
  donViId: number;
  lopHocId: number;
  ngayHoatDong: string;
  tieuDe: string;
  moTa?: string | null;
  urls: string[];
  hocSinhIds?: number[];
  actorUserId: number;
  ipAddress?: string;
}) {
  const lopHoc = await findLopHocById(input.donViId, input.lopHocId);

  if (!lopHoc) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  const tieuDe = input.tieuDe.trim();

  if (!tieuDe) {
    throw new Error("Vui lòng nhập tiêu đề hoạt động.");
  }

  if (!input.ngayHoatDong) {
    throw new Error("Vui lòng chọn ngày hoạt động.");
  }

  if (input.urls.length === 0) {
    throw new Error("Vui lòng tải lên ít nhất một ảnh.");
  }

  const hocSinhIds = input.hocSinhIds ?? [];

  for (const hocSinhId of hocSinhIds) {
    const hocSinh = await findHocSinhById(input.donViId, hocSinhId);

    if (!hocSinh) {
      throw new Error("Một học sinh được gắn thẻ không thuộc đơn vị hiện tại.");
    }
  }

  const created = await createHoatDong({
    donViId: input.donViId,
    lopHocId: input.lopHocId,
    ngayHoatDong: input.ngayHoatDong,
    tieuDe,
    moTa: input.moTa?.trim() || null,
    urls: input.urls,
    hocSinhIds,
    actorUserId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể đăng ảnh hoạt động.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoat_dong.create",
    objectType: "HoatDongLopHoc",
    objectId: String(created.hoatDong.id),
    content: `Đăng ảnh hoạt động "${tieuDe}" cho lớp ${lopHoc.tenLop} (${created.anh.length} ảnh).`,
    ipAddress: input.ipAddress,
  });

  // Báo phụ huynh: nếu có gắn thẻ học sinh cụ thể thì chỉ báo đúng (các) con
  // đó; không thì báo cả lớp (roster đang học/bảo lưu).
  const targetHocSinhIds =
    hocSinhIds.length > 0
      ? hocSinhIds
      : (await listHocSinhTrongLop(input.lopHocId))
          .filter((row) => row.enrollment.trangThai === "dang_hoc" || row.enrollment.trangThai === "bao_luu")
          .map((row) => row.hocSinh.id);

  await Promise.all(
    targetHocSinhIds.map((hocSinhId) =>
      notifyGuardiansOfHocSinh({
        donViId: input.donViId,
        hocSinhId,
        loaiSuKien: "hoat_dong.moi",
        tieuDe: "Ảnh hoạt động lớp mới",
        noiDung: `Lớp ${lopHoc.tenLop} vừa có ảnh hoạt động mới: "${tieuDe}".`,
      }),
    ),
  );

  return created;
}

export async function removeHoatDong(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findHoatDongById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy hoạt động.");
  }

  await deleteHoatDong(input.id);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoat_dong.delete",
    objectType: "HoatDongLopHoc",
    objectId: String(input.id),
    content: `Xoá hoạt động "${found.tieuDe}".`,
    ipAddress: input.ipAddress,
  });
}
