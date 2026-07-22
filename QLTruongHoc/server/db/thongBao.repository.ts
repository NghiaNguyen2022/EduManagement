import { and, count, desc, eq, like } from "drizzle-orm";

import { donVi, thongBao, thongBaoDaDoc } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listThongBaoByDonVi(donViId: number, userId: number) {
  const db = getDb();

  return db
    .select({
      thongBao,
      daDocAt: thongBaoDaDoc.daDocAt,
    })
    .from(thongBao)
    .leftJoin(
      thongBaoDaDoc,
      and(eq(thongBaoDaDoc.thongBaoId, thongBao.id), eq(thongBaoDaDoc.nguoiDungId, userId)),
    )
    .where(eq(thongBao.donViId, donViId))
    .orderBy(desc(thongBao.createdAt));
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listThongBaoAllDonVi(userId: number) {
  const db = getDb();

  return db
    .select({
      thongBao,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      daDocAt: thongBaoDaDoc.daDocAt,
    })
    .from(thongBao)
    .leftJoin(
      thongBaoDaDoc,
      and(eq(thongBaoDaDoc.thongBaoId, thongBao.id), eq(thongBaoDaDoc.nguoiDungId, userId)),
    )
    .innerJoin(donVi, eq(thongBao.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, desc(thongBao.createdAt));
}

export async function findThongBaoById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(thongBao)
    .where(and(eq(thongBao.id, id), eq(thongBao.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findThongBaoDaDoc(thongBaoId: number, nguoiDungId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(thongBaoDaDoc)
    .where(
      and(eq(thongBaoDaDoc.thongBaoId, thongBaoId), eq(thongBaoDaDoc.nguoiDungId, nguoiDungId)),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createThongBaoDaDoc(input: {
  thongBaoId: number;
  nguoiDungId: number;
  daDocAt: string;
}) {
  const db = getDb();

  await db.insert(thongBaoDaDoc).values({
    thongBaoId: input.thongBaoId,
    nguoiDungId: input.nguoiDungId,
    daDocAt: input.daDocAt,
    createdAt: input.daDocAt,
  });

  return findThongBaoDaDoc(input.thongBaoId, input.nguoiDungId);
}

export async function countThongBaoTheoMaPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(thongBao)
    .where(and(eq(thongBao.donViId, donViId), like(thongBao.maThongBao, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function createThongBao(input: {
  donViId: number;
  maThongBao: string;
  tieuDe: string;
  noiDung: string;
  tepDinhKemTen: string | null;
  tepDinhKemUrl: string | null;
  phamVi: "toan_truong" | "theo_lop" | "ca_nhan";
  doiTuong: string | null;
  nguoiTaoId: number;
}) {
  const db = getDb();

  await db.insert(thongBao).values({
    donViId: input.donViId,
    maThongBao: input.maThongBao,
    tieuDe: input.tieuDe,
    noiDung: input.noiDung,
    tepDinhKemTen: input.tepDinhKemTen,
    tepDinhKemUrl: input.tepDinhKemUrl,
    phamVi: input.phamVi,
    doiTuong: input.doiTuong,
    nguoiTaoId: input.nguoiTaoId,
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(thongBao)
    .where(and(eq(thongBao.donViId, input.donViId), eq(thongBao.maThongBao, input.maThongBao)))
    .limit(1);

  return rows[0] ?? null;
}
