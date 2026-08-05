import { desc, eq } from "drizzle-orm";

import { hocSinh, hocSinhSucKhoe } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listSucKhoeByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select()
    .from(hocSinhSucKhoe)
    .where(eq(hocSinhSucKhoe.hocSinhId, hocSinhId))
    .orderBy(desc(hocSinhSucKhoe.ngayGhiNhan), desc(hocSinhSucKhoe.id));
}

export async function findSucKhoeById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      sucKhoe: hocSinhSucKhoe,
      donViId: hocSinh.donViId,
    })
    .from(hocSinhSucKhoe)
    .innerJoin(hocSinh, eq(hocSinhSucKhoe.hocSinhId, hocSinh.id))
    .where(eq(hocSinhSucKhoe.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createSucKhoe(input: {
  donViId: number;
  hocSinhId: number;
  ngayGhiNhan: string;
  loaiGhiNhan: "theo_tuan" | "theo_thang" | "theo_quy" | "khac";
  chieuCaoCm: string | null;
  canNangKg: string | null;
  diUngBenhNen: string | null;
  ghiChu: string | null;
  actorUserId: number;
}) {
  const db = getDb();
  const timestamp = now();

  await db.insert(hocSinhSucKhoe).values({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    ngayGhiNhan: input.ngayGhiNhan,
    loaiGhiNhan: input.loaiGhiNhan,
    chieuCaoCm: input.chieuCaoCm,
    canNangKg: input.canNangKg,
    diUngBenhNen: input.diUngBenhNen,
    ghiChu: input.ghiChu,
    actorUserId: input.actorUserId,
    createdAt: timestamp,
  });

  const rows = await db
    .select()
    .from(hocSinhSucKhoe)
    .where(eq(hocSinhSucKhoe.hocSinhId, input.hocSinhId))
    .orderBy(desc(hocSinhSucKhoe.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteSucKhoe(id: number) {
  const db = getDb();

  await db.delete(hocSinhSucKhoe).where(eq(hocSinhSucKhoe.id, id));
}

export async function syncHocSinhSucKhoeSnapshot(input: {
  hocSinhId: number;
  chieuCaoCm: string | null;
  canNangKg: string | null;
  diUngBenhNen: string | null;
}) {
  const db = getDb();

  await db
    .update(hocSinh)
    .set({
      chieuCaoCm: input.chieuCaoCm,
      canNangKg: input.canNangKg,
      diUngBenhNen: input.diUngBenhNen,
      updatedAt: now(),
    })
    .where(eq(hocSinh.id, input.hocSinhId));
}
