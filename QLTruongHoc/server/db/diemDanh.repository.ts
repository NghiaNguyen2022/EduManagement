import {
  and,
  eq,
  gte,
  isNull,
  lte,
  or,
} from "drizzle-orm";

import {
  diemDanh,
  hocSinh,
  hocSinhLopHoc,
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
