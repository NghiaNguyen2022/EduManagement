import {
  findDiemDanh,
  upsertDiemDanh,
} from "../db/diemDanh.repository.js";
import { listBuoiHocByLopHoc } from "../db/lichHoc.repository.js";
import { findLopHocById, listActiveEnrollmentsByHocSinh } from "../db/lopHoc.repository.js";
import {
  createDonXinPhep,
  findDonXinPhepById,
  listDonXinPhepByDonVi,
  listDonXinPhepByHocSinhIds,
  updateDonXinPhepTrangThai,
} from "../db/xinPhep.repository.js";
import { createAuditLog } from "../db/audit.repository.js";
import { findGuardianChildByHocSinhId } from "./phuHuynh.service.js";
import { listHocSinhByPhuHuynhId, listPhuHuynhByNguoiDungId } from "../db/phuHuynh.repository.js";

function normalizeText(value: string) {
  return value.trim();
}

export async function createDonXinPhepByGuardian(input: {
  actorUserId: number;
  hocSinhId: number;
  lopHocId: number;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  ipAddress?: string;
}) {
  const child = await findGuardianChildByHocSinhId(input.actorUserId, input.hocSinhId);

  if (!child) {
    throw new Error("Không tìm thấy học sinh trong danh sách con của bạn.");
  }

  if (!input.lopHocId) {
    throw new Error("Vui lòng chọn lớp cần xin phép.");
  }

  const enrollments = await listActiveEnrollmentsByHocSinh(input.hocSinhId);
  const enrolled = enrollments.some((item) => item.lopHocId === input.lopHocId);

  if (!enrolled) {
    throw new Error("Học sinh hiện không học lớp này.");
  }

  const lyDo = normalizeText(input.lyDo);

  if (!lyDo) {
    throw new Error("Vui lòng nhập lý do xin phép.");
  }

  if (!input.tuNgay || !input.denNgay) {
    throw new Error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
  }

  if (input.tuNgay > input.denNgay) {
    throw new Error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
  }

  const lopHocRow = await findLopHocById(child.donViId, input.lopHocId);

  const created = await createDonXinPhep({
    donViId: child.donViId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    tuNgay: input.tuNgay,
    denNgay: input.denNgay,
    lyDo,
    nguoiTaoId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể tạo đơn xin phép.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: child.donViId,
    action: "xin_phep.create",
    objectType: "DonXinPhep",
    objectId: String(created.id),
    content: `Gửi đơn xin phép cho học sinh ${child.hoTen} (${child.maHocSinh}) lớp ${lopHocRow?.tenLop ?? input.lopHocId} từ ${input.tuNgay} đến ${input.denNgay}.`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function listDonXinPhepByGuardian(userId: number) {
  const guardians = await listPhuHuynhByNguoiDungId(userId);

  const hocSinhIds = Array.from(
    new Set(
      (
        await Promise.all(
          guardians.map((guardian) => listHocSinhByPhuHuynhId(guardian.id)),
        )
      )
        .flat()
        .map((row) => row.hocSinh.id),
    ),
  );

  return listDonXinPhepByHocSinhIds(hocSinhIds);
}

export async function listDonXinPhepStaff(donViId: number, trangThai?: string) {
  return listDonXinPhepByDonVi(donViId, trangThai);
}

export async function duyetDonXinPhep(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  chapNhan: boolean;
  ghiChuDuyet?: string | null;
  ipAddress?: string;
}) {
  const found = await findDonXinPhepById(input.donViId, input.id);

  if (!found) {
    throw new Error("Không tìm thấy đơn xin phép trong đơn vị hiện tại.");
  }

  if (found.trangThai !== "cho_duyet") {
    throw new Error("Đơn đã được xử lý.");
  }

  let soBuoiCapNhat = 0;

  if (input.chapNhan) {
    const enrollments = await listActiveEnrollmentsByHocSinh(found.hocSinhId);
    const enrollment = enrollments.find((item) => item.lopHocId === found.lopHocId);

    const tuNgay =
      enrollment && enrollment.ngayVaoLop > found.tuNgay ? enrollment.ngayVaoLop : found.tuNgay;
    const denNgay =
      enrollment?.ngayRoiLop && enrollment.ngayRoiLop < found.denNgay
        ? enrollment.ngayRoiLop
        : found.denNgay;

    if (enrollment && tuNgay <= denNgay) {
      const buoiList = await listBuoiHocByLopHoc({
        lopHocId: found.lopHocId,
        tuNgay,
        denNgay,
      });

      for (const buoi of buoiList) {
        if (buoi.trangThai === "nghi" || buoi.trangThai === "huy") {
          continue;
        }

        const existing = await findDiemDanh(buoi.id, found.hocSinhId);

        if (existing) {
          continue;
        }

        await upsertDiemDanh({
          buoiHocId: buoi.id,
          hocSinhId: found.hocSinhId,
          trangThai: "vang_co_phep",
          ghiChu: `Theo đơn xin phép #${found.id}`,
          nhanXet: null,
          actorUserId: input.actorUserId,
        });

        soBuoiCapNhat += 1;
      }
    }
  }

  await updateDonXinPhepTrangThai({
    id: input.id,
    trangThai: input.chapNhan ? "da_duyet" : "tu_choi",
    nguoiDuyetId: input.actorUserId,
    ghiChuDuyet: input.ghiChuDuyet?.trim() || null,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: input.chapNhan ? "xin_phep.duyet" : "xin_phep.tu_choi",
    objectType: "DonXinPhep",
    objectId: String(input.id),
    content: input.chapNhan
      ? `Duyệt đơn xin phép #${input.id}, tự động cập nhật ${soBuoiCapNhat} buổi học sang vắng có phép.`
      : `Từ chối đơn xin phép #${input.id}.`,
    ipAddress: input.ipAddress,
  });

  return findDonXinPhepById(input.donViId, input.id);
}
