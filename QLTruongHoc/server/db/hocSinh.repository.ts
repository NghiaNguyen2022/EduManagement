import { and, eq } from "drizzle-orm";

import { hocSinh } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

export async function findHocSinhById(
  donViId: number,
  hocSinhId: number
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(hocSinh)
    .where(
      and(
        eq(hocSinh.id, hocSinhId),
        eq(hocSinh.donViId, donViId)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}
