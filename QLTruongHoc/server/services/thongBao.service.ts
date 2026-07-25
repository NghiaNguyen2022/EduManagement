import { createAuditLog } from "../db/audit.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import { findLopHocById } from "../db/lopHoc.repository.js";
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
import { listHocSinh } from "./hocSinh.service.js";
import { listLopHoc } from "./lopHoc.service.js";
import { canGuardianAccessNotification } from "../domain/notification-scope.js";
import { toDatabaseDateTime } from "../utils/dateTime.js";

type PhamViThongBao = "toan_truong" | "theo_lop" | "ca_nhan";
export type GuardianNotificationScope = {
  organizationIds: number[];
  classIds: number[];
  studentIds: number[];
};

const PHAM_VI_HOP_LE: PhamViThongBao[] = ["toan_truong", "theo_lop", "ca_nhan"];

function normalizeText(value: string) {
  return value.trim();
}

export async function listThongBaoTargets(donViId: number) {
  await assertDonViChoPhepNghiepVu(donViId);

  const [classes, students] = await Promise.all([
    listLopHoc(donViId),
    listHocSinh(donViId),
  ]);

  return {
    classes: classes
      .filter((item) => !("lopHoc" in item) && item.trangThai !== "huy")
      .map((item) => {
        const value = "lopHoc" in item ? item.lopHoc : item;
        return { id: value.id, maLop: value.maLop, tenLop: value.tenLop };
      }),
    students: students
      .filter((item) => !("hocSinh" in item) && item.trangThai !== "ngung_hoc")
      .map((item) => {
        const value = "hocSinh" in item ? item.hocSinh : item;
        return { id: value.id, maHocSinh: value.maHocSinh, hoTen: value.hoTen };
      }),
  };
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
  guardianScope?: GuardianNotificationScope,
) {
  if (guardianScope) {
    return listThongBaoByDonViIds(guardianScope.organizationIds, userId ?? 0, {
      guardianClassIds: guardianScope.classIds,
      guardianStudentIds: guardianScope.studentIds,
    });
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
  lopHocId?: number | null;
  hocSinhId?: number | null;
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

  let lopHocId: number | null = null;
  let hocSinhId: number | null = null;
  let doiTuong: string | null = null;

  if (phamVi === "theo_lop") {
    if (!input.lopHocId) {
      throw new Error("Vui lòng chọn lớp nhận thông báo.");
    }

    const lopHoc = await findLopHocById(input.donViId, input.lopHocId);

    if (!lopHoc) {
      throw new Error("Không tìm thấy lớp trong đơn vị hiện tại.");
    }

    lopHocId = lopHoc.id;
    doiTuong = `${lopHoc.tenLop} (${lopHoc.maLop})`;
  }

  if (phamVi === "ca_nhan") {
    if (!input.hocSinhId) {
      throw new Error("Vui lòng chọn học sinh nhận thông báo.");
    }

    const hocSinh = await findHocSinhById(input.donViId, input.hocSinhId);

    if (!hocSinh) {
      throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
    }

    hocSinhId = hocSinh.id;
    doiTuong = `${hocSinh.hoTen} (${hocSinh.maHocSinh})`;
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
    lopHocId,
    hocSinhId,
    doiTuong,
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
  guardianScope?: GuardianNotificationScope;
}) {
  const thongBao = input.guardianScope
    ? await findThongBaoByIdAny(input.thongBaoId)
    : await findThongBaoById(input.donViId, input.thongBaoId);

  if (
    !thongBao ||
    (input.guardianScope &&
      !canGuardianAccessNotification({
        organizationId: thongBao.donViId,
        guardianOrganizationIds: input.guardianScope.organizationIds,
        scope: thongBao.phamVi,
        classId: thongBao.lopHocId,
        studentId: thongBao.hocSinhId,
        guardianClassIds: input.guardianScope.classIds,
        guardianStudentIds: input.guardianScope.studentIds,
      }))
  ) {
    throw new Error("Không tìm thấy thông báo trong đơn vị hiện tại.");
  }

  const existing = await findThongBaoDaDoc(input.thongBaoId, input.actorUserId);

  if (existing) {
    return existing;
  }

  const now = toDatabaseDateTime();

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
