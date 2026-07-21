import { eq } from "drizzle-orm";

import { baoGiang } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function findBaoGiangByBuoiHoc(buoiHocId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(baoGiang)
    .where(eq(baoGiang.buoiHocId, buoiHocId))
    .limit(1);

  return rows[0] ?? null;
}

export async function upsertBaoGiang(input: {
  buoiHocId: number;
  noiDungBaiHoc: string | null;
  baiTap: string | null;
  ghiChu: string | null;
  actorUserId: number;
}) {
  const db = getDb();

  const existing = await findBaoGiangByBuoiHoc(input.buoiHocId);

  if (existing) {
    await db
      .update(baoGiang)
      .set({
        noiDungBaiHoc: input.noiDungBaiHoc,
        baiTap: input.baiTap,
        ghiChu: input.ghiChu,
        actorUserId: input.actorUserId,
        updatedAt: now(),
      })
      .where(eq(baoGiang.id, existing.id));

    return findBaoGiangByBuoiHoc(input.buoiHocId);
  }

  await db.insert(baoGiang).values({
    buoiHocId: input.buoiHocId,
    noiDungBaiHoc: input.noiDungBaiHoc,
    baiTap: input.baiTap,
    ghiChu: input.ghiChu,
    actorUserId: input.actorUserId,
    createdAt: now(),
    updatedAt: now(),
  });

  return findBaoGiangByBuoiHoc(input.buoiHocId);
}
