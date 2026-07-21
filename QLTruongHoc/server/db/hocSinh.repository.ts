import { and, count, desc, eq, like } from "drizzle-orm";

import {
  donVi,
  hocSinh,
  hocSinhTrangThaiLichSu,
} from "../../drizzle/schema.js";
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

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listHocSinhAllDonVi() {
  const db = getDb();

  return db
    .select({
      hocSinh,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(hocSinh)
    .innerJoin(donVi, eq(hocSinh.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, hocSinh.hoTen);
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

export async function createTrangThaiLichSu(input: {
  hocSinhId: number;
  trangThaiCu:
    | "tiep_nhan"
    | "dang_hoc"
    | "bao_luu"
    | "ngung_hoc"
    | "hoan_thanh"
    | null;
  trangThaiMoi:
    | "tiep_nhan"
    | "dang_hoc"
    | "bao_luu"
    | "ngung_hoc"
    | "hoan_thanh";
  lyDo: string | null;
  ngayHieuLuc: string;
  actorUserId: number | null;
}) {
  const db = getDb();

  await db.insert(hocSinhTrangThaiLichSu).values({
    hocSinhId: input.hocSinhId,
    trangThaiCu: input.trangThaiCu,
    trangThaiMoi: input.trangThaiMoi,
    lyDo: input.lyDo,
    ngayHieuLuc: input.ngayHieuLuc,
    actorUserId: input.actorUserId,
    createdAt: now(),
  });
}

export async function listTrangThaiLichSuByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select()
    .from(hocSinhTrangThaiLichSu)
    .where(eq(hocSinhTrangThaiLichSu.hocSinhId, hocSinhId))
    .orderBy(desc(hocSinhTrangThaiLichSu.createdAt));
}
