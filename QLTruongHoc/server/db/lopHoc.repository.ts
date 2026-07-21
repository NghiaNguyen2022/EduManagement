import { and, count, eq, isNull, or } from "drizzle-orm";

import {
  giaoVien,
  hocSinh,
  hocSinhLopHoc,
  lopHoc,
  lopHocGiaoVien,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listLopHocByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(lopHoc)
    .where(eq(lopHoc.donViId, donViId))
    .orderBy(lopHoc.tenLop);
}

export async function findLopHocById(
  donViId: number,
  id: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(lopHoc)
    .where(
      and(
        eq(lopHoc.id, id),
        eq(lopHoc.donViId, donViId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findLopHocByMa(
  donViId: number,
  maLop: string,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(lopHoc)
    .where(
      and(
        eq(lopHoc.donViId, donViId),
        eq(lopHoc.maLop, maLop),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createLopHoc(input: {
  donViId: number;
  chuongTrinhDaoTaoId: number | null;
  maLop: string;
  tenLop: string;
  capDo: string | null;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  siSoToiDa: number | null;
  phongHoc: string | null;
}) {
  const db = getDb();

  await db.insert(lopHoc).values({
    donViId: input.donViId,
    chuongTrinhDaoTaoId: input.chuongTrinhDaoTaoId,
    maLop: input.maLop,
    tenLop: input.tenLop,
    capDo: input.capDo,
    ngayBatDau: input.ngayBatDau,
    ngayKetThuc: input.ngayKetThuc,
    siSoToiDa: input.siSoToiDa,
    phongHoc: input.phongHoc,
    trangThai: "chuan_bi",
    createdAt: now(),
    updatedAt: now(),
  });

  return findLopHocByMa(input.donViId, input.maLop);
}

export async function updateLopHoc(input: {
  id: number;
  chuongTrinhDaoTaoId: number | null;
  tenLop: string;
  capDo: string | null;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  siSoToiDa: number | null;
  phongHoc: string | null;
}) {
  const db = getDb();

  await db
    .update(lopHoc)
    .set({
      chuongTrinhDaoTaoId: input.chuongTrinhDaoTaoId,
      tenLop: input.tenLop,
      capDo: input.capDo,
      ngayBatDau: input.ngayBatDau,
      ngayKetThuc: input.ngayKetThuc,
      siSoToiDa: input.siSoToiDa,
      phongHoc: input.phongHoc,
      updatedAt: now(),
    })
    .where(eq(lopHoc.id, input.id));

  const rows = await getDb()
    .select()
    .from(lopHoc)
    .where(eq(lopHoc.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function setLopHocTrangThai(input: {
  id: number;
  trangThai: "chuan_bi" | "dang_hoc" | "tam_dung" | "ket_thuc" | "huy";
}) {
  const db = getDb();

  await db
    .update(lopHoc)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(lopHoc.id, input.id));

  const rows = await db
    .select()
    .from(lopHoc)
    .where(eq(lopHoc.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

// ---- Phân công giáo viên ----

export async function listPhanCongGiaoVien(lopHocId: number) {
  const db = getDb();

  return db
    .select({
      phanCong: lopHocGiaoVien,
      giaoVien,
    })
    .from(lopHocGiaoVien)
    .innerJoin(
      giaoVien,
      eq(lopHocGiaoVien.giaoVienId, giaoVien.id),
    )
    .where(eq(lopHocGiaoVien.lopHocId, lopHocId));
}

export async function findGiaoVienChinhDangHoatDong(
  lopHocId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(lopHocGiaoVien)
    .where(
      and(
        eq(lopHocGiaoVien.lopHocId, lopHocId),
        eq(lopHocGiaoVien.vaiTro, "giao_vien_chinh"),
        eq(lopHocGiaoVien.trangThai, "hoat_dong"),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createPhanCongGiaoVien(input: {
  lopHocId: number;
  giaoVienId: number;
  vaiTro: "giao_vien_chinh" | "ho_tro" | "chu_nhiem";
  tuNgay: string;
}) {
  const db = getDb();

  await db.insert(lopHocGiaoVien).values({
    lopHocId: input.lopHocId,
    giaoVienId: input.giaoVienId,
    vaiTro: input.vaiTro,
    tuNgay: input.tuNgay,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(lopHocGiaoVien)
    .where(
      and(
        eq(lopHocGiaoVien.lopHocId, input.lopHocId),
        eq(lopHocGiaoVien.giaoVienId, input.giaoVienId),
        eq(lopHocGiaoVien.trangThai, "hoat_dong"),
      ),
    )
    .orderBy(lopHocGiaoVien.id)
    .limit(1);

  return rows[rows.length - 1] ?? null;
}

export async function findPhanCongGiaoVienById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      phanCong: lopHocGiaoVien,
      donViId: lopHoc.donViId,
    })
    .from(lopHocGiaoVien)
    .innerJoin(lopHoc, eq(lopHocGiaoVien.lopHocId, lopHoc.id))
    .where(eq(lopHocGiaoVien.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function endPhanCongGiaoVien(input: {
  id: number;
  denNgay: string;
}) {
  const db = getDb();

  await db
    .update(lopHocGiaoVien)
    .set({
      denNgay: input.denNgay,
      trangThai: "ngung_hoat_dong",
      updatedAt: now(),
    })
    .where(eq(lopHocGiaoVien.id, input.id));
}

// ---- Xếp/chuyển học sinh vào lớp ----

export async function listHocSinhTrongLop(lopHocId: number) {
  const db = getDb();

  return db
    .select({
      enrollment: hocSinhLopHoc,
      hocSinh,
    })
    .from(hocSinhLopHoc)
    .innerJoin(hocSinh, eq(hocSinhLopHoc.hocSinhId, hocSinh.id))
    .where(eq(hocSinhLopHoc.lopHocId, lopHocId));
}

export async function countHocSinhDangHocTrongLop(
  lopHocId: number,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinhLopHoc)
    .where(
      and(
        eq(hocSinhLopHoc.lopHocId, lopHocId),
        or(
          eq(hocSinhLopHoc.trangThai, "dang_hoc"),
          eq(hocSinhLopHoc.trangThai, "bao_luu"),
        ),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function findEnrollmentDangHoc(
  hocSinhId: number,
  lopHocId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(hocSinhLopHoc)
    .where(
      and(
        eq(hocSinhLopHoc.hocSinhId, hocSinhId),
        eq(hocSinhLopHoc.lopHocId, lopHocId),
        isNull(hocSinhLopHoc.ngayRoiLop),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findEnrollmentById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      enrollment: hocSinhLopHoc,
      donViId: lopHoc.donViId,
    })
    .from(hocSinhLopHoc)
    .innerJoin(lopHoc, eq(hocSinhLopHoc.lopHocId, lopHoc.id))
    .where(eq(hocSinhLopHoc.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createEnrollment(input: {
  hocSinhId: number;
  lopHocId: number;
  ngayVaoLop: string;
}) {
  const db = getDb();

  await db.insert(hocSinhLopHoc).values({
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    ngayVaoLop: input.ngayVaoLop,
    trangThai: "dang_hoc",
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(hocSinhLopHoc)
    .where(
      and(
        eq(hocSinhLopHoc.hocSinhId, input.hocSinhId),
        eq(hocSinhLopHoc.lopHocId, input.lopHocId),
        isNull(hocSinhLopHoc.ngayRoiLop),
      ),
    )
    .orderBy(hocSinhLopHoc.id)
    .limit(1);

  return rows[rows.length - 1] ?? null;
}

export async function closeEnrollment(input: {
  id: number;
  ngayRoiLop: string;
  lyDoRoiLop: string | null;
  trangThai: "chuyen_lop" | "ngung_hoc" | "hoan_thanh";
}) {
  const db = getDb();

  await db
    .update(hocSinhLopHoc)
    .set({
      ngayRoiLop: input.ngayRoiLop,
      lyDoRoiLop: input.lyDoRoiLop,
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(hocSinhLopHoc.id, input.id));
}

export async function setEnrollmentTrangThai(input: {
  id: number;
  trangThai: "dang_hoc" | "bao_luu";
}) {
  const db = getDb();

  await db
    .update(hocSinhLopHoc)
    .set({
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(hocSinhLopHoc.id, input.id));
}
