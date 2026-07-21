import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createBuoiHocBulk,
  createLichHoc,
  findBuoiHocById,
  findConflictingBuoiHoc,
  findExistingBuoiHocNgay,
  findLichHocById,
  listBuoiHocByDonVi,
  listBuoiHocByLopHoc,
  listLichHocByLopHoc,
  setLichHocTrangThai,
  updateBuoiHocChiTiet,
  updateBuoiHocTrangThai,
} from "../db/lichHoc.repository.js";
import {
  findGiaoVienChinhDangHoatDong,
  findLopHocById,
} from "../db/lopHoc.repository.js";

const THU_HOP_LE = [2, 3, 4, 5, 6, 7, 8];
const LOAI_BUOI_KHONG_SUA = ["da_hoc"];

function validateGio(gioBatDau: string, gioKetThuc: string) {
  if (!gioBatDau || !gioKetThuc) {
    throw new Error("Vui lòng nhập giờ bắt đầu và giờ kết thúc.");
  }

  if (gioKetThuc <= gioBatDau) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu.");
  }
}

/** Quy ước: 2=Thứ Hai...7=Thứ Bảy, 8=Chủ Nhật. */
function ngayToThuTrongTuan(ngayIso: string): number {
  const [y, m, d] = ngayIso.split("-").map(Number);
  const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  return jsDay === 0 ? 8 : jsDay + 1;
}

function addNgay(ngayIso: string, soNgay: number): string {
  const [y, m, d] = ngayIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  date.setUTCDate(date.getUTCDate() + soNgay);

  return date.toISOString().slice(0, 10);
}

async function requireLopHocDangHoatDong(donViId: number, lopHocId: number) {
  const lop = await findLopHocById(donViId, lopHocId);

  if (!lop) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  if (lop.trangThai === "ket_thuc" || lop.trangThai === "huy") {
    throw new Error("Lớp đã kết thúc hoặc đã huỷ, không thể thao tác lịch học.");
  }

  return lop;
}

export async function listLichHoc(donViId: number, lopHocId: number) {
  await requireLopHocDangHoatDong(donViId, lopHocId);

  return listLichHocByLopHoc(lopHocId);
}

export async function taoQuyTacLichHoc(input: {
  donViId: number;
  lopHocId: number;
  thuTrongTuanList: number[];
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc?: string | null;
  giaoVienId?: number | null;
  ngayApDungTu: string;
  ngayApDungDen?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const lop = await requireLopHocDangHoatDong(input.donViId, input.lopHocId);

  const thuList = [...new Set(input.thuTrongTuanList)];

  if (thuList.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một thứ trong tuần.");
  }

  if (thuList.some((thu) => !THU_HOP_LE.includes(thu))) {
    throw new Error("Thứ trong tuần không hợp lệ.");
  }

  validateGio(input.gioBatDau, input.gioKetThuc);

  if (!input.ngayApDungTu) {
    throw new Error("Vui lòng chọn ngày áp dụng từ.");
  }

  if (
    input.ngayApDungDen &&
    input.ngayApDungDen < input.ngayApDungTu
  ) {
    throw new Error("Ngày áp dụng đến không được trước ngày áp dụng từ.");
  }

  let giaoVienId = input.giaoVienId ?? null;

  if (!giaoVienId) {
    const giaoVienChinh = await findGiaoVienChinhDangHoatDong(input.lopHocId);
    giaoVienId = giaoVienChinh?.giaoVienId ?? null;
  }

  const phongHoc = input.phongHoc?.trim() || lop.phongHoc || null;

  const created = [];

  for (const thu of thuList) {
    const row = await createLichHoc({
      lopHocId: input.lopHocId,
      thuTrongTuan: thu,
      gioBatDau: input.gioBatDau,
      gioKetThuc: input.gioKetThuc,
      phongHoc,
      giaoVienId,
      ngayApDungTu: input.ngayApDungTu,
      ngayApDungDen: input.ngayApDungDen ?? null,
    });

    if (row) {
      created.push(row);
    }
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lich_hoc.create",
    objectType: "LichHoc",
    objectId: null,
    content: `Tạo ${created.length} quy tắc lịch học cho lớp ${lop.tenLop}.`,
    data: { lopHocId: input.lopHocId, thuTrongTuanList: thuList },
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function ngungQuyTacLichHoc(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findLichHocById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy quy tắc lịch học.");
  }

  const updated = await setLichHocTrangThai({
    id: input.id,
    trangThai: "ngung_hoat_dong",
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lich_hoc.deactivate",
    objectType: "LichHoc",
    objectId: String(input.id),
    content: "Ngừng áp dụng quy tắc lịch học.",
    ipAddress: input.ipAddress,
  });

  return updated;
}

function moTaXungDot(
  conflicts: Awaited<ReturnType<typeof findConflictingBuoiHoc>>,
  ngayHoc: string,
) {
  return conflicts
    .map(
      (row) =>
        `${ngayHoc} ${row.buoiHoc.gioBatDau}-${row.buoiHoc.gioKetThuc} (trùng với lớp ${row.lopHocTenLop})`,
    )
    .join("; ");
}

export async function sinhBuoiHoc(input: {
  donViId: number;
  lichHocId: number;
  denNgay: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findLichHocById(input.lichHocId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy quy tắc lịch học.");
  }

  if (found.lichHoc.trangThai !== "hoat_dong") {
    throw new Error("Quy tắc lịch học đã ngừng áp dụng.");
  }

  if (found.lopHocTrangThai === "ket_thuc" || found.lopHocTrangThai === "huy") {
    throw new Error("Lớp đã kết thúc hoặc đã huỷ, không thể sinh buổi học.");
  }

  if (!input.denNgay) {
    throw new Error("Vui lòng chọn sinh buổi học đến ngày nào.");
  }

  const rule = found.lichHoc;

  const effectiveEnd = rule.ngayApDungDen
    ? rule.ngayApDungDen < input.denNgay
      ? rule.ngayApDungDen
      : input.denNgay
    : input.denNgay;

  if (effectiveEnd < rule.ngayApDungTu) {
    return { created: 0, buoiHoc: [] };
  }

  const candidateDates: string[] = [];
  let cursor = rule.ngayApDungTu;

  while (cursor <= effectiveEnd) {
    if (ngayToThuTrongTuan(cursor) === rule.thuTrongTuan) {
      candidateDates.push(cursor);
    }

    cursor = addNgay(cursor, 1);
  }

  const existingDates = await findExistingBuoiHocNgay({
    lichHocId: rule.id,
    ngayHocList: candidateDates,
  });

  const existingSet = new Set(existingDates);
  const toCreate = candidateDates.filter((d) => !existingSet.has(d));

  if (toCreate.length === 0) {
    return { created: 0, buoiHoc: [] };
  }

  const xungDotList: string[] = [];

  for (const ngayHoc of toCreate) {
    const conflicts = await findConflictingBuoiHoc({
      donViId: input.donViId,
      ngayHoc,
      gioBatDau: rule.gioBatDau,
      gioKetThuc: rule.gioKetThuc,
      phongHoc: rule.phongHoc,
      giaoVienId: rule.giaoVienId,
    });

    if (conflicts.length > 0) {
      xungDotList.push(moTaXungDot(conflicts, ngayHoc));
    }
  }

  if (xungDotList.length > 0) {
    throw new Error(
      `Không thể sinh buổi học vì trùng phòng/giáo viên: ${xungDotList.join("; ")}.`,
    );
  }

  await createBuoiHocBulk(
    toCreate.map((ngayHoc) => ({
      lopHocId: rule.lopHocId,
      lichHocId: rule.id,
      ngayHoc,
      gioBatDau: rule.gioBatDau,
      gioKetThuc: rule.gioKetThuc,
      phongHoc: rule.phongHoc,
      giaoVienId: rule.giaoVienId,
      loaiBuoi: "thuong" as const,
    })),
  );

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lich_hoc.generate_sessions",
    objectType: "LichHoc",
    objectId: String(rule.id),
    content: `Sinh ${toCreate.length} buổi học đến ngày ${input.denNgay}.`,
    data: { lopHocId: rule.lopHocId, ngayHocList: toCreate },
    ipAddress: input.ipAddress,
  });

  return { created: toCreate.length, ngayHocList: toCreate };
}

export async function taoBuoiHocBu(input: {
  donViId: number;
  lopHocId: number;
  ngayHoc: string;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc?: string | null;
  giaoVienId?: number | null;
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const lop = await requireLopHocDangHoatDong(input.donViId, input.lopHocId);

  if (!input.ngayHoc) {
    throw new Error("Vui lòng chọn ngày học bù.");
  }

  validateGio(input.gioBatDau, input.gioKetThuc);

  const phongHoc = input.phongHoc?.trim() || null;
  const giaoVienId = input.giaoVienId ?? null;

  const conflicts = await findConflictingBuoiHoc({
    donViId: input.donViId,
    ngayHoc: input.ngayHoc,
    gioBatDau: input.gioBatDau,
    gioKetThuc: input.gioKetThuc,
    phongHoc,
    giaoVienId,
  });

  if (conflicts.length > 0) {
    throw new Error(
      `Không thể tạo buổi học bù vì trùng phòng/giáo viên: ${moTaXungDot(conflicts, input.ngayHoc)}.`,
    );
  }

  await createBuoiHocBulk([
    {
      lopHocId: input.lopHocId,
      lichHocId: null,
      ngayHoc: input.ngayHoc,
      gioBatDau: input.gioBatDau,
      gioKetThuc: input.gioKetThuc,
      phongHoc,
      giaoVienId,
      loaiBuoi: "bu",
    },
  ]);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lich_hoc.create_makeup_session",
    objectType: "BuoiHoc",
    objectId: null,
    content: `Tạo buổi học bù ngày ${input.ngayHoc} cho lớp ${lop.tenLop}.`,
    ipAddress: input.ipAddress,
  });
}

export async function listBuoiHocLop(input: {
  donViId: number;
  lopHocId: number;
  tuNgay?: string;
  denNgay?: string;
}) {
  await requireLopHocDangHoatDong(input.donViId, input.lopHocId);

  return listBuoiHocByLopHoc({
    lopHocId: input.lopHocId,
    tuNgay: input.tuNgay,
    denNgay: input.denNgay,
  });
}

export async function listThoiKhoaBieu(input: {
  donViId: number;
  tuNgay: string;
  denNgay: string;
  giaoVienId?: number;
}) {
  if (!input.tuNgay || !input.denNgay) {
    throw new Error("Vui lòng chọn khoảng ngày.");
  }

  if (input.denNgay < input.tuNgay) {
    throw new Error("Ngày kết thúc không được trước ngày bắt đầu.");
  }

  return listBuoiHocByDonVi(input);
}

export async function capNhatTrangThaiBuoiHoc(input: {
  donViId: number;
  id: number;
  trangThai: "du_kien" | "nghi" | "huy";
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findBuoiHocById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy buổi học.");
  }

  if (LOAI_BUOI_KHONG_SUA.includes(found.buoiHoc.trangThai)) {
    throw new Error("Buổi học đã diễn ra, không thể sửa qua màn hình lịch học.");
  }

  const updated = await updateBuoiHocTrangThai({
    id: input.id,
    trangThai: input.trangThai,
    ghiChu: input.ghiChu?.trim() || null,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lich_hoc.set_session_status",
    objectType: "BuoiHoc",
    objectId: String(input.id),
    content: `Đổi trạng thái buổi học ngày ${found.buoiHoc.ngayHoc} sang ${input.trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function suaBuoiHoc(input: {
  donViId: number;
  id: number;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc?: string | null;
  giaoVienId?: number | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findBuoiHocById(input.id);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy buổi học.");
  }

  if (LOAI_BUOI_KHONG_SUA.includes(found.buoiHoc.trangThai)) {
    throw new Error("Buổi học đã diễn ra, không thể sửa qua màn hình lịch học.");
  }

  validateGio(input.gioBatDau, input.gioKetThuc);

  const phongHoc = input.phongHoc?.trim() || null;
  const giaoVienId = input.giaoVienId ?? null;

  const conflicts = await findConflictingBuoiHoc({
    donViId: input.donViId,
    ngayHoc: found.buoiHoc.ngayHoc,
    gioBatDau: input.gioBatDau,
    gioKetThuc: input.gioKetThuc,
    phongHoc,
    giaoVienId,
    excludeId: input.id,
  });

  if (conflicts.length > 0) {
    throw new Error(
      `Không thể lưu vì trùng phòng/giáo viên: ${moTaXungDot(conflicts, found.buoiHoc.ngayHoc)}.`,
    );
  }

  await updateBuoiHocChiTiet({
    id: input.id,
    gioBatDau: input.gioBatDau,
    gioKetThuc: input.gioKetThuc,
    phongHoc,
    giaoVienId,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lich_hoc.update_session",
    objectType: "BuoiHoc",
    objectId: String(input.id),
    content: `Sửa buổi học ngày ${found.buoiHoc.ngayHoc}.`,
    ipAddress: input.ipAddress,
  });
}
