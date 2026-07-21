import { and, eq } from "drizzle-orm";

import { chuongTrinhDaoTao, donVi } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listChuongTrinhByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(chuongTrinhDaoTao)
    .where(eq(chuongTrinhDaoTao.donViId, donViId))
    .orderBy(chuongTrinhDaoTao.tenChuongTrinh);
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listChuongTrinhAllDonVi() {
  const db = getDb();

  return db
    .select({
      chuongTrinh: chuongTrinhDaoTao,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(chuongTrinhDaoTao)
    .innerJoin(donVi, eq(chuongTrinhDaoTao.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, chuongTrinhDaoTao.tenChuongTrinh);
}

export async function findChuongTrinhById(
  donViId: number,
  id: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(chuongTrinhDaoTao)
    .where(
      and(
        eq(chuongTrinhDaoTao.id, id),
        eq(chuongTrinhDaoTao.donViId, donViId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findChuongTrinhByMa(
  donViId: number,
  maChuongTrinh: string,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(chuongTrinhDaoTao)
    .where(
      and(
        eq(chuongTrinhDaoTao.donViId, donViId),
        eq(chuongTrinhDaoTao.maChuongTrinh, maChuongTrinh),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createChuongTrinh(input: {
  donViId: number;
  maChuongTrinh: string;
  tenChuongTrinh: string;
  capDo: string | null;
  tongSoBuoi: number | null;
  tongSoGio: string | null;
  moTa: string | null;
}) {
  const db = getDb();

  await db.insert(chuongTrinhDaoTao).values({
    donViId: input.donViId,
    maChuongTrinh: input.maChuongTrinh,
    tenChuongTrinh: input.tenChuongTrinh,
    capDo: input.capDo,
    tongSoBuoi: input.tongSoBuoi,
    tongSoGio: input.tongSoGio,
    moTa: input.moTa,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  return findChuongTrinhByMa(input.donViId, input.maChuongTrinh);
}

export async function updateChuongTrinh(input: {
  id: number;
  tenChuongTrinh: string;
  capDo: string | null;
  tongSoBuoi: number | null;
  tongSoGio: string | null;
  moTa: string | null;
}) {
  const db = getDb();

  await db
    .update(chuongTrinhDaoTao)
    .set({
      tenChuongTrinh: input.tenChuongTrinh,
      capDo: input.capDo,
      tongSoBuoi: input.tongSoBuoi,
      tongSoGio: input.tongSoGio,
      moTa: input.moTa,
      updatedAt: now(),
    })
    .where(eq(chuongTrinhDaoTao.id, input.id));

  const rows = await db
    .select()
    .from(chuongTrinhDaoTao)
    .where(eq(chuongTrinhDaoTao.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function setChuongTrinhTrangThai(input: {
  id: number;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
}) {
  const db = getDb();

  await db
    .update(chuongTrinhDaoTao)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(chuongTrinhDaoTao.id, input.id));

  const rows = await db
    .select()
    .from(chuongTrinhDaoTao)
    .where(eq(chuongTrinhDaoTao.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}
