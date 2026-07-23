import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  or,
} from "drizzle-orm";

import {
  buoiHoc,
  diemDanh,
  hocSinh,
  hocSinhLopHoc,
  lopHoc,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listRosterByLopHocNgay(input: {
  lopHocId: number;
  ngayHoc: string;
}) {
  const db = getDb();

  return db
    .select({
      enrollment: hocSinhLopHoc,
      hocSinh,
    })
    .from(hocSinhLopHoc)
    .innerJoin(hocSinh, eq(hocSinhLopHoc.hocSinhId, hocSinh.id))
    .where(
      and(
        eq(hocSinhLopHoc.lopHocId, input.lopHocId),
        lte(hocSinhLopHoc.ngayVaoLop, input.ngayHoc),
        or(
          isNull(hocSinhLopHoc.ngayRoiLop),
          gte(hocSinhLopHoc.ngayRoiLop, input.ngayHoc),
        ),
      ),
    )
    .orderBy(hocSinh.hoTen);
}

export async function listDiemDanhByBuoiHoc(buoiHocId: number) {
  const db = getDb();

  return db
    .select()
    .from(diemDanh)
    .where(eq(diemDanh.buoiHocId, buoiHocId));
}

/**
 * Vắng học gần đây của một học sinh (có phép + không phép), dùng cho cảnh báo
 * tự động trong Portal phụ huynh (F05) — chỉ xem, gộp theo đúng một học sinh
 * nên không rủi ro lộ dữ liệu chéo sang phụ huynh khác (khác với `ThongBao`
 * dùng chung, chưa lọc theo học sinh — xem `docs/analysis/F03_F05_...md`).
 */
export async function listDiemDanhGanDayByHocSinh(
  hocSinhId: number,
  tuNgay: string,
  denNgay: string,
) {
  const db = getDb();

  return db
    .select({
      diemDanh,
      ngayHoc: buoiHoc.ngayHoc,
      gioBatDau: buoiHoc.gioBatDau,
      tenLop: lopHoc.tenLop,
    })
    .from(diemDanh)
    .innerJoin(buoiHoc, eq(diemDanh.buoiHocId, buoiHoc.id))
    .innerJoin(lopHoc, eq(buoiHoc.lopHocId, lopHoc.id))
    .where(
      and(
        eq(diemDanh.hocSinhId, hocSinhId),
        inArray(diemDanh.trangThai, ["vang_khong_phep", "vang_co_phep"]),
        gte(buoiHoc.ngayHoc, tuNgay),
        lte(buoiHoc.ngayHoc, denNgay),
      ),
    )
    .orderBy(desc(buoiHoc.ngayHoc), desc(buoiHoc.gioBatDau));
}

export async function findDiemDanh(
  buoiHocId: number,
  hocSinhId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(diemDanh)
    .where(
      and(
        eq(diemDanh.buoiHocId, buoiHocId),
        eq(diemDanh.hocSinhId, hocSinhId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function upsertDiemDanh(input: {
  buoiHocId: number;
  hocSinhId: number;
  trangThai:
    | "co_mat"
    | "vang_co_phep"
    | "vang_khong_phep"
    | "di_tre"
    | "ve_som";
  ghiChu: string | null;
  nhanXet: string | null;
  actorUserId: number;
}) {
  const db = getDb();

  const existing = await findDiemDanh(
    input.buoiHocId,
    input.hocSinhId,
  );

  if (existing) {
    await db
      .update(diemDanh)
      .set({
        trangThai: input.trangThai,
        ghiChu: input.ghiChu,
        nhanXet: input.nhanXet,
        actorUserId: input.actorUserId,
        updatedAt: now(),
      })
      .where(eq(diemDanh.id, existing.id));

    return;
  }

  await db.insert(diemDanh).values({
    buoiHocId: input.buoiHocId,
    hocSinhId: input.hocSinhId,
    trangThai: input.trangThai,
    ghiChu: input.ghiChu,
    nhanXet: input.nhanXet,
    actorUserId: input.actorUserId,
    createdAt: now(),
    updatedAt: now(),
  });
}
