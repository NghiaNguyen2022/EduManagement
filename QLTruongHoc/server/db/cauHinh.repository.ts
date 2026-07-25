import { eq } from "drizzle-orm";

import { cauHinhHeThong } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export async function findCauHinhHeThong() {
  const db = getDb();

  const rows = await db
    .select()
    .from(cauHinhHeThong)
    .where(eq(cauHinhHeThong.id, 1))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateCauHinhHeThong(input: {
  soLanDangNhapSaiToiDa: number;
  soPhutKhoaDangNhap: number;
  doDaiMatKhauToiThieu: number;
  capNhatBoiId: number;
}) {
  const db = getDb();

  await db
    .update(cauHinhHeThong)
    .set({
      soLanDangNhapSaiToiDa: input.soLanDangNhapSaiToiDa,
      soPhutKhoaDangNhap: input.soPhutKhoaDangNhap,
      doDaiMatKhauToiThieu: input.doDaiMatKhauToiThieu,
      capNhatBoiId: input.capNhatBoiId,
      updatedAt: now(),
    })
    .where(eq(cauHinhHeThong.id, 1));

  return findCauHinhHeThong();
}
