import { and, count, eq, gte, ne } from "drizzle-orm";

import { donVi, giaoVien, hocSinh, lead, lopHoc } from "../../drizzle/schema.js";
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

export async function countGiaoVienHoatDong(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(giaoVien)
    .where(and(eq(giaoVien.donViId, donViId), eq(giaoVien.trangThai, "hoat_dong")));

  return rows[0]?.total ?? 0;
}

export async function countGiaoVienHoatDongAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(giaoVien)
    .innerJoin(donVi, eq(giaoVien.donViId, donVi.id))
    .where(and(eq(giaoVien.trangThai, "hoat_dong"), eq(donVi.trangThai, "hoat_dong")));

  return rows[0]?.total ?? 0;
}

/** Học sinh đang bảo lưu tại một đơn vị — dùng cho Portal học vụ (cần theo dõi để hỗ trợ quay lại học). */
export async function countHocSinhBaoLuu(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .where(and(eq(hocSinh.donViId, donViId), eq(hocSinh.trangThai, "bao_luu")));

  return rows[0]?.total ?? 0;
}

/** Học sinh đang bảo lưu, theo TỪNG đơn vị — dùng cho Bảng điều hành hệ thống. */
export async function countHocSinhBaoLuuTheoDonVi() {
  const db = getDb();

  return db
    .select({
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      soLuong: count(hocSinh.id),
    })
    .from(donVi)
    .leftJoin(
      hocSinh,
      and(eq(hocSinh.donViId, donVi.id), eq(hocSinh.trangThai, "bao_luu")),
    )
    .where(and(eq(donVi.trangThai, "hoat_dong"), ne(donVi.loaiDonVi, "he_thong")))
    .groupBy(donVi.id);
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

/** Lead mới từ đầu tháng, theo TỪNG đơn vị — dùng cho Bảng điều hành hệ thống. */
export async function countLeadMoiTheoDonVi(tuNgay: string) {
  const db = getDb();

  return db
    .select({
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      soLuong: count(lead.id),
    })
    .from(donVi)
    .leftJoin(
      lead,
      and(eq(lead.donViId, donVi.id), gte(lead.createdAt, tuNgay)),
    )
    .where(and(eq(donVi.trangThai, "hoat_dong"), ne(donVi.loaiDonVi, "he_thong")))
    .groupBy(donVi.id);
}
