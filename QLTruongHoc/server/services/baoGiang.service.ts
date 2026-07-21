import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  findBaoGiangByBuoiHoc,
  upsertBaoGiang,
} from "../db/baoGiang.repository.js";
import {
  findBuoiHocById,
} from "../db/lichHoc.repository.js";

async function requireBuoiHocKhaDung(donViId: number, buoiHocId: number) {
  const found = await findBuoiHocById(buoiHocId);

  if (!found || found.donViId !== donViId) {
    throw new Error("Không tìm thấy buổi học trong đơn vị hiện tại.");
  }

  return found;
}

export async function getBaoGiang(donViId: number, buoiHocId: number) {
  await requireBuoiHocKhaDung(donViId, buoiHocId);

  return findBaoGiangByBuoiHoc(buoiHocId);
}

export async function luuBaoGiang(input: {
  donViId: number;
  buoiHocId: number;
  noiDungBaiHoc?: string | null;
  baiTap?: string | null;
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await requireBuoiHocKhaDung(
    input.donViId,
    input.buoiHocId,
  );

  if (
    found.buoiHoc.trangThai === "nghi" ||
    found.buoiHoc.trangThai === "huy"
  ) {
    throw new Error(
      "Buổi học đã nghỉ hoặc đã huỷ, không thể ghi báo giảng.",
    );
  }

  const updated = await upsertBaoGiang({
    buoiHocId: input.buoiHocId,
    noiDungBaiHoc: input.noiDungBaiHoc?.trim() || null,
    baiTap: input.baiTap?.trim() || null,
    ghiChu: input.ghiChu?.trim() || null,
    actorUserId: input.actorUserId,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "bao_giang.save",
    objectType: "BuoiHoc",
    objectId: String(input.buoiHocId),
    content: `Ghi báo giảng buổi học ngày ${found.buoiHoc.ngayHoc}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}
