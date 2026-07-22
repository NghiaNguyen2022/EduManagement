import { createAuditLog } from "../db/audit.repository.js";
import {
  createThongBaoDaDoc,
  countThongBaoTheoMaPrefix,
  createThongBao,
  findThongBaoById,
  findThongBaoByIdAny,
  findThongBaoDaDoc,
  listThongBaoAllDonVi,
  listThongBaoByDonVi,
  listThongBaoByDonViIds,
} from "../db/thongBao.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";

type PhamViThongBao = "toan_truong" | "theo_lop" | "ca_nhan";

const PHAM_VI_HOP_LE: PhamViThongBao[] = ["toan_truong", "theo_lop", "ca_nhan"];

function normalizeText(value: string) {
  return value.trim();
}

async function sinhMaThongBao(donViId: number) {
  const nam = new Date().getFullYear();
  const prefix = `TB${nam}`;
  const total = await countThongBaoTheoMaPrefix(donViId, prefix);

  return `${prefix}${String(total + 1).padStart(4, "0")}`;
}

export async function listThongBao(
  donViId: number,
  loaiDonVi?: string,
  userId?: number,
  /**
   * Chỉ truyền khi người gọi là phụ huynh xem gộp theo các đơn vị con đang
   * học — ưu tiên hơn `loaiDonVi === "he_thong"`, vì đơn vị "đang chọn" của
   * phụ huynh chỉ là nơi neo phiên đăng nhập, không phải phạm vi xem thật.
   */
  guardianDonViIds?: number[],
) {
  if (guardianDonViIds) {
    return listThongBaoByDonViIds(guardianDonViIds, userId ?? 0);
  }

  if (loaiDonVi === "he_thong") {
    return listThongBaoAllDonVi(userId ?? 0);
  }

  return listThongBaoByDonVi(donViId, userId ?? 0);
}

export async function createThongBaoMoi(input: {
  donViId: number;
  tieuDe: string;
  noiDung: string;
  tepDinhKemTen?: string | null;
  tepDinhKemUrl?: string | null;
  phamVi: string;
  doiTuong?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const tieuDe = normalizeText(input.tieuDe);
  const noiDung = normalizeText(input.noiDung);
  const tepDinhKemTen = normalizeText(input.tepDinhKemTen ?? "");
  const tepDinhKemUrl = normalizeText(input.tepDinhKemUrl ?? "");
  const phamVi = input.phamVi as PhamViThongBao;

  if (!tieuDe) {
    throw new Error("Vui lòng nhập tiêu đề thông báo.");
  }

  if (!noiDung) {
    throw new Error("Vui lòng nhập nội dung thông báo.");
  }

  if ((tepDinhKemTen && !tepDinhKemUrl) || (!tepDinhKemTen && tepDinhKemUrl)) {
    throw new Error("Vui lòng nhập đủ tên và liên kết đính kèm, hoặc để trống cả hai.");
  }

  if (!PHAM_VI_HOP_LE.includes(phamVi)) {
    throw new Error("Phạm vi thông báo không hợp lệ.");
  }

  const doiTuong = normalizeText(input.doiTuong ?? "");

  if (phamVi !== "toan_truong" && !doiTuong) {
    throw new Error("Vui lòng nhập đối tượng áp dụng cho phạm vi đã chọn.");
  }

  const maThongBao = await sinhMaThongBao(input.donViId);

  const created = await createThongBao({
    donViId: input.donViId,
    maThongBao,
    tieuDe,
    noiDung,
    tepDinhKemTen: tepDinhKemTen || null,
    tepDinhKemUrl: tepDinhKemUrl || null,
    phamVi,
    doiTuong: phamVi === "toan_truong" ? null : doiTuong,
    nguoiTaoId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể tạo thông báo.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "thong_bao.create",
    objectType: "ThongBao",
    objectId: String(created.id),
    content: `Tạo thông báo ${created.maThongBao} (${created.tieuDe}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function confirmThongBaoDaDoc(input: {
  donViId: number;
  thongBaoId: number;
  actorUserId: number;
  ipAddress?: string;
  /** Xem ghi chú ở `listThongBao` — đơn vị đang chọn không nhất thiết là đơn vị sở hữu thông báo. */
  guardianDonViIds?: number[];
}) {
  const thongBao = input.guardianDonViIds
    ? await findThongBaoByIdAny(input.thongBaoId)
    : await findThongBaoById(input.donViId, input.thongBaoId);

  if (!thongBao || (input.guardianDonViIds && !input.guardianDonViIds.includes(thongBao.donViId))) {
    throw new Error("Không tìm thấy thông báo trong đơn vị hiện tại.");
  }

  const existing = await findThongBaoDaDoc(input.thongBaoId, input.actorUserId);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const created = await createThongBaoDaDoc({
    thongBaoId: input.thongBaoId,
    nguoiDungId: input.actorUserId,
    daDocAt: now,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "thong_bao.mark_read",
    objectType: "ThongBao",
    objectId: String(input.thongBaoId),
    content: `Xác nhận đã đọc thông báo ${thongBao.maThongBao} (${thongBao.tieuDe}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}
