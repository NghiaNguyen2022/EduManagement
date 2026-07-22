import { and, count, eq, gte } from "drizzle-orm";

import { donVi, hocSinh, lead, lopHoc } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

export async function countHocSinhDangHoc(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .where(and(eq(hocSinh.donViId, donViId), eq(hocSinh.trangThai, "dang_hoc")));

  return rows[0]?.total ?? 0;
}

export async function countHocSinhDangHocAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .innerJoin(donVi, eq(hocSinh.donViId, donVi.id))
    .where(and(eq(hocSinh.trangThai, "dang_hoc"), eq(donVi.trangThai, "hoat_dong")));

  return rows[0]?.total ?? 0;
}

export async function countLopDangHoc(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lopHoc)
    .where(and(eq(lopHoc.donViId, donViId), eq(lopHoc.trangThai, "dang_hoc")));

  return rows[0]?.total ?? 0;
}

export async function countLopDangHocAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lopHoc)
    .innerJoin(donVi, eq(lopHoc.donViId, donVi.id))
    .where(and(eq(lopHoc.trangThai, "dang_hoc"), eq(donVi.trangThai, "hoat_dong")));

  return rows[0]?.total ?? 0;
}

export async function countLeadMoiTuNgay(donViId: number, tuNgay: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lead)
    .where(and(eq(lead.donViId, donViId), gte(lead.createdAt, tuNgay)));

  return rows[0]?.total ?? 0;
}

export async function countLeadMoiTuNgayAllDonVi(tuNgay: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lead)
    .innerJoin(donVi, eq(lead.donViId, donVi.id))
    .where(and(gte(lead.createdAt, tuNgay), eq(donVi.trangThai, "hoat_dong")));

  return rows[0]?.total ?? 0;
}
