import { and, count, desc, eq, gte, like, lte, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";

import {
  cauHinhTaiChinhDonVi,
  chiPhi,
  danhMucChiPhi,
  donVi,
  nguoiDung,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const nguoiTaoAlias = alias(nguoiDung, "chiPhiNguoiTao");
const nguoiDuyetAlias = alias(nguoiDung, "chiPhiNguoiDuyet");
const danhMucNguoiTaoAlias = alias(nguoiDung, "danhMucChiPhiNguoiTao");
const danhMucNguoiDuyetAlias = alias(nguoiDung, "danhMucChiPhiNguoiDuyet");

// ---------------------------------------------------------------
// Danh mục chi phí
// ---------------------------------------------------------------

export async function listDanhMucChiPhiByDonVi(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({
      danhMuc: danhMucChiPhi,
      nguoiTaoHoTen: danhMucNguoiTaoAlias.hoTen,
      nguoiDuyetHoTen: danhMucNguoiDuyetAlias.hoTen,
    })
    .from(danhMucChiPhi)
    .leftJoin(danhMucNguoiTaoAlias, eq(danhMucChiPhi.nguoiTaoId, danhMucNguoiTaoAlias.id))
    .leftJoin(danhMucNguoiDuyetAlias, eq(danhMucChiPhi.nguoiDuyetId, danhMucNguoiDuyetAlias.id))
    .where(eq(danhMucChiPhi.donViId, donViId))
    .orderBy(danhMucChiPhi.tenChiPhi);

  return rows.map((row) => ({
    ...row.danhMuc,
    nguoiTaoHoTen: row.nguoiTaoHoTen,
    nguoiDuyetHoTen: row.nguoiDuyetHoTen,
  }));
}

export async function findDanhMucChiPhiById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(danhMucChiPhi)
    .where(and(eq(danhMucChiPhi.id, id), eq(danhMucChiPhi.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findDanhMucChiPhiByMa(donViId: number, maChiPhi: string) {
  const db = getDb();

  const rows = await db
    .select()
    .from(danhMucChiPhi)
    .where(and(eq(danhMucChiPhi.donViId, donViId), eq(danhMucChiPhi.maChiPhi, maChiPhi)))
    .limit(1);

  return rows[0] ?? null;
}

export async function countDanhMucChiPhiTheoMaPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(danhMucChiPhi)
    .where(and(eq(danhMucChiPhi.donViId, donViId), like(danhMucChiPhi.maChiPhi, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function createDanhMucChiPhi(input: {
  donViId: number;
  maChiPhi: string;
  tenChiPhi: string;
  loaiChiPhi: "luong" | "mat_bang" | "dien_nuoc" | "vat_tu" | "marketing" | "khac";
  trangThaiDuyet: "khong_can_duyet" | "cho_duyet";
  nguoiTaoId: number;
}) {
  const db = getDb();
  const createdAt = now();

  await db.insert(danhMucChiPhi).values({
    donViId: input.donViId,
    maChiPhi: input.maChiPhi,
    tenChiPhi: input.tenChiPhi,
    loaiChiPhi: input.loaiChiPhi,
    trangThai: "hoat_dong",
    trangThaiDuyet: input.trangThaiDuyet,
    nguoiTaoId: input.nguoiTaoId,
    createdAt,
    updatedAt: createdAt,
  });

  return findDanhMucChiPhiByMa(input.donViId, input.maChiPhi);
}

export async function setDanhMucChiPhiTrangThai(input: {
  id: number;
  donViId: number;
  trangThai: "hoat_dong" | "ngung_ap_dung";
}) {
  const db = getDb();

  await db
    .update(danhMucChiPhi)
    .set({ trangThai: input.trangThai, updatedAt: now() })
    .where(and(eq(danhMucChiPhi.id, input.id), eq(danhMucChiPhi.donViId, input.donViId)));

  return findDanhMucChiPhiById(input.donViId, input.id);
}

export async function updateDanhMucChiPhiQuyetDinh(input: {
  id: number;
  trangThaiDuyet: "da_duyet" | "tu_choi";
  nguoiDuyetId: number;
  ghiChuDuyet: string | null;
}) {
  const db = getDb();

  await db
    .update(danhMucChiPhi)
    .set({
      trangThaiDuyet: input.trangThaiDuyet,
      nguoiDuyetId: input.nguoiDuyetId,
      ghiChuDuyet: input.ghiChuDuyet,
      duyetAt: now(),
      updatedAt: now(),
    })
    .where(eq(danhMucChiPhi.id, input.id));

  return db
    .select()
    .from(danhMucChiPhi)
    .where(eq(danhMucChiPhi.id, input.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

/** Danh mục còn CHỜ DUYỆT — dùng cho khối "Cần chú ý"/màn duyệt của quản lý đơn vị. */
export async function listDanhMucChiPhiChoDuyet(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({
      danhMuc: danhMucChiPhi,
      nguoiTaoHoTen: danhMucNguoiTaoAlias.hoTen,
    })
    .from(danhMucChiPhi)
    .leftJoin(danhMucNguoiTaoAlias, eq(danhMucChiPhi.nguoiTaoId, danhMucNguoiTaoAlias.id))
    .where(
      and(eq(danhMucChiPhi.donViId, donViId), eq(danhMucChiPhi.trangThaiDuyet, "cho_duyet")),
    )
    .orderBy(desc(danhMucChiPhi.createdAt));

  return rows.map((row) => ({ ...row.danhMuc, nguoiTaoHoTen: row.nguoiTaoHoTen }));
}

export async function countDanhMucChiPhiChoDuyet(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(danhMucChiPhi)
    .where(
      and(eq(danhMucChiPhi.donViId, donViId), eq(danhMucChiPhi.trangThaiDuyet, "cho_duyet")),
    );

  return rows[0]?.total ?? 0;
}

// ---------------------------------------------------------------
// Chi phí (đề xuất chi — chờ duyệt trước khi tính vào báo cáo, xem H08-style
// duyệt ở dieuChinhKhoanPhaiThu; quyết định đảo ngược "ghi nhận trực tiếp"
// cũ ghi ở drizzle/schemas/taiChinh.ts và docs/analysis/QUAN_LY_DON_VI_UX_VONG_2.md)
// ---------------------------------------------------------------

function mapChiPhiRow(row: {
  chiPhi: typeof chiPhi.$inferSelect;
  nguoiTaoHoTen: string;
  nguoiTaoTenDangNhap: string;
  nguoiDuyetHoTen: string | null;
  nguoiDuyetTenDangNhap: string | null;
}) {
  return {
    ...row.chiPhi,
    nguoiTao: {
      id: row.chiPhi.nguoiTaoId,
      hoTen: row.nguoiTaoHoTen,
      tenDangNhap: row.nguoiTaoTenDangNhap,
    },
    nguoiDuyet: row.chiPhi.nguoiDuyetId
      ? {
          id: row.chiPhi.nguoiDuyetId,
          hoTen: row.nguoiDuyetHoTen ?? "",
          tenDangNhap: row.nguoiDuyetTenDangNhap ?? "",
        }
      : null,
  };
}

export async function createChiPhi(input: {
  donViId: number;
  danhMucChiPhiId: number;
  soTien: string;
  ngayChi: string;
  moTa: string | null;
  loaiDeXuat: "dinh_ky" | "dot_xuat";
  trangThai: "cho_duyet" | "da_duyet";
  nguoiTaoId: number;
}) {
  const db = getDb();
  const createdAt = now();

  await db.insert(chiPhi).values({
    donViId: input.donViId,
    danhMucChiPhiId: input.danhMucChiPhiId,
    soTien: input.soTien,
    ngayChi: input.ngayChi,
    moTa: input.moTa,
    loaiDeXuat: input.loaiDeXuat,
    trangThai: input.trangThai,
    nguoiTaoId: input.nguoiTaoId,
    createdAt,
    updatedAt: createdAt,
  });

  const rows = await db
    .select()
    .from(chiPhi)
    .where(
      and(
        eq(chiPhi.donViId, input.donViId),
        eq(chiPhi.danhMucChiPhiId, input.danhMucChiPhiId),
        eq(chiPhi.createdAt, createdAt),
      ),
    )
    .orderBy(desc(chiPhi.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findChiPhiById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(chiPhi)
    .where(and(eq(chiPhi.id, id), eq(chiPhi.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateChiPhiQuyetDinh(input: {
  id: number;
  trangThai: "da_duyet" | "tu_choi";
  nguoiDuyetId: number;
  ghiChuDuyet: string | null;
}) {
  const db = getDb();

  await db
    .update(chiPhi)
    .set({
      trangThai: input.trangThai,
      nguoiDuyetId: input.nguoiDuyetId,
      ghiChuDuyet: input.ghiChuDuyet,
      duyetAt: now(),
      updatedAt: now(),
    })
    .where(eq(chiPhi.id, input.id));

  const rows = await db.select().from(chiPhi).where(eq(chiPhi.id, input.id)).limit(1);

  return rows[0] ?? null;
}

export async function listChiPhiByDonVi(input: {
  donViId: number;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: "cho_duyet" | "da_duyet" | "tu_choi";
}) {
  const db = getDb();
  const conditions = [eq(chiPhi.donViId, input.donViId)];

  if (input.tuNgay) conditions.push(gte(chiPhi.ngayChi, input.tuNgay));
  if (input.denNgay) conditions.push(lte(chiPhi.ngayChi, input.denNgay));
  if (input.trangThai) conditions.push(eq(chiPhi.trangThai, input.trangThai));

  const rows = await db
    .select({
      chiPhi,
      danhMuc: {
        id: danhMucChiPhi.id,
        maChiPhi: danhMucChiPhi.maChiPhi,
        tenChiPhi: danhMucChiPhi.tenChiPhi,
        loaiChiPhi: danhMucChiPhi.loaiChiPhi,
      },
      nguoiTaoHoTen: nguoiTaoAlias.hoTen,
      nguoiTaoTenDangNhap: nguoiTaoAlias.tenDangNhap,
      nguoiDuyetHoTen: nguoiDuyetAlias.hoTen,
      nguoiDuyetTenDangNhap: nguoiDuyetAlias.tenDangNhap,
    })
    .from(chiPhi)
    .innerJoin(danhMucChiPhi, eq(chiPhi.danhMucChiPhiId, danhMucChiPhi.id))
    .innerJoin(nguoiTaoAlias, eq(chiPhi.nguoiTaoId, nguoiTaoAlias.id))
    .leftJoin(nguoiDuyetAlias, eq(chiPhi.nguoiDuyetId, nguoiDuyetAlias.id))
    .where(and(...conditions))
    .orderBy(desc(chiPhi.ngayChi));

  return rows.map((row) => ({ ...mapChiPhiRow(row), danhMuc: row.danhMuc }));
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listChiPhiAllDonVi(input: {
  tuNgay?: string;
  denNgay?: string;
  trangThai?: "cho_duyet" | "da_duyet" | "tu_choi";
}) {
  const db = getDb();
  const conditions = [eq(donVi.trangThai, "hoat_dong")];

  if (input.tuNgay) conditions.push(gte(chiPhi.ngayChi, input.tuNgay));
  if (input.denNgay) conditions.push(lte(chiPhi.ngayChi, input.denNgay));
  if (input.trangThai) conditions.push(eq(chiPhi.trangThai, input.trangThai));

  const rows = await db
    .select({
      chiPhi,
      danhMuc: {
        id: danhMucChiPhi.id,
        maChiPhi: danhMucChiPhi.maChiPhi,
        tenChiPhi: danhMucChiPhi.tenChiPhi,
        loaiChiPhi: danhMucChiPhi.loaiChiPhi,
      },
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      nguoiTaoHoTen: nguoiTaoAlias.hoTen,
      nguoiTaoTenDangNhap: nguoiTaoAlias.tenDangNhap,
      nguoiDuyetHoTen: nguoiDuyetAlias.hoTen,
      nguoiDuyetTenDangNhap: nguoiDuyetAlias.tenDangNhap,
    })
    .from(chiPhi)
    .innerJoin(danhMucChiPhi, eq(chiPhi.danhMucChiPhiId, danhMucChiPhi.id))
    .innerJoin(donVi, eq(chiPhi.donViId, donVi.id))
    .innerJoin(nguoiTaoAlias, eq(chiPhi.nguoiTaoId, nguoiTaoAlias.id))
    .leftJoin(nguoiDuyetAlias, eq(chiPhi.nguoiDuyetId, nguoiDuyetAlias.id))
    .where(and(...conditions))
    .orderBy(donVi.tenDonVi, desc(chiPhi.ngayChi));

  return rows.map((row) => ({ ...mapChiPhiRow(row), danhMuc: row.danhMuc, donVi: row.donVi }));
}

export async function countChiPhiChoDuyet(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(chiPhi)
    .where(and(eq(chiPhi.donViId, donViId), eq(chiPhi.trangThai, "cho_duyet")));

  return rows[0]?.total ?? 0;
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động. */
export async function countChiPhiChoDuyetAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(chiPhi)
    .innerJoin(donVi, eq(chiPhi.donViId, donVi.id))
    .where(and(eq(chiPhi.trangThai, "cho_duyet"), eq(donVi.trangThai, "hoat_dong")));

  return rows[0]?.total ?? 0;
}

/** Chỉ tính chi phí ĐÃ DUYỆT — dùng cho "Tổng chi"/"Lãi lỗ ròng" (báo cáo tài chính), tránh đề xuất chờ duyệt làm sai lệch số liệu. */
export async function sumChiPhiTrongKhoang(donViId: number, tuNgay: string, denNgay: string) {
  const db = getDb();

  const rows = await db
    .select({
      tongChi: sql<string>`COALESCE(SUM(${chiPhi.soTien}), 0)`,
      soLuong: count(),
    })
    .from(chiPhi)
    .where(
      and(
        eq(chiPhi.donViId, donViId),
        eq(chiPhi.trangThai, "da_duyet"),
        gte(chiPhi.ngayChi, tuNgay),
        lte(chiPhi.ngayChi, denNgay),
      ),
    );

  return rows[0] ?? { tongChi: "0.00", soLuong: 0 };
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động, chỉ tính chi phí đã duyệt. */
export async function sumChiPhiAllDonViTrongKhoang(tuNgay: string, denNgay: string) {
  const db = getDb();

  const rows = await db
    .select({
      tongChi: sql<string>`COALESCE(SUM(${chiPhi.soTien}), 0)`,
      soLuong: count(),
    })
    .from(chiPhi)
    .innerJoin(donVi, eq(chiPhi.donViId, donVi.id))
    .where(
      and(
        eq(donVi.trangThai, "hoat_dong"),
        eq(chiPhi.trangThai, "da_duyet"),
        gte(chiPhi.ngayChi, tuNgay),
        lte(chiPhi.ngayChi, denNgay),
      ),
    );

  return rows[0] ?? { tongChi: "0.00", soLuong: 0 };
}

/** Chi phí ĐÃ DUYỆT theo TỪNG đơn vị trong khoảng ngày — dùng cho báo cáo tài chính theo đơn vị. */
export async function sumChiPhiTheoDonVi(tuNgay: string, denNgay: string) {
  const db = getDb();

  return db
    .select({
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      tongChi: sql<string>`COALESCE(SUM(${chiPhi.soTien}), 0)`,
    })
    .from(donVi)
    .leftJoin(
      chiPhi,
      and(
        eq(chiPhi.donViId, donVi.id),
        eq(chiPhi.trangThai, "da_duyet"),
        gte(chiPhi.ngayChi, tuNgay),
        lte(chiPhi.ngayChi, denNgay),
      ),
    )
    .where(and(eq(donVi.trangThai, "hoat_dong"), ne(donVi.loaiDonVi, "he_thong")))
    .groupBy(donVi.id);
}
