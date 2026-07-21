import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  listDiemDanhByBuoiHoc,
  listRosterByLopHocNgay,
  upsertDiemDanh,
} from "../db/diemDanh.repository.js";
import {
  findBuoiHocById,
  updateBuoiHocTrangThai,
} from "../db/lichHoc.repository.js";

type TrangThaiDiemDanh =
  | "co_mat"
  | "vang_co_phep"
  | "vang_khong_phep"
  | "di_tre"
  | "ve_som";

const TRANG_THAI_HOP_LE: TrangThaiDiemDanh[] = [
  "co_mat",
  "vang_co_phep",
  "vang_khong_phep",
  "di_tre",
  "ve_som",
];

async function requireBuoiHocKhaDung(donViId: number, buoiHocId: number) {
  const found = await findBuoiHocById(buoiHocId);

  if (!found || found.donViId !== donViId) {
    throw new Error("Không tìm thấy buổi học trong đơn vị hiện tại.");
  }

  return found;
}

export async function getDiemDanhRoster(
  donViId: number,
  buoiHocId: number,
) {
  const found = await requireBuoiHocKhaDung(donViId, buoiHocId);

  const [roster, existingRows] = await Promise.all([
    listRosterByLopHocNgay({
      lopHocId: found.buoiHoc.lopHocId,
      ngayHoc: found.buoiHoc.ngayHoc,
    }),
    listDiemDanhByBuoiHoc(buoiHocId),
  ]);

  const diemDanhByHocSinhId = new Map(
    existingRows.map((row) => [row.hocSinhId, row]),
  );

  return {
    buoiHoc: found.buoiHoc,
    hocSinh: roster.map((row) => {
      const existing = diemDanhByHocSinhId.get(row.hocSinh.id);

      return {
        hocSinh: row.hocSinh,
        trangThai: existing?.trangThai ?? "co_mat",
        ghiChu: existing?.ghiChu ?? null,
        nhanXet: existing?.nhanXet ?? null,
        daDiemDanh: Boolean(existing),
      };
    }),
  };
}

export async function luuDiemDanh(input: {
  donViId: number;
  buoiHocId: number;
  danhSach: {
    hocSinhId: number;
    trangThai: string;
    ghiChu?: string | null;
    nhanXet?: string | null;
  }[];
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
      "Buổi học đã nghỉ hoặc đã huỷ, không thể điểm danh.",
    );
  }

  if (input.danhSach.length === 0) {
    throw new Error("Chưa có học sinh nào để điểm danh.");
  }

  const roster = await listRosterByLopHocNgay({
    lopHocId: found.buoiHoc.lopHocId,
    ngayHoc: found.buoiHoc.ngayHoc,
  });

  const rosterIds = new Set(roster.map((row) => row.hocSinh.id));

  for (const entry of input.danhSach) {
    if (!rosterIds.has(entry.hocSinhId)) {
      throw new Error(
        "Có học sinh không thuộc danh sách lớp tại ngày học này.",
      );
    }

    if (
      !TRANG_THAI_HOP_LE.includes(entry.trangThai as TrangThaiDiemDanh)
    ) {
      throw new Error("Trạng thái điểm danh không hợp lệ.");
    }
  }

  for (const entry of input.danhSach) {
    await upsertDiemDanh({
      buoiHocId: input.buoiHocId,
      hocSinhId: entry.hocSinhId,
      trangThai: entry.trangThai as TrangThaiDiemDanh,
      ghiChu: entry.ghiChu?.trim() || null,
      nhanXet: entry.nhanXet?.trim() || null,
      actorUserId: input.actorUserId,
    });
  }

  if (found.buoiHoc.trangThai === "du_kien") {
    await updateBuoiHocTrangThai({
      id: input.buoiHocId,
      trangThai: "da_hoc",
    });
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "diem_danh.save",
    objectType: "BuoiHoc",
    objectId: String(input.buoiHocId),
    content: `Điểm danh buổi học ngày ${found.buoiHoc.ngayHoc} — ${input.danhSach.length} học sinh.`,
    ipAddress: input.ipAddress,
  });

  return getDiemDanhRoster(input.donViId, input.buoiHocId);
}
