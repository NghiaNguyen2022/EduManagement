import { and, count, eq, like } from "drizzle-orm";

import { hocSinh } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listHocSinhByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(hocSinh)
    .where(eq(hocSinh.donViId, donViId))
    .orderBy(hocSinh.hoTen);
}

export async function findHocSinhById(
  donViId: number,
  hocSinhId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(hocSinh)
    .where(
      and(
        eq(hocSinh.id, hocSinhId),
        eq(hocSinh.donViId, donViId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function countHocSinhTheoMaPrefix(
  donViId: number,
  prefix: string,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .where(
      and(
        eq(hocSinh.donViId, donViId),
        like(hocSinh.maHocSinh, `${prefix}%`),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function createHocSinh(input: {
  donViId: number;
  maHocSinh: string;
  hoTen: string;
  tenThuongGoi: string | null;
  ngaySinh: string | null;
  gioiTinh: "nam" | "nu" | "khac" | null;
  diaChi: string | null;
  ngayNhapHoc: string | null;
}) {
  const db = getDb();

  await db.insert(hocSinh).values({
    donViId: input.donViId,
    maHocSinh: input.maHocSinh,
    hoTen: input.hoTen,
    tenThuongGoi: input.tenThuongGoi,
    ngaySinh: input.ngaySinh,
    gioiTinh: input.gioiTinh,
    diaChi: input.diaChi,
    ngayNhapHoc: input.ngayNhapHoc,
    trangThai: "tiep_nhan",
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(hocSinh)
    .where(
      and(
        eq(hocSinh.donViId, input.donViId),
        eq(hocSinh.maHocSinh, input.maHocSinh),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function updateHocSinh(input: {
  id: number;
  hoTen: string;
  tenThuongGoi: string | null;
  ngaySinh: string | null;
  gioiTinh: "nam" | "nu" | "khac" | null;
  diaChi: string | null;
  ngayNhapHoc: string | null;
}) {
  const db = getDb();

  await db
    .update(hocSinh)
    .set({
      hoTen: input.hoTen,
      tenThuongGoi: input.tenThuongGoi,
      ngaySinh: input.ngaySinh,
      gioiTinh: input.gioiTinh,
      diaChi: input.diaChi,
      ngayNhapHoc: input.ngayNhapHoc,
      updatedAt: now(),
    })
    .where(eq(hocSinh.id, input.id));

  const rows = await db
    .select()
    .from(hocSinh)
    .where(eq(hocSinh.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateHocSinhTrangThai(input: {
  id: number;
  trangThai:
    | "tiep_nhan"
    | "dang_hoc"
    | "bao_luu"
    | "ngung_hoc"
    | "hoan_thanh";
}) {
  const db = getDb();

  await db
    .update(hocSinh)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(hocSinh.id, input.id));

  const rows = await db
    .select()
    .from(hocSinh)
    .where(eq(hocSinh.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}
