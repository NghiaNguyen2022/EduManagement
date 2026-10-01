import { createAuditLog } from "../db/audit.repository.js";
import {
  createTraoDoi,
  listTraoDoiAllDonVi,
  listTraoDoiByDonVi,
} from "../db/traoDoi.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import { findLopHocById, listActiveEnrollmentsByHocSinh } from "../db/lopHoc.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";

type NguoiGuiVaiTro = "giao_vien" | "phu_huynh" | "hoc_vu" | "khac";
type KenhLienLac = "truc_tiep" | "dien_thoai" | "nhan_tin" | "email" | "khac";

const NGUOI_GUI_HOP_LE: NguoiGuiVaiTro[] = ["giao_vien", "phu_huynh", "hoc_vu", "khac"];

const KENH_HOP_LE: KenhLienLac[] = ["truc_tiep", "dien_thoai", "nhan_tin", "email", "khac"];

function normalizeText(value: string) {
  return value.trim();
}

export async function listTraoDoi(
  donViId: number,
  loaiDonVi?: string,
  filters: { hocSinhId?: number; lopHocId?: number } = {},
) {
  if (loaiDonVi === "he_thong") {
    return listTraoDoiAllDonVi(filters);
  }

  return listTraoDoiByDonVi(donViId, filters);
}

export async function createTraoDoiMoi(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId?: number | null;
  nguoiGuiVaiTro: string;
  kenhLienLac: string;
  noiDung: string;
  ketQua?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const hocSinh = await findHocSinhById(input.donViId, input.hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  const noiDung = normalizeText(input.noiDung);

  if (!noiDung) {
    throw new Error("Vui lòng nhập nội dung trao đổi.");
  }

  if (!NGUOI_GUI_HOP_LE.includes(input.nguoiGuiVaiTro as NguoiGuiVaiTro)) {
    throw new Error("Vai trò người ghi trao đổi không hợp lệ.");
  }

  if (!KENH_HOP_LE.includes(input.kenhLienLac as KenhLienLac)) {
    throw new Error("Kênh liên lạc không hợp lệ.");
  }

  if (input.lopHocId) {
    const lopHoc = await findLopHocById(input.donViId, input.lopHocId);

    if (!lopHoc) {
      throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
    }

    const activeEnrollments = await listActiveEnrollmentsByHocSinh(input.hocSinhId);

    if (!activeEnrollments.some((enrollment) => enrollment.lopHocId === input.lopHocId)) {
      throw new Error("Học sinh chưa đang theo học lớp đã chọn.");
    }
  }

  const created = await createTraoDoi({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId ?? null,
    nguoiGuiVaiTro: input.nguoiGuiVaiTro as NguoiGuiVaiTro,
    kenhLienLac: input.kenhLienLac as KenhLienLac,
    noiDung,
    ketQua: normalizeText(input.ketQua ?? "") || null,
    nguoiTaoId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể tạo trao đổi.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "trao_doi.create",
    objectType: "TraoDoiHocSinh",
    objectId: String(created.traoDoi.id),
    content: `Tạo trao đổi cho học sinh ${created.hocSinh.hoTen} (${created.hocSinh.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}
