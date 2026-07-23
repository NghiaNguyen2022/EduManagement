import { and, count, eq, like } from "drizzle-orm";

import { donVi, giaoVien } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listGiaoVienByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(giaoVien)
    .where(eq(giaoVien.donViId, donViId))
    .orderBy(giaoVien.hoTen);
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listGiaoVienAllDonVi() {
  const db = getDb();

  return db
    .select({
      giaoVien,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(giaoVien)
    .innerJoin(donVi, eq(giaoVien.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, giaoVien.hoTen);
}

export async function findGiaoVienByNguoiDungId(
  donViId: number,
  nguoiDungId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(giaoVien)
    .where(
      and(
        eq(giaoVien.donViId, donViId),
        eq(giaoVien.nguoiDungId, nguoiDungId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findGiaoVienById(
  donViId: number,
  id: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(giaoVien)
    .where(
      and(
        eq(giaoVien.id, id),
        eq(giaoVien.donViId, donViId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function countGiaoVienTheoMaPrefix(
  donViId: number,
  prefix: string,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(giaoVien)
    .where(
      and(
        eq(giaoVien.donViId, donViId),
        like(giaoVien.maGiaoVien, `${prefix}%`),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function createGiaoVien(input: {
  donViId: number;
  maGiaoVien: string;
  hoTen: string;
  dienThoai: string | null;
  email: string | null;
  chuyenMon: string | null;
  trinhDo: string | null;
  nguoiDungId: number | null;
}) {
  const db = getDb();

  await db.insert(giaoVien).values({
    donViId: input.donViId,
    maGiaoVien: input.maGiaoVien,
    hoTen: input.hoTen,
    dienThoai: input.dienThoai,
    email: input.email,
    chuyenMon: input.chuyenMon,
    trinhDo: input.trinhDo,
    nguoiDungId: input.nguoiDungId,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(giaoVien)
    .where(
      and(
        eq(giaoVien.donViId, input.donViId),
        eq(giaoVien.maGiaoVien, input.maGiaoVien),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function updateGiaoVien(input: {
  id: number;
  hoTen: string;
  dienThoai: string | null;
  email: string | null;
  chuyenMon: string | null;
  trinhDo: string | null;
}) {
  const db = getDb();

  await db
    .update(giaoVien)
    .set({
      hoTen: input.hoTen,
      dienThoai: input.dienThoai,
      email: input.email,
      chuyenMon: input.chuyenMon,
      trinhDo: input.trinhDo,
      updatedAt: now(),
    })
    .where(eq(giaoVien.id, input.id));

  const rows = await db
    .select()
    .from(giaoVien)
    .where(eq(giaoVien.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function setGiaoVienTrangThai(input: {
  id: number;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
}) {
  const db = getDb();

  await db
    .update(giaoVien)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(giaoVien.id, input.id));

  const rows = await db
    .select()
    .from(giaoVien)
    .where(eq(giaoVien.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}
