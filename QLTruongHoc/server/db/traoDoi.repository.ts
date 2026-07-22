import { and, desc, eq } from "drizzle-orm";

import { donVi, hocSinh, lopHoc, nguoiDung, traoDoiHocSinh } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

type TraoDoiFilter = {
  hocSinhId?: number;
  lopHocId?: number;
};

export type TraoDoiRow = {
  traoDoi: {
    id: number;
    donViId: number;
    hocSinhId: number;
    lopHocId: number | null;
    nguoiGuiVaiTro: "giao_vien" | "phu_huynh" | "hoc_vu" | "khac";
    kenhLienLac: "truc_tiep" | "dien_thoai" | "nhan_tin" | "email" | "khac";
    noiDung: string;
    ketQua: string | null;
    nguoiTaoId: number;
    createdAt: string;
  };
  hocSinh: {
    id: number;
    maHocSinh: string;
    hoTen: string;
  };
  lopHoc: {
    id: number;
    maLop: string;
    tenLop: string;
  } | null;
  nguoiTao: {
    id: number;
    hoTen: string;
    tenDangNhap: string;
  };
  donVi?: {
    id: number;
    maDonVi: string;
    tenDonVi: string;
  };
};

function buildFilterConditions(filters: TraoDoiFilter = {}) {
  const conditions = [] as Array<ReturnType<typeof eq>>;

  if (filters.hocSinhId) {
    conditions.push(eq(traoDoiHocSinh.hocSinhId, filters.hocSinhId));
  }

  if (filters.lopHocId) {
    conditions.push(eq(traoDoiHocSinh.lopHocId, filters.lopHocId));
  }

  return conditions;
}

function mapRow(row: {
  traoDoi: typeof traoDoiHocSinh.$inferSelect;
  hocSinhId: number;
  hocSinhMaHocSinh: string;
  hocSinhHoTen: string;
  lopHocId: number | null;
  lopHocMaLop: string | null;
  lopHocTenLop: string | null;
  nguoiTaoId: number;
  nguoiTaoHoTen: string;
  nguoiTaoTenDangNhap: string;
  donViId?: number;
  donViMaDonVi?: string;
  donViTenDonVi?: string;
}): TraoDoiRow {
  return {
    traoDoi: {
      id: row.traoDoi.id,
      donViId: row.traoDoi.donViId,
      hocSinhId: row.traoDoi.hocSinhId,
      lopHocId: row.traoDoi.lopHocId,
      nguoiGuiVaiTro: row.traoDoi.nguoiGuiVaiTro,
      kenhLienLac: row.traoDoi.kenhLienLac,
      noiDung: row.traoDoi.noiDung,
      ketQua: row.traoDoi.ketQua,
      nguoiTaoId: row.traoDoi.nguoiTaoId,
      createdAt: row.traoDoi.createdAt,
    },
    hocSinh: {
      id: row.hocSinhId,
      maHocSinh: row.hocSinhMaHocSinh,
      hoTen: row.hocSinhHoTen,
    },
    lopHoc: row.lopHocId
      ? {
          id: row.lopHocId,
          maLop: row.lopHocMaLop ?? "",
          tenLop: row.lopHocTenLop ?? "",
        }
      : null,
    nguoiTao: {
      id: row.nguoiTaoId,
      hoTen: row.nguoiTaoHoTen,
      tenDangNhap: row.nguoiTaoTenDangNhap,
    },
    donVi: row.donViId
      ? {
          id: row.donViId,
          maDonVi: row.donViMaDonVi ?? "",
          tenDonVi: row.donViTenDonVi ?? "",
        }
      : undefined,
  };
}

export async function listTraoDoiByDonVi(donViId: number, filters: TraoDoiFilter = {}) {
  const db = getDb();
  const conditions = [eq(traoDoiHocSinh.donViId, donViId), ...buildFilterConditions(filters)];

  const rows = await db
    .select({
      traoDoi: traoDoiHocSinh,
      hocSinhId: hocSinh.id,
      hocSinhMaHocSinh: hocSinh.maHocSinh,
      hocSinhHoTen: hocSinh.hoTen,
      lopHocId: lopHoc.id,
      lopHocMaLop: lopHoc.maLop,
      lopHocTenLop: lopHoc.tenLop,
      nguoiTaoId: nguoiDung.id,
      nguoiTaoHoTen: nguoiDung.hoTen,
      nguoiTaoTenDangNhap: nguoiDung.tenDangNhap,
    })
    .from(traoDoiHocSinh)
    .innerJoin(hocSinh, eq(traoDoiHocSinh.hocSinhId, hocSinh.id))
    .innerJoin(nguoiDung, eq(traoDoiHocSinh.nguoiTaoId, nguoiDung.id))
    .leftJoin(lopHoc, eq(traoDoiHocSinh.lopHocId, lopHoc.id))
    .where(and(...conditions))
    .orderBy(desc(traoDoiHocSinh.createdAt));

  return rows.map((row) => mapRow(row));
}

export async function listTraoDoiAllDonVi(filters: TraoDoiFilter = {}) {
  const db = getDb();
  const conditions = [eq(donVi.trangThai, "hoat_dong"), ...buildFilterConditions(filters)];

  const rows = await db
    .select({
      traoDoi: traoDoiHocSinh,
      hocSinhId: hocSinh.id,
      hocSinhMaHocSinh: hocSinh.maHocSinh,
      hocSinhHoTen: hocSinh.hoTen,
      lopHocId: lopHoc.id,
      lopHocMaLop: lopHoc.maLop,
      lopHocTenLop: lopHoc.tenLop,
      nguoiTaoId: nguoiDung.id,
      nguoiTaoHoTen: nguoiDung.hoTen,
      nguoiTaoTenDangNhap: nguoiDung.tenDangNhap,
      donViId: donVi.id,
      donViMaDonVi: donVi.maDonVi,
      donViTenDonVi: donVi.tenDonVi,
    })
    .from(traoDoiHocSinh)
    .innerJoin(hocSinh, eq(traoDoiHocSinh.hocSinhId, hocSinh.id))
    .innerJoin(nguoiDung, eq(traoDoiHocSinh.nguoiTaoId, nguoiDung.id))
    .innerJoin(donVi, eq(traoDoiHocSinh.donViId, donVi.id))
    .leftJoin(lopHoc, eq(traoDoiHocSinh.lopHocId, lopHoc.id))
    .where(and(...conditions))
    .orderBy(donVi.tenDonVi, desc(traoDoiHocSinh.createdAt));

  return rows.map((row) => mapRow(row));
}

export async function createTraoDoi(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId?: number | null;
  nguoiGuiVaiTro: "giao_vien" | "phu_huynh" | "hoc_vu" | "khac";
  kenhLienLac: "truc_tiep" | "dien_thoai" | "nhan_tin" | "email" | "khac";
  noiDung: string;
  ketQua?: string | null;
  nguoiTaoId: number;
}) {
  const db = getDb();
  const createdAt = now();

  await db.insert(traoDoiHocSinh).values({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId ?? null,
    nguoiGuiVaiTro: input.nguoiGuiVaiTro,
    kenhLienLac: input.kenhLienLac,
    noiDung: input.noiDung,
    ketQua: input.ketQua ?? null,
    nguoiTaoId: input.nguoiTaoId,
    createdAt,
  });

  const rows = await db
    .select({
      traoDoi: traoDoiHocSinh,
      hocSinhId: hocSinh.id,
      hocSinhMaHocSinh: hocSinh.maHocSinh,
      hocSinhHoTen: hocSinh.hoTen,
      lopHocId: lopHoc.id,
      lopHocMaLop: lopHoc.maLop,
      lopHocTenLop: lopHoc.tenLop,
      nguoiTaoId: nguoiDung.id,
      nguoiTaoHoTen: nguoiDung.hoTen,
      nguoiTaoTenDangNhap: nguoiDung.tenDangNhap,
    })
    .from(traoDoiHocSinh)
    .innerJoin(hocSinh, eq(traoDoiHocSinh.hocSinhId, hocSinh.id))
    .innerJoin(nguoiDung, eq(traoDoiHocSinh.nguoiTaoId, nguoiDung.id))
    .leftJoin(lopHoc, eq(traoDoiHocSinh.lopHocId, lopHoc.id))
    .where(
      and(
        eq(traoDoiHocSinh.donViId, input.donViId),
        eq(traoDoiHocSinh.hocSinhId, input.hocSinhId),
        eq(traoDoiHocSinh.nguoiTaoId, input.nguoiTaoId),
        eq(traoDoiHocSinh.createdAt, createdAt),
      ),
    )
    .orderBy(desc(traoDoiHocSinh.id))
    .limit(1);

  return rows[0] ? mapRow(rows[0]) : null;
}
