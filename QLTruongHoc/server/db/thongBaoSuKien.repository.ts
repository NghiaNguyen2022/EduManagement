import { and, count, desc, eq, inArray } from "drizzle-orm";

import { thongBaoSuKien } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export async function createThongBaoSuKienNhieuNguoi(
  rows: {
    donViId: number;
    nguoiNhanId: number;
    loaiSuKien: string;
    tieuDe: string;
    noiDung: string;
    duongDan: string | null;
  }[],
) {
  if (rows.length === 0) {
    return;
  }

  const db = getDb();
  const createdAt = now();

  await db.insert(thongBaoSuKien).values(
    rows.map((row) => ({
      ...row,
      createdAt,
    })),
  );
}

export async function listThongBaoSuKienByNguoiDung(
  donViId: number,
  nguoiNhanId: number,
  limit = 30,
) {
  const db = getDb();

  return db
    .select()
    .from(thongBaoSuKien)
    .where(
      and(
        eq(thongBaoSuKien.donViId, donViId),
        eq(thongBaoSuKien.nguoiNhanId, nguoiNhanId),
      ),
    )
    .orderBy(desc(thongBaoSuKien.createdAt))
    .limit(limit);
}

/** Sự kiện chưa từng hiện popup — client poll để lấy toast mới. */
export async function listChuaHienThi(donViId: number, nguoiNhanId: number) {
  const db = getDb();

  return db
    .select()
    .from(thongBaoSuKien)
    .where(
      and(
        eq(thongBaoSuKien.donViId, donViId),
        eq(thongBaoSuKien.nguoiNhanId, nguoiNhanId),
        eq(thongBaoSuKien.daHienThi, false),
      ),
    )
    .orderBy(thongBaoSuKien.createdAt);
}

export async function countChuaDoc(donViId: number, nguoiNhanId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(thongBaoSuKien)
    .where(
      and(
        eq(thongBaoSuKien.donViId, donViId),
        eq(thongBaoSuKien.nguoiNhanId, nguoiNhanId),
        eq(thongBaoSuKien.daDoc, false),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function markHienThi(ids: number[]) {
  if (ids.length === 0) {
    return;
  }

  const db = getDb();

  await db
    .update(thongBaoSuKien)
    .set({ daHienThi: true, daHienThiAt: now() })
    .where(inArray(thongBaoSuKien.id, ids));
}

export async function markDaDoc(id: number, nguoiNhanId: number) {
  const db = getDb();

  await db
    .update(thongBaoSuKien)
    .set({ daDoc: true, daDocAt: now() })
    .where(
      and(eq(thongBaoSuKien.id, id), eq(thongBaoSuKien.nguoiNhanId, nguoiNhanId)),
    );
}

export async function markTatCaDaDoc(donViId: number, nguoiNhanId: number) {
  const db = getDb();

  await db
    .update(thongBaoSuKien)
    .set({ daDoc: true, daDocAt: now() })
    .where(
      and(
        eq(thongBaoSuKien.donViId, donViId),
        eq(thongBaoSuKien.nguoiNhanId, nguoiNhanId),
        eq(thongBaoSuKien.daDoc, false),
      ),
    );
}
