import { and, eq } from "drizzle-orm";

import {
  danhMucKhoanThu,
  donVi,
  kyThu,
  kyThuKhoanThu,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

// ---------------------------------------------------------------
// Danh mục khoản thu
// ---------------------------------------------------------------

export async function listDanhMucKhoanThuByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(danhMucKhoanThu)
    .where(eq(danhMucKhoanThu.donViId, donViId))
    .orderBy(danhMucKhoanThu.tenKhoanThu);
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động. */
export async function listDanhMucKhoanThuAllDonVi() {
  const db = getDb();

  return db
    .select({
      khoanThu: danhMucKhoanThu,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(danhMucKhoanThu)
    .innerJoin(donVi, eq(danhMucKhoanThu.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, danhMucKhoanThu.tenKhoanThu);
}

export async function findDanhMucKhoanThuById(
  donViId: number,
  id: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(danhMucKhoanThu)
    .where(
      and(
        eq(danhMucKhoanThu.id, id),
        eq(danhMucKhoanThu.donViId, donViId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findDanhMucKhoanThuByMa(
  donViId: number,
  maKhoanThu: string,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(danhMucKhoanThu)
    .where(
      and(
        eq(danhMucKhoanThu.donViId, donViId),
        eq(danhMucKhoanThu.maKhoanThu, maKhoanThu),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createDanhMucKhoanThu(input: {
  donViId: number;
  maKhoanThu: string;
  tenKhoanThu: string;
  loaiKhoanThu: "hoc_phi" | "tien_an" | "dich_vu" | "tai_lieu" | "khac";
  soTienMacDinh: string | null;
  batBuoc: "co" | "khong";
}) {
  const db = getDb();

  await db.insert(danhMucKhoanThu).values({
    donViId: input.donViId,
    maKhoanThu: input.maKhoanThu,
    tenKhoanThu: input.tenKhoanThu,
    loaiKhoanThu: input.loaiKhoanThu,
    soTienMacDinh: input.soTienMacDinh,
    batBuoc: input.batBuoc,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  return findDanhMucKhoanThuByMa(input.donViId, input.maKhoanThu);
}

export async function updateDanhMucKhoanThu(input: {
  id: number;
  tenKhoanThu: string;
  loaiKhoanThu: "hoc_phi" | "tien_an" | "dich_vu" | "tai_lieu" | "khac";
  soTienMacDinh: string | null;
  batBuoc: "co" | "khong";
}) {
  const db = getDb();

  await db
    .update(danhMucKhoanThu)
    .set({
      tenKhoanThu: input.tenKhoanThu,
      loaiKhoanThu: input.loaiKhoanThu,
      soTienMacDinh: input.soTienMacDinh,
      batBuoc: input.batBuoc,
      updatedAt: now(),
    })
    .where(eq(danhMucKhoanThu.id, input.id));

  const rows = await db
    .select()
    .from(danhMucKhoanThu)
    .where(eq(danhMucKhoanThu.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function setDanhMucKhoanThuTrangThai(input: {
  id: number;
  trangThai: "hoat_dong" | "ngung_ap_dung";
}) {
  const db = getDb();

  await db
    .update(danhMucKhoanThu)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(danhMucKhoanThu.id, input.id));

  const rows = await db
    .select()
    .from(danhMucKhoanThu)
    .where(eq(danhMucKhoanThu.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

// ---------------------------------------------------------------
// Kỳ thu
// ---------------------------------------------------------------

export async function listKyThuByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(kyThu)
    .where(eq(kyThu.donViId, donViId))
    .orderBy(kyThu.tuNgay);
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động. */
export async function listKyThuAllDonVi() {
  const db = getDb();

  return db
    .select({
      kyThu,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(kyThu)
    .innerJoin(donVi, eq(kyThu.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, kyThu.tuNgay);
}

export async function findKyThuById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(kyThu)
    .where(and(eq(kyThu.id, id), eq(kyThu.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findKyThuByMa(donViId: number, maKyThu: string) {
  const db = getDb();

  const rows = await db
    .select()
    .from(kyThu)
    .where(
      and(eq(kyThu.donViId, donViId), eq(kyThu.maKyThu, maKyThu)),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createKyThu(input: {
  donViId: number;
  maKyThu: string;
  tenKyThu: string;
  loaiKy: "thang" | "khoa_hoc" | "hoc_ky" | "dot";
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string | null;
}) {
  const db = getDb();

  await db.insert(kyThu).values({
    donViId: input.donViId,
    maKyThu: input.maKyThu,
    tenKyThu: input.tenKyThu,
    loaiKy: input.loaiKy,
    tuNgay: input.tuNgay,
    denNgay: input.denNgay,
    hanThanhToan: input.hanThanhToan,
    trangThai: "nhap",
    createdAt: now(),
    updatedAt: now(),
  });

  return findKyThuByMa(input.donViId, input.maKyThu);
}

export async function updateKyThu(input: {
  id: number;
  tenKyThu: string;
  loaiKy: "thang" | "khoa_hoc" | "hoc_ky" | "dot";
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string | null;
}) {
  const db = getDb();

  await db
    .update(kyThu)
    .set({
      tenKyThu: input.tenKyThu,
      loaiKy: input.loaiKy,
      tuNgay: input.tuNgay,
      denNgay: input.denNgay,
      hanThanhToan: input.hanThanhToan,
      updatedAt: now(),
    })
    .where(eq(kyThu.id, input.id));

  const rows = await db
    .select()
    .from(kyThu)
    .where(eq(kyThu.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function setKyThuTrangThai(input: {
  id: number;
  trangThai: "nhap" | "da_mo" | "da_dong";
}) {
  const db = getDb();

  await db
    .update(kyThu)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(kyThu.id, input.id));

  const rows = await db
    .select()
    .from(kyThu)
    .where(eq(kyThu.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

// ---------------------------------------------------------------
// Khoản thu áp dụng cho kỳ thu
// ---------------------------------------------------------------

export async function listKyThuKhoanThu(kyThuId: number) {
  const db = getDb();

  return db
    .select({
      apDung: kyThuKhoanThu,
      khoanThu: danhMucKhoanThu,
    })
    .from(kyThuKhoanThu)
    .innerJoin(
      danhMucKhoanThu,
      eq(kyThuKhoanThu.danhMucKhoanThuId, danhMucKhoanThu.id),
    )
    .where(eq(kyThuKhoanThu.kyThuId, kyThuId))
    .orderBy(danhMucKhoanThu.tenKhoanThu);
}

export async function replaceKyThuKhoanThu(input: {
  kyThuId: number;
  danhSach: {
    danhMucKhoanThuId: number;
    soTien: string;
    ghiChu: string | null;
  }[];
}) {
  const db = getDb();

  await db
    .delete(kyThuKhoanThu)
    .where(eq(kyThuKhoanThu.kyThuId, input.kyThuId));

  if (input.danhSach.length === 0) {
    return;
  }

  await db.insert(kyThuKhoanThu).values(
    input.danhSach.map((item) => ({
      kyThuId: input.kyThuId,
      danhMucKhoanThuId: item.danhMucKhoanThuId,
      soTien: item.soTien,
      ghiChu: item.ghiChu,
      createdAt: now(),
      updatedAt: now(),
    })),
  );
}
