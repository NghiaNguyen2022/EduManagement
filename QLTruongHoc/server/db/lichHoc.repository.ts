import {
  and,
  eq,
  gte,
  inArray,
  lte,
  ne,
  or,
} from "drizzle-orm";

import {
  buoiHoc,
  giaoVien,
  lichHoc,
  lopHoc,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

// ---- LichHoc (quy tắc lặp lại) ----

export async function listLichHocByLopHoc(lopHocId: number) {
  const db = getDb();

  return db
    .select()
    .from(lichHoc)
    .where(eq(lichHoc.lopHocId, lopHocId))
    .orderBy(lichHoc.thuTrongTuan, lichHoc.gioBatDau);
}

export async function findLichHocById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      lichHoc,
      donViId: lopHoc.donViId,
      lopHocTrangThai: lopHoc.trangThai,
    })
    .from(lichHoc)
    .innerJoin(lopHoc, eq(lichHoc.lopHocId, lopHoc.id))
    .where(eq(lichHoc.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createLichHoc(input: {
  lopHocId: number;
  thuTrongTuan: number;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc: string | null;
  giaoVienId: number | null;
  ngayApDungTu: string;
  ngayApDungDen: string | null;
}) {
  const db = getDb();

  await db.insert(lichHoc).values({
    lopHocId: input.lopHocId,
    thuTrongTuan: input.thuTrongTuan,
    gioBatDau: input.gioBatDau,
    gioKetThuc: input.gioKetThuc,
    phongHoc: input.phongHoc,
    giaoVienId: input.giaoVienId,
    ngayApDungTu: input.ngayApDungTu,
    ngayApDungDen: input.ngayApDungDen,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(lichHoc)
    .where(
      and(
        eq(lichHoc.lopHocId, input.lopHocId),
        eq(lichHoc.thuTrongTuan, input.thuTrongTuan),
        eq(lichHoc.gioBatDau, input.gioBatDau),
      ),
    )
    .orderBy(lichHoc.id)
    .limit(1);

  return rows[rows.length - 1] ?? null;
}

export async function setLichHocTrangThai(input: {
  id: number;
  trangThai: "hoat_dong" | "ngung_hoat_dong";
}) {
  const db = getDb();

  await db
    .update(lichHoc)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(lichHoc.id, input.id));

  const rows = await db
    .select()
    .from(lichHoc)
    .where(eq(lichHoc.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

// ---- BuoiHoc (buổi học cụ thể) ----

export async function listBuoiHocByLopHoc(input: {
  lopHocId: number;
  tuNgay?: string;
  denNgay?: string;
}) {
  const db = getDb();

  const conditions = [eq(buoiHoc.lopHocId, input.lopHocId)];

  if (input.tuNgay) {
    conditions.push(gte(buoiHoc.ngayHoc, input.tuNgay));
  }

  if (input.denNgay) {
    conditions.push(lte(buoiHoc.ngayHoc, input.denNgay));
  }

  return db
    .select()
    .from(buoiHoc)
    .where(and(...conditions))
    .orderBy(buoiHoc.ngayHoc, buoiHoc.gioBatDau);
}

export async function listBuoiHocByDonVi(input: {
  donViId: number;
  tuNgay: string;
  denNgay: string;
  giaoVienId?: number;
}) {
  const db = getDb();

  const conditions = [
    eq(lopHoc.donViId, input.donViId),
    gte(buoiHoc.ngayHoc, input.tuNgay),
    lte(buoiHoc.ngayHoc, input.denNgay),
  ];

  if (input.giaoVienId) {
    conditions.push(eq(buoiHoc.giaoVienId, input.giaoVienId));
  }

  return db
    .select({
      buoiHoc,
      lopHocTenLop: lopHoc.tenLop,
      lopHocMaLop: lopHoc.maLop,
      giaoVienHoTen: giaoVien.hoTen,
    })
    .from(buoiHoc)
    .innerJoin(lopHoc, eq(buoiHoc.lopHocId, lopHoc.id))
    .leftJoin(giaoVien, eq(buoiHoc.giaoVienId, giaoVien.id))
    .where(and(...conditions))
    .orderBy(buoiHoc.ngayHoc, buoiHoc.gioBatDau);
}

export async function findBuoiHocById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      buoiHoc,
      donViId: lopHoc.donViId,
    })
    .from(buoiHoc)
    .innerJoin(lopHoc, eq(buoiHoc.lopHocId, lopHoc.id))
    .where(eq(buoiHoc.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findExistingBuoiHocNgay(input: {
  lichHocId: number;
  ngayHocList: string[];
}) {
  if (input.ngayHocList.length === 0) {
    return [];
  }

  const db = getDb();

  const rows = await db
    .select({ ngayHoc: buoiHoc.ngayHoc })
    .from(buoiHoc)
    .where(
      and(
        eq(buoiHoc.lichHocId, input.lichHocId),
        inArray(buoiHoc.ngayHoc, input.ngayHocList),
      ),
    );

  return rows.map((row) => row.ngayHoc);
}

/**
 * Tìm các BuoiHoc đang chiếm phòng/giáo viên trong cùng đơn vị, cùng ngày, khung giờ
 * chồng lấn — dùng cho kiểm tra trùng (E06). Bỏ qua buổi đã huỷ/nghỉ và buổi đang tự sửa
 * (excludeId).
 */
export async function findConflictingBuoiHoc(input: {
  donViId: number;
  ngayHoc: string;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc: string | null;
  giaoVienId: number | null;
  excludeId?: number;
}) {
  if (!input.phongHoc && !input.giaoVienId) {
    return [];
  }

  const db = getDb();

  const resourceConditions = [];

  if (input.phongHoc) {
    resourceConditions.push(eq(buoiHoc.phongHoc, input.phongHoc));
  }

  if (input.giaoVienId) {
    resourceConditions.push(eq(buoiHoc.giaoVienId, input.giaoVienId));
  }

  const conditions = [
    eq(lopHoc.donViId, input.donViId),
    eq(buoiHoc.ngayHoc, input.ngayHoc),
    ne(buoiHoc.trangThai, "huy"),
    ne(buoiHoc.trangThai, "nghi"),
    lte(buoiHoc.gioBatDau, input.gioKetThuc),
    gte(buoiHoc.gioKetThuc, input.gioBatDau),
    or(...resourceConditions),
  ];

  if (input.excludeId) {
    conditions.push(ne(buoiHoc.id, input.excludeId));
  }

  return db
    .select({
      buoiHoc,
      lopHocTenLop: lopHoc.tenLop,
    })
    .from(buoiHoc)
    .innerJoin(lopHoc, eq(buoiHoc.lopHocId, lopHoc.id))
    .where(and(...conditions));
}

export async function createBuoiHocBulk(
  rows: {
    lopHocId: number;
    lichHocId: number | null;
    ngayHoc: string;
    gioBatDau: string;
    gioKetThuc: string;
    phongHoc: string | null;
    giaoVienId: number | null;
    loaiBuoi: "thuong" | "bu";
  }[],
) {
  if (rows.length === 0) {
    return;
  }

  const db = getDb();
  const timestamp = now();

  await db.insert(buoiHoc).values(
    rows.map((row) => ({
      ...row,
      trangThai: "du_kien" as const,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  );
}

export async function updateBuoiHocChiTiet(input: {
  id: number;
  gioBatDau: string;
  gioKetThuc: string;
  phongHoc: string | null;
  giaoVienId: number | null;
}) {
  const db = getDb();

  await db
    .update(buoiHoc)
    .set({
      gioBatDau: input.gioBatDau,
      gioKetThuc: input.gioKetThuc,
      phongHoc: input.phongHoc,
      giaoVienId: input.giaoVienId,
      updatedAt: now(),
    })
    .where(eq(buoiHoc.id, input.id));

  const rows = await db
    .select()
    .from(buoiHoc)
    .where(eq(buoiHoc.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateBuoiHocTrangThai(input: {
  id: number;
  trangThai: "du_kien" | "da_hoc" | "nghi" | "huy";
  ghiChu?: string | null;
}) {
  const db = getDb();

  await db
    .update(buoiHoc)
    .set({
      trangThai: input.trangThai,
      ghiChu: input.ghiChu ?? undefined,
      updatedAt: now(),
    })
    .where(eq(buoiHoc.id, input.id));

  const rows = await db
    .select()
    .from(buoiHoc)
    .where(eq(buoiHoc.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}
