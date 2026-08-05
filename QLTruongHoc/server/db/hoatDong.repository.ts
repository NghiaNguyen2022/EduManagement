import { asc, desc, eq, inArray } from "drizzle-orm";

import { hoatDongAnh, hoatDongHocSinh, hoatDongLopHoc } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

async function attachAnhVaHocSinh(
  rows: (typeof hoatDongLopHoc.$inferSelect)[],
) {
  if (rows.length === 0) return [];

  const db = getDb();
  const ids = rows.map((row) => row.id);

  const [anhRows, tagRows] = await Promise.all([
    db
      .select()
      .from(hoatDongAnh)
      .where(inArray(hoatDongAnh.hoatDongId, ids))
      .orderBy(asc(hoatDongAnh.thuTu), asc(hoatDongAnh.id)),
    db.select().from(hoatDongHocSinh).where(inArray(hoatDongHocSinh.hoatDongId, ids)),
  ]);

  return rows.map((row) => ({
    hoatDong: row,
    anh: anhRows.filter((anh) => anh.hoatDongId === row.id),
    hocSinhIds: tagRows
      .filter((tag) => tag.hoatDongId === row.id)
      .map((tag) => tag.hocSinhId),
  }));
}

export async function listHoatDongByLopHoc(lopHocId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(hoatDongLopHoc)
    .where(eq(hoatDongLopHoc.lopHocId, lopHocId))
    .orderBy(desc(hoatDongLopHoc.ngayHoatDong), desc(hoatDongLopHoc.id));

  return attachAnhVaHocSinh(rows);
}

export async function findHoatDongById(id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(hoatDongLopHoc)
    .where(eq(hoatDongLopHoc.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createHoatDong(input: {
  donViId: number;
  lopHocId: number;
  ngayHoatDong: string;
  tieuDe: string;
  moTa: string | null;
  urls: string[];
  hocSinhIds: number[];
  actorUserId: number;
}) {
  const db = getDb();
  const timestamp = now();

  await db.insert(hoatDongLopHoc).values({
    donViId: input.donViId,
    lopHocId: input.lopHocId,
    ngayHoatDong: input.ngayHoatDong,
    tieuDe: input.tieuDe,
    moTa: input.moTa,
    actorUserId: input.actorUserId,
    createdAt: timestamp,
  });

  const created = (
    await db
      .select()
      .from(hoatDongLopHoc)
      .where(eq(hoatDongLopHoc.lopHocId, input.lopHocId))
      .orderBy(desc(hoatDongLopHoc.id))
      .limit(1)
  )[0];

  if (!created) return null;

  if (input.urls.length > 0) {
    await db.insert(hoatDongAnh).values(
      input.urls.map((url, index) => ({
        hoatDongId: created.id,
        url,
        thuTu: index,
      })),
    );
  }

  if (input.hocSinhIds.length > 0) {
    await db.insert(hoatDongHocSinh).values(
      input.hocSinhIds.map((hocSinhId) => ({
        hoatDongId: created.id,
        hocSinhId,
      })),
    );
  }

  return (await attachAnhVaHocSinh([created]))[0];
}

export async function deleteHoatDong(id: number) {
  const db = getDb();

  await db.delete(hoatDongAnh).where(eq(hoatDongAnh.hoatDongId, id));
  await db.delete(hoatDongHocSinh).where(eq(hoatDongHocSinh.hoatDongId, id));
  await db.delete(hoatDongLopHoc).where(eq(hoatDongLopHoc.id, id));
}
