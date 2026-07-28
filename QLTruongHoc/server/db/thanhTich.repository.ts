import { desc, eq } from "drizzle-orm";

import { hocSinh, hocSinhThanhTich } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listThanhTichByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select()
    .from(hocSinhThanhTich)
    .where(eq(hocSinhThanhTich.hocSinhId, hocSinhId))
    .orderBy(desc(hocSinhThanhTich.ngayDat), desc(hocSinhThanhTich.id));
}

export async function findThanhTichById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      thanhTich: hocSinhThanhTich,
      donViId: hocSinh.donViId,
    })
    .from(hocSinhThanhTich)
    .innerJoin(hocSinh, eq(hocSinhThanhTich.hocSinhId, hocSinh.id))
    .where(eq(hocSinhThanhTich.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createThanhTich(input: {
  hocSinhId: number;
  tenThanhTich: string;
  ketQua: string | null;
  ngayDat: string | null;
  noiCap: string | null;
  tepMinhChungUrl: string | null;
  ghiChu: string | null;
  actorUserId: number;
}) {
  const db = getDb();
  const timestamp = now();

  await db.insert(hocSinhThanhTich).values({
    hocSinhId: input.hocSinhId,
    tenThanhTich: input.tenThanhTich,
    ketQua: input.ketQua,
    ngayDat: input.ngayDat,
    noiCap: input.noiCap,
    tepMinhChungUrl: input.tepMinhChungUrl,
    ghiChu: input.ghiChu,
    actorUserId: input.actorUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const rows = await db
    .select()
    .from(hocSinhThanhTich)
    .where(eq(hocSinhThanhTich.hocSinhId, input.hocSinhId))
    .orderBy(desc(hocSinhThanhTich.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteThanhTich(id: number) {
  const db = getDb();

  await db.delete(hocSinhThanhTich).where(eq(hocSinhThanhTich.id, id));
}
