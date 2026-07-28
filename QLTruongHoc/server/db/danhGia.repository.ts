import { desc, eq } from "drizzle-orm";

import {
  hocSinhLopHoc,
  hocSinhLopHocDanhGia,
  lopHoc,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

/** Toàn bộ đánh giá của 1 học sinh, xuyên suốt mọi lượt xếp lớp — kèm tên lớp để hiển thị. */
export async function listDanhGiaByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select({
      danhGia: hocSinhLopHocDanhGia,
      enrollmentId: hocSinhLopHoc.id,
      lopHoc: {
        id: lopHoc.id,
        maLop: lopHoc.maLop,
        tenLop: lopHoc.tenLop,
      },
    })
    .from(hocSinhLopHocDanhGia)
    .innerJoin(
      hocSinhLopHoc,
      eq(hocSinhLopHocDanhGia.enrollmentId, hocSinhLopHoc.id),
    )
    .innerJoin(lopHoc, eq(hocSinhLopHoc.lopHocId, lopHoc.id))
    .where(eq(hocSinhLopHoc.hocSinhId, hocSinhId))
    .orderBy(desc(hocSinhLopHocDanhGia.ngayDanhGia), desc(hocSinhLopHocDanhGia.id));
}

export async function findDanhGiaById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      danhGia: hocSinhLopHocDanhGia,
      donViId: lopHoc.donViId,
    })
    .from(hocSinhLopHocDanhGia)
    .innerJoin(
      hocSinhLopHoc,
      eq(hocSinhLopHocDanhGia.enrollmentId, hocSinhLopHoc.id),
    )
    .innerJoin(lopHoc, eq(hocSinhLopHoc.lopHocId, lopHoc.id))
    .where(eq(hocSinhLopHocDanhGia.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createDanhGia(input: {
  enrollmentId: number;
  loaiDanhGia: "giua_ky" | "cuoi_ky" | "khac";
  diemSo: string | null;
  xepLoai: string | null;
  nhanXet: string | null;
  ngayDanhGia: string;
  actorUserId: number;
}) {
  const db = getDb();
  const timestamp = now();

  await db.insert(hocSinhLopHocDanhGia).values({
    enrollmentId: input.enrollmentId,
    loaiDanhGia: input.loaiDanhGia,
    diemSo: input.diemSo,
    xepLoai: input.xepLoai,
    nhanXet: input.nhanXet,
    ngayDanhGia: input.ngayDanhGia,
    actorUserId: input.actorUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const rows = await db
    .select()
    .from(hocSinhLopHocDanhGia)
    .where(eq(hocSinhLopHocDanhGia.enrollmentId, input.enrollmentId))
    .orderBy(desc(hocSinhLopHocDanhGia.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteDanhGia(id: number) {
  const db = getDb();

  await db.delete(hocSinhLopHocDanhGia).where(eq(hocSinhLopHocDanhGia.id, id));
}
