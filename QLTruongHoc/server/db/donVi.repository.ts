import { and, count, eq, ne } from "drizzle-orm";

import {
  donVi,
  nguoiDungVaiTroDonVi,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listAllDonVi() {
  const db = getDb();

  return db
    .select()
    .from(donVi)
    .orderBy(donVi.donViChaId, donVi.tenDonVi);
}

export async function findDonViById(id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(donVi)
    .where(eq(donVi.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findDonViByCode(maDonVi: string) {
  const db = getDb();

  const rows = await db
    .select()
    .from(donVi)
    .where(eq(donVi.maDonVi, maDonVi))
    .limit(1);

  return rows[0] ?? null;
}

export async function countActiveChildren(parentId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(donVi)
    .where(
      and(
        eq(donVi.donViChaId, parentId),
        ne(donVi.trangThai, "ngung_hoat_dong"),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function countActiveAssignments(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(nguoiDungVaiTroDonVi)
    .where(
      and(
        eq(nguoiDungVaiTroDonVi.donViId, donViId),
        eq(nguoiDungVaiTroDonVi.dangHoatDong, true),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function createDonVi(input: {
  donViChaId: number | null;
  maDonVi: string;
  tenDonVi: string;
  loaiDonVi: "he_thong" | "truong" | "trung_tam" | "co_so";
  loaiHinhDaoTao: "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac" | null;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
}) {
  const db = getDb();

  await db.insert(donVi).values({
    donViChaId: input.donViChaId,
    maDonVi: input.maDonVi,
    tenDonVi: input.tenDonVi,
    loaiDonVi: input.loaiDonVi,
    loaiHinhDaoTao: input.loaiHinhDaoTao,
    diaChi: input.diaChi,
    soDienThoai: input.soDienThoai,
    email: input.email,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  return findDonViByCode(input.maDonVi);
}

export async function updateDonVi(input: {
  id: number;
  tenDonVi: string;
  loaiDonVi: "he_thong" | "truong" | "trung_tam" | "co_so";
  loaiHinhDaoTao: "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac" | null;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
}) {
  const db = getDb();

  await db
    .update(donVi)
    .set({
      tenDonVi: input.tenDonVi,
      loaiDonVi: input.loaiDonVi,
      loaiHinhDaoTao: input.loaiHinhDaoTao,
      diaChi: input.diaChi,
      soDienThoai: input.soDienThoai,
      email: input.email,
      updatedAt: now(),
    })
    .where(eq(donVi.id, input.id));

  return findDonViById(input.id);
}

export async function updateDonViStatus(input: {
  id: number;
  trangThai: "hoat_dong" | "tam_ngung" | "ngung_hoat_dong";
}) {
  const db = getDb();

  await db
    .update(donVi)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(donVi.id, input.id));

  return findDonViById(input.id);
}
