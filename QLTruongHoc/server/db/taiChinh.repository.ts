import { and, count, desc, eq, gt, gte, inArray, isNull, like, lt, lte, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";

import {
  cauHinhTaiChinhDonVi,
  danhMucKhoanThu,
  dieuChinhKhoanPhaiThu,
  donVi,
  hocSinh,
  hocSinhLopHoc,
  khoanPhaiThu,
  khoanPhaiThuChiTiet,
  kyThu,
  kyThuKhoanThu,
  lopHoc,
  nguoiDung,
  phieuThu,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";
import { toDatabaseDateTime } from "../utils/dateTime.js";

const nguoiTaoAlias = alias(nguoiDung, "dieuChinhNguoiTao");
const nguoiDuyetAlias = alias(nguoiDung, "dieuChinhNguoiDuyet");

const now = toDatabaseDateTime;

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

export async function findDanhMucKhoanThuById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(danhMucKhoanThu)
    .where(and(eq(danhMucKhoanThu.id, id), eq(danhMucKhoanThu.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findDanhMucKhoanThuByMa(donViId: number, maKhoanThu: string) {
  const db = getDb();

  const rows = await db
    .select()
    .from(danhMucKhoanThu)
    .where(and(eq(danhMucKhoanThu.donViId, donViId), eq(danhMucKhoanThu.maKhoanThu, maKhoanThu)))
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

  return db.select().from(kyThu).where(eq(kyThu.donViId, donViId)).orderBy(kyThu.tuNgay);
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
    .where(and(eq(kyThu.donViId, donViId), eq(kyThu.maKyThu, maKyThu)))
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

  const rows = await db.select().from(kyThu).where(eq(kyThu.id, input.id)).limit(1);

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

  const rows = await db.select().from(kyThu).where(eq(kyThu.id, input.id)).limit(1);

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
    .innerJoin(danhMucKhoanThu, eq(kyThuKhoanThu.danhMucKhoanThuId, danhMucKhoanThu.id))
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

  await db.delete(kyThuKhoanThu).where(eq(kyThuKhoanThu.kyThuId, input.kyThuId));

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

// ---------------------------------------------------------------
// Học sinh đang học trong lớp (dùng để sinh khoản phải thu)
// ---------------------------------------------------------------

export async function listHocSinhDangHocTrongLop(lopHocId: number) {
  const db = getDb();

  return db
    .select({ hocSinh })
    .from(hocSinhLopHoc)
    .innerJoin(hocSinh, eq(hocSinhLopHoc.hocSinhId, hocSinh.id))
    .where(and(eq(hocSinhLopHoc.lopHocId, lopHocId), eq(hocSinhLopHoc.trangThai, "dang_hoc")));
}

// ---------------------------------------------------------------
// Khoản phải thu
// ---------------------------------------------------------------

export async function findKhoanPhaiThuByKyThuHocSinh(
  kyThuId: number,
  hocSinhId: number,
  lopHocId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(khoanPhaiThu)
    .where(
      and(
        eq(khoanPhaiThu.kyThuId, kyThuId),
        eq(khoanPhaiThu.hocSinhId, hocSinhId),
        eq(khoanPhaiThu.lopHocId, lopHocId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createKhoanPhaiThu(input: {
  donViId: number;
  kyThuId: number;
  hocSinhId: number;
  lopHocId: number;
  tongTien: string;
  chiTiet: { danhMucKhoanThuId: number; soTien: string }[];
}) {
  const db = getDb();

  await db.insert(khoanPhaiThu).values({
    donViId: input.donViId,
    kyThuId: input.kyThuId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    tongTien: input.tongTien,
    giamTru: "0.00",
    daThu: "0.00",
    trangThai: "chua_thu",
    createdAt: now(),
    updatedAt: now(),
  });

  const created = await findKhoanPhaiThuByKyThuHocSinh(
    input.kyThuId,
    input.hocSinhId,
    input.lopHocId,
  );

  if (!created) {
    throw new Error("Không thể tạo khoản phải thu.");
  }

  const khoanPhaiThuId = created.id;

  if (input.chiTiet.length > 0) {
    await db.insert(khoanPhaiThuChiTiet).values(
      input.chiTiet.map((item) => ({
        khoanPhaiThuId,
        danhMucKhoanThuId: item.danhMucKhoanThuId,
        soTien: item.soTien,
        createdAt: now(),
      })),
    );
  }

  return khoanPhaiThuId;
}

export async function findKhoanPhaiThuById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(khoanPhaiThu)
    .where(and(eq(khoanPhaiThu.id, id), eq(khoanPhaiThu.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listKhoanPhaiThuByKyThu(kyThuId: number) {
  const db = getDb();

  return db
    .select({ khoanPhaiThu, hocSinh, lopHoc })
    .from(khoanPhaiThu)
    .innerJoin(hocSinh, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .leftJoin(lopHoc, eq(khoanPhaiThu.lopHocId, lopHoc.id))
    .where(eq(khoanPhaiThu.kyThuId, kyThuId))
    .orderBy(hocSinh.hoTen);
}

/** Toàn bộ khoản phải thu của một học sinh (đã thu đủ lẫn còn nợ), kèm tên kỳ thu — dùng cho Portal phụ huynh (J06). */
export async function listKhoanPhaiThuByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select({ khoanPhaiThu, kyThu })
    .from(khoanPhaiThu)
    .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .where(eq(khoanPhaiThu.hocSinhId, hocSinhId))
    .orderBy(desc(khoanPhaiThu.createdAt));
}

/** Công nợ toàn đơn vị — mọi khoản phải thu còn nợ (tổng tiền - giảm trừ - đã thu > 0). */
export async function listCongNoByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select({ khoanPhaiThu, hocSinh, kyThu, lopHoc })
    .from(khoanPhaiThu)
    .innerJoin(hocSinh, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .leftJoin(lopHoc, eq(khoanPhaiThu.lopHocId, lopHoc.id))
    .where(
      and(
        eq(khoanPhaiThu.donViId, donViId),
        gt(sql`${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}`, 0),
      ),
    )
    .orderBy(hocSinh.hoTen);
}

export async function updateKhoanPhaiThuGiamTru(input: {
  id: number;
  giamTru: string;
  trangThai: "chua_thu" | "thu_mot_phan" | "da_thu_du";
}) {
  const db = getDb();

  await db
    .update(khoanPhaiThu)
    .set({
      giamTru: input.giamTru,
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(khoanPhaiThu.id, input.id));

  const rows = await db.select().from(khoanPhaiThu).where(eq(khoanPhaiThu.id, input.id)).limit(1);

  return rows[0] ?? null;
}

export async function updateKhoanPhaiThuDaThu(input: {
  id: number;
  daThu: string;
  trangThai: "chua_thu" | "thu_mot_phan" | "da_thu_du";
}) {
  const db = getDb();

  await db
    .update(khoanPhaiThu)
    .set({
      daThu: input.daThu,
      trangThai: input.trangThai,
      updatedAt: now(),
    })
    .where(eq(khoanPhaiThu.id, input.id));

  const rows = await db.select().from(khoanPhaiThu).where(eq(khoanPhaiThu.id, input.id)).limit(1);

  return rows[0] ?? null;
}

// ---------------------------------------------------------------
// Phiếu thu
// ---------------------------------------------------------------

export async function countPhieuThuTheoPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(phieuThu)
    .where(and(eq(phieuThu.donViId, donViId), like(phieuThu.soPhieu, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function countDanhMucKhoanThuTheoMaPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(danhMucKhoanThu)
    .where(and(eq(danhMucKhoanThu.donViId, donViId), like(danhMucKhoanThu.maKhoanThu, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function countKyThuTheoMaPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(kyThu)
    .where(and(eq(kyThu.donViId, donViId), like(kyThu.maKyThu, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function createPhieuThu(input: {
  donViId: number;
  khoanPhaiThuId: number;
  hocSinhId: number;
  soPhieu: string;
  soTien: string;
  phuongThuc: "tien_mat" | "chuyen_khoan" | "the" | "khac";
  ghiChu: string | null;
  nguoiThuId: number;
  ngayThu?: string;
}) {
  const db = getDb();

  await db.insert(phieuThu).values({
    donViId: input.donViId,
    khoanPhaiThuId: input.khoanPhaiThuId,
    hocSinhId: input.hocSinhId,
    soPhieu: input.soPhieu,
    soTien: input.soTien,
    phuongThuc: input.phuongThuc,
    ghiChu: input.ghiChu,
    nguoiThuId: input.nguoiThuId,
    ngayThu: input.ngayThu ?? now(),
    createdAt: now(),
  });

  const rows = await db
    .select()
    .from(phieuThu)
    .where(and(eq(phieuThu.donViId, input.donViId), eq(phieuThu.soPhieu, input.soPhieu)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listPhieuThuByKhoanPhaiThu(khoanPhaiThuId: number) {
  const db = getDb();

  return db
    .select()
    .from(phieuThu)
    .where(eq(phieuThu.khoanPhaiThuId, khoanPhaiThuId))
    .orderBy(phieuThu.ngayThu);
}

export async function findPhieuThuById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select({
      phieuThu,
      hocSinh,
      khoanPhaiThu,
      kyThu,
      lopHoc,
      donVi,
    })
    .from(phieuThu)
    .innerJoin(hocSinh, eq(phieuThu.hocSinhId, hocSinh.id))
    .innerJoin(khoanPhaiThu, eq(phieuThu.khoanPhaiThuId, khoanPhaiThu.id))
    .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .leftJoin(lopHoc, eq(khoanPhaiThu.lopHocId, lopHoc.id))
    .innerJoin(donVi, eq(phieuThu.donViId, donVi.id))
    .where(and(eq(phieuThu.id, id), eq(phieuThu.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

// ---------------------------------------------------------------
// Báo cáo tài chính
// ---------------------------------------------------------------

export async function sumPhieuThuTrongKhoang(donViId: number, tuNgay: string, denNgay: string) {
  const db = getDb();

  const rows = await db
    .select({
      tongThu: sql<string>`COALESCE(SUM(${phieuThu.soTien}), 0)`,
      soPhieuThu: count(),
    })
    .from(phieuThu)
    .where(
      and(
        eq(phieuThu.donViId, donViId),
        gte(phieuThu.ngayThu, `${tuNgay} 00:00:00`),
        lte(phieuThu.ngayThu, `${denNgay} 23:59:59`),
      ),
    );

  return rows[0] ?? { tongThu: "0.00", soPhieuThu: 0 };
}

export async function sumPhieuThuAllDonViTrongKhoang(tuNgay: string, denNgay: string) {
  const db = getDb();
  const rows = await db
    .select({
      tongThu: sql<string>`COALESCE(SUM(${phieuThu.soTien}), 0)`,
      soPhieuThu: count(),
    })
    .from(phieuThu)
    .innerJoin(donVi, eq(phieuThu.donViId, donVi.id))
    .where(
      and(
        eq(donVi.trangThai, "hoat_dong"),
        gte(phieuThu.ngayThu, `${tuNgay} 00:00:00`),
        lte(phieuThu.ngayThu, `${denNgay} 23:59:59`),
      ),
    );

  return rows[0] ?? { tongThu: "0.00", soPhieuThu: 0 };
}

/**
 * Doanh thu theo TỪNG đơn vị trong khoảng ngày — dùng cho bảng tổng quan đa
 * chi nhánh ở Bảng điều hành hệ thống (khác `sumPhieuThuAllDonViTrongKhoang`,
 * hàm đó gộp thành 1 số duy nhất, không tách theo đơn vị).
 */
export async function sumDoanhThuTheoDonVi(tuNgay: string, denNgay: string) {
  const db = getDb();

  return db
    .select({
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      doanhThu: sql<string>`COALESCE(SUM(${phieuThu.soTien}), 0)`,
    })
    .from(donVi)
    .leftJoin(
      phieuThu,
      and(
        eq(phieuThu.donViId, donVi.id),
        gte(phieuThu.ngayThu, `${tuNgay} 00:00:00`),
        lte(phieuThu.ngayThu, `${denNgay} 23:59:59`),
      ),
    )
    .where(and(eq(donVi.trangThai, "hoat_dong"), ne(donVi.loaiDonVi, "he_thong")))
    .groupBy(donVi.id);
}

/** Công nợ theo TỪNG đơn vị — cùng công thức với `sumCongNoByDonVi`. */
export async function sumCongNoTheoDonVi() {
  const db = getDb();

  return db
    .select({
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      congNo: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
    })
    .from(donVi)
    .leftJoin(khoanPhaiThu, eq(khoanPhaiThu.donViId, donVi.id))
    .where(and(eq(donVi.trangThai, "hoat_dong"), ne(donVi.loaiDonVi, "he_thong")))
    .groupBy(donVi.id);
}

export async function sumHoanPhiDaDuyetTrongKhoang(
  donViId: number,
  tuNgay: string,
  denNgay: string,
) {
  const db = getDb();
  const rows = await db
    .select({
      tongHoanPhi: sql<string>`COALESCE(SUM(${dieuChinhKhoanPhaiThu.soTien}), 0)`,
    })
    .from(dieuChinhKhoanPhaiThu)
    .where(
      and(
        eq(dieuChinhKhoanPhaiThu.donViId, donViId),
        eq(dieuChinhKhoanPhaiThu.loaiDieuChinh, "hoan_phi"),
        eq(dieuChinhKhoanPhaiThu.trangThai, "da_duyet"),
        gte(dieuChinhKhoanPhaiThu.duyetAt, `${tuNgay} 00:00:00`),
        lte(dieuChinhKhoanPhaiThu.duyetAt, `${denNgay} 23:59:59`),
      ),
    );

  return rows[0] ?? { tongHoanPhi: "0.00" };
}

export async function sumHoanPhiDaDuyetAllDonViTrongKhoang(tuNgay: string, denNgay: string) {
  const db = getDb();
  const rows = await db
    .select({
      tongHoanPhi: sql<string>`COALESCE(SUM(${dieuChinhKhoanPhaiThu.soTien}), 0)`,
    })
    .from(dieuChinhKhoanPhaiThu)
    .innerJoin(donVi, eq(dieuChinhKhoanPhaiThu.donViId, donVi.id))
    .where(
      and(
        eq(donVi.trangThai, "hoat_dong"),
        eq(dieuChinhKhoanPhaiThu.loaiDieuChinh, "hoan_phi"),
        eq(dieuChinhKhoanPhaiThu.trangThai, "da_duyet"),
        gte(dieuChinhKhoanPhaiThu.duyetAt, `${tuNgay} 00:00:00`),
        lte(dieuChinhKhoanPhaiThu.duyetAt, `${denNgay} 23:59:59`),
      ),
    );

  return rows[0] ?? { tongHoanPhi: "0.00" };
}

export async function sumCongNoByDonVi(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({
      tongCongNo: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
    })
    .from(khoanPhaiThu)
    .where(eq(khoanPhaiThu.donViId, donViId));

  return rows[0] ?? { tongCongNo: "0.00" };
}

/**
 * Khoản phải thu còn nợ (>0), chia 2 nhóm theo hạn thanh toán của kỳ thu:
 * sắp đến hạn (trong `soNgayToi` ngày tới) và đã quá hạn — cho Bảng điều
 * hành đơn vị. `hanThanhToan` là cột DATE (không có giờ) nên so sánh thẳng
 * chuỗi `YYYY-MM-DD`, không cần nối " 00:00:00"/" 23:59:59" như các cột
 * DATETIME khác trong file này.
 */
export async function countDieuChinhChoDuyet(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(dieuChinhKhoanPhaiThu)
    .where(
      and(
        eq(dieuChinhKhoanPhaiThu.donViId, donViId),
        eq(dieuChinhKhoanPhaiThu.trangThai, "cho_duyet"),
      ),
    );

  return rows[0]?.total ?? 0;
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động. */
export async function countDieuChinhChoDuyetAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(dieuChinhKhoanPhaiThu)
    .innerJoin(donVi, eq(dieuChinhKhoanPhaiThu.donViId, donVi.id))
    .where(
      and(
        eq(dieuChinhKhoanPhaiThu.trangThai, "cho_duyet"),
        eq(donVi.trangThai, "hoat_dong"),
      ),
    );

  return rows[0]?.total ?? 0;
}

/**
 * Học sinh mới từ tuyển sinh chưa từng có khoản phải thu nào — BPD 7.1 "Chọn
 * chương trình/lớp dự kiến; tạo khoản phải thu hoặc yêu cầu đặt cọc" liệt kê
 * kế toán là một actor của luồng tuyển sinh, nhưng xác nhận đăng ký (C06)
 * hiện không tạo khoản phải thu nào — chỉ tạo hồ sơ học sinh. Thay vì mở
 * quyền tài chính cho tuyển sinh/tư vấn (không đúng nguyên tắc "kế toán là
 * nơi duy nhất lập số liệu tài chính"), đếm học sinh còn `tiep_nhan`/
 * `dang_hoc` mà CHƯA TỪNG có `KhoanPhaiThu` nào để tự nhắc kế toán — không
 * dùng mốc "N ngày gần đây" (dễ lệch, dễ bỏ sót) mà dùng "chưa từng có" —
 * học sinh cũ đã có lịch sử thu sẽ không bị tính nhầm dù đang giữa 2 kỳ thu.
 */
export async function countHocSinhChuaCoKhoanPhaiThu(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .leftJoin(khoanPhaiThu, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .where(
      and(
        eq(hocSinh.donViId, donViId),
        inArray(hocSinh.trangThai, ["tiep_nhan", "dang_hoc"]),
        isNull(khoanPhaiThu.id),
      ),
    );

  return rows[0]?.total ?? 0;
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động. */
export async function countHocSinhChuaCoKhoanPhaiThuAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .innerJoin(donVi, eq(hocSinh.donViId, donVi.id))
    .leftJoin(khoanPhaiThu, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .where(
      and(
        eq(donVi.trangThai, "hoat_dong"),
        inArray(hocSinh.trangThai, ["tiep_nhan", "dang_hoc"]),
        isNull(khoanPhaiThu.id),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function countKhoanThuTheoHan(
  donViId: number,
  homNay: string,
  denNgay: string,
) {
  const db = getDb();
  const conNo = sql`(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}) > 0`;

  const [sapDenHanRows, quaHanRows] = await Promise.all([
    db
      .select({
        soLuong: count(),
        tongTien: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
      })
      .from(khoanPhaiThu)
      .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
      .where(
        and(
          eq(khoanPhaiThu.donViId, donViId),
          gte(kyThu.hanThanhToan, homNay),
          lte(kyThu.hanThanhToan, denNgay),
          conNo,
        ),
      ),
    db
      .select({
        soLuong: count(),
        tongTien: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
      })
      .from(khoanPhaiThu)
      .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
      .where(and(eq(khoanPhaiThu.donViId, donViId), lt(kyThu.hanThanhToan, homNay), conNo)),
  ]);

  return {
    sapDenHan: sapDenHanRows[0] ?? { soLuong: 0, tongTien: "0.00" },
    quaHan: quaHanRows[0] ?? { soLuong: 0, tongTien: "0.00" },
  };
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động. */
export async function countKhoanThuTheoHanAllDonVi(homNay: string, denNgay: string) {
  const db = getDb();
  const conNo = sql`(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}) > 0`;

  const [sapDenHanRows, quaHanRows] = await Promise.all([
    db
      .select({
        soLuong: count(),
        tongTien: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
      })
      .from(khoanPhaiThu)
      .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
      .innerJoin(donVi, eq(khoanPhaiThu.donViId, donVi.id))
      .where(
        and(
          eq(donVi.trangThai, "hoat_dong"),
          gte(kyThu.hanThanhToan, homNay),
          lte(kyThu.hanThanhToan, denNgay),
          conNo,
        ),
      ),
    db
      .select({
        soLuong: count(),
        tongTien: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
      })
      .from(khoanPhaiThu)
      .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
      .innerJoin(donVi, eq(khoanPhaiThu.donViId, donVi.id))
      .where(and(eq(donVi.trangThai, "hoat_dong"), lt(kyThu.hanThanhToan, homNay), conNo)),
  ]);

  return {
    sapDenHan: sapDenHanRows[0] ?? { soLuong: 0, tongTien: "0.00" },
    quaHan: quaHanRows[0] ?? { soLuong: 0, tongTien: "0.00" },
  };
}

/** Dùng cho đơn vị hệ thống — công nợ gộp toàn bộ đơn vị đang hoạt động. */
export async function sumCongNoAllDonVi() {
  const db = getDb();

  const rows = await db
    .select({
      tongCongNo: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}), 0)`,
    })
    .from(khoanPhaiThu)
    .innerJoin(donVi, eq(khoanPhaiThu.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"));

  return rows[0] ?? { tongCongNo: "0.00" };
}

export async function listKyThuBaoCaoByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select({
      kyThu,
      phaiThu: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru}), 0)`,
      daThu: sql<string>`COALESCE(SUM(${khoanPhaiThu.daThu}), 0)`,
    })
    .from(kyThu)
    .leftJoin(khoanPhaiThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .where(eq(kyThu.donViId, donViId))
    .groupBy(kyThu.id)
    .orderBy(kyThu.tuNgay);
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động. */
export async function listKyThuBaoCaoAllDonVi() {
  const db = getDb();

  return db
    .select({
      kyThu,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
      phaiThu: sql<string>`COALESCE(SUM(${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru}), 0)`,
      daThu: sql<string>`COALESCE(SUM(${khoanPhaiThu.daThu}), 0)`,
    })
    .from(kyThu)
    .innerJoin(donVi, eq(kyThu.donViId, donVi.id))
    .leftJoin(khoanPhaiThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .groupBy(kyThu.id, donVi.id)
    .orderBy(donVi.tenDonVi, kyThu.tuNgay);
}

// ---------------------------------------------------------------
// H08 — Hoàn phí / chuyển phí / bảo lưu (yêu cầu điều chỉnh + duyệt)
// ---------------------------------------------------------------

function mapDieuChinhRow(row: {
  dieuChinh: typeof dieuChinhKhoanPhaiThu.$inferSelect;
  nguoiTaoHoTen: string;
  nguoiTaoTenDangNhap: string;
  nguoiDuyetHoTen: string | null;
  nguoiDuyetTenDangNhap: string | null;
}) {
  return {
    ...row.dieuChinh,
    nguoiTao: {
      id: row.dieuChinh.nguoiTaoId,
      hoTen: row.nguoiTaoHoTen,
      tenDangNhap: row.nguoiTaoTenDangNhap,
    },
    nguoiDuyet: row.dieuChinh.nguoiDuyetId
      ? {
          id: row.dieuChinh.nguoiDuyetId,
          hoTen: row.nguoiDuyetHoTen ?? "",
          tenDangNhap: row.nguoiDuyetTenDangNhap ?? "",
        }
      : null,
  };
}

export async function createDieuChinh(input: {
  donViId: number;
  khoanPhaiThuId: number;
  khoanPhaiThuDichId?: number | null;
  loaiDieuChinh: "hoan_phi" | "chuyen_phi" | "bao_luu";
  soTien: string;
  lyDo: string;
  nguoiTaoId: number;
}) {
  const db = getDb();
  const createdAt = now();

  await db.insert(dieuChinhKhoanPhaiThu).values({
    donViId: input.donViId,
    khoanPhaiThuId: input.khoanPhaiThuId,
    khoanPhaiThuDichId: input.khoanPhaiThuDichId ?? null,
    loaiDieuChinh: input.loaiDieuChinh,
    soTien: input.soTien,
    lyDo: input.lyDo,
    trangThai: "cho_duyet",
    nguoiTaoId: input.nguoiTaoId,
    createdAt,
  });

  const rows = await db
    .select()
    .from(dieuChinhKhoanPhaiThu)
    .where(
      and(
        eq(dieuChinhKhoanPhaiThu.khoanPhaiThuId, input.khoanPhaiThuId),
        eq(dieuChinhKhoanPhaiThu.nguoiTaoId, input.nguoiTaoId),
        eq(dieuChinhKhoanPhaiThu.createdAt, createdAt),
      ),
    )
    .orderBy(desc(dieuChinhKhoanPhaiThu.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findDieuChinhById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(dieuChinhKhoanPhaiThu)
    .where(and(eq(dieuChinhKhoanPhaiThu.id, id), eq(dieuChinhKhoanPhaiThu.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listDieuChinhByKhoanPhaiThu(khoanPhaiThuId: number) {
  const db = getDb();

  const rows = await db
    .select({
      dieuChinh: dieuChinhKhoanPhaiThu,
      nguoiTaoHoTen: nguoiTaoAlias.hoTen,
      nguoiTaoTenDangNhap: nguoiTaoAlias.tenDangNhap,
      nguoiDuyetHoTen: nguoiDuyetAlias.hoTen,
      nguoiDuyetTenDangNhap: nguoiDuyetAlias.tenDangNhap,
    })
    .from(dieuChinhKhoanPhaiThu)
    .innerJoin(nguoiTaoAlias, eq(dieuChinhKhoanPhaiThu.nguoiTaoId, nguoiTaoAlias.id))
    .leftJoin(nguoiDuyetAlias, eq(dieuChinhKhoanPhaiThu.nguoiDuyetId, nguoiDuyetAlias.id))
    .where(eq(dieuChinhKhoanPhaiThu.khoanPhaiThuId, khoanPhaiThuId))
    .orderBy(desc(dieuChinhKhoanPhaiThu.createdAt));

  return rows.map(mapDieuChinhRow);
}

/**
 * Danh sách yêu cầu điều chỉnh (hoàn phí/chuyển phí/bảo lưu) của một đơn vị —
 * dùng cho trang "Yêu cầu điều chỉnh" (kế toán theo dõi, quản lý đơn vị/quản
 * trị hệ thống duyệt — xem `tai_chinh.duyet` ở router). Kèm học sinh + kỳ thu
 * để hiển thị ngữ cảnh mà không cần mở từng khoản phải thu.
 */
export async function listDieuChinhTheoDonVi(
  donViId: number,
  trangThai?: "cho_duyet" | "da_duyet" | "tu_choi",
) {
  const db = getDb();
  const conditions = [eq(dieuChinhKhoanPhaiThu.donViId, donViId)];

  if (trangThai) {
    conditions.push(eq(dieuChinhKhoanPhaiThu.trangThai, trangThai));
  }

  const rows = await db
    .select({
      dieuChinh: dieuChinhKhoanPhaiThu,
      nguoiTaoHoTen: nguoiTaoAlias.hoTen,
      nguoiTaoTenDangNhap: nguoiTaoAlias.tenDangNhap,
      nguoiDuyetHoTen: nguoiDuyetAlias.hoTen,
      nguoiDuyetTenDangNhap: nguoiDuyetAlias.tenDangNhap,
      hocSinh: {
        id: hocSinh.id,
        maHocSinh: hocSinh.maHocSinh,
        hoTen: hocSinh.hoTen,
      },
      kyThu: {
        id: kyThu.id,
        maKyThu: kyThu.maKyThu,
        tenKyThu: kyThu.tenKyThu,
      },
    })
    .from(dieuChinhKhoanPhaiThu)
    .innerJoin(nguoiTaoAlias, eq(dieuChinhKhoanPhaiThu.nguoiTaoId, nguoiTaoAlias.id))
    .leftJoin(nguoiDuyetAlias, eq(dieuChinhKhoanPhaiThu.nguoiDuyetId, nguoiDuyetAlias.id))
    .innerJoin(khoanPhaiThu, eq(dieuChinhKhoanPhaiThu.khoanPhaiThuId, khoanPhaiThu.id))
    .innerJoin(hocSinh, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .where(and(...conditions))
    .orderBy(desc(dieuChinhKhoanPhaiThu.createdAt));

  return rows.map((row) => ({
    ...mapDieuChinhRow(row),
    hocSinh: row.hocSinh,
    kyThu: row.kyThu,
  }));
}

/** Dùng cho đơn vị hệ thống (kế toán tổng) — gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listDieuChinhAllDonVi(
  trangThai?: "cho_duyet" | "da_duyet" | "tu_choi",
) {
  const db = getDb();
  const conditions = [eq(donVi.trangThai, "hoat_dong")];

  if (trangThai) {
    conditions.push(eq(dieuChinhKhoanPhaiThu.trangThai, trangThai));
  }

  const rows = await db
    .select({
      dieuChinh: dieuChinhKhoanPhaiThu,
      nguoiTaoHoTen: nguoiTaoAlias.hoTen,
      nguoiTaoTenDangNhap: nguoiTaoAlias.tenDangNhap,
      nguoiDuyetHoTen: nguoiDuyetAlias.hoTen,
      nguoiDuyetTenDangNhap: nguoiDuyetAlias.tenDangNhap,
      hocSinh: {
        id: hocSinh.id,
        maHocSinh: hocSinh.maHocSinh,
        hoTen: hocSinh.hoTen,
      },
      kyThu: {
        id: kyThu.id,
        maKyThu: kyThu.maKyThu,
        tenKyThu: kyThu.tenKyThu,
      },
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(dieuChinhKhoanPhaiThu)
    .innerJoin(nguoiTaoAlias, eq(dieuChinhKhoanPhaiThu.nguoiTaoId, nguoiTaoAlias.id))
    .leftJoin(nguoiDuyetAlias, eq(dieuChinhKhoanPhaiThu.nguoiDuyetId, nguoiDuyetAlias.id))
    .innerJoin(khoanPhaiThu, eq(dieuChinhKhoanPhaiThu.khoanPhaiThuId, khoanPhaiThu.id))
    .innerJoin(hocSinh, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .innerJoin(donVi, eq(dieuChinhKhoanPhaiThu.donViId, donVi.id))
    .where(and(...conditions))
    .orderBy(donVi.tenDonVi, desc(dieuChinhKhoanPhaiThu.createdAt));

  return rows.map((row) => ({
    ...mapDieuChinhRow(row),
    hocSinh: row.hocSinh,
    kyThu: row.kyThu,
    donVi: row.donVi,
  }));
}

export async function updateDieuChinhQuyetDinh(input: {
  id: number;
  trangThai: "da_duyet" | "tu_choi";
  nguoiDuyetId: number;
  ghiChuDuyet: string | null;
}) {
  const db = getDb();

  await db
    .update(dieuChinhKhoanPhaiThu)
    .set({
      trangThai: input.trangThai,
      nguoiDuyetId: input.nguoiDuyetId,
      ghiChuDuyet: input.ghiChuDuyet,
      duyetAt: now(),
    })
    .where(eq(dieuChinhKhoanPhaiThu.id, input.id));

  const rows = await db
    .select()
    .from(dieuChinhKhoanPhaiThu)
    .where(eq(dieuChinhKhoanPhaiThu.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

// ---------------------------------------------------------------
// Cấu hình duyệt chi theo đơn vị (quản lý đơn vị bật/tắt cho kế toán tự chủ)
// ---------------------------------------------------------------

const CAU_HINH_MAC_DINH = {
  duyetDanhMucChiPhi: true,
  duyetChiDinhKy: true,
  duyetChiDotXuat: true,
};

/** Đơn vị chưa từng cấu hình → mặc định (cần duyệt cả 3), khớp hành vi trước khi có cấu hình. */
export async function getCauHinhTaiChinhDonVi(donViId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(cauHinhTaiChinhDonVi)
    .where(eq(cauHinhTaiChinhDonVi.donViId, donViId))
    .limit(1);

  return rows[0] ?? { donViId, ...CAU_HINH_MAC_DINH };
}

export async function upsertCauHinhTaiChinhDonVi(input: {
  donViId: number;
  duyetDanhMucChiPhi: boolean;
  duyetChiDinhKy: boolean;
  duyetChiDotXuat: boolean;
  capNhatBoiId: number;
}) {
  const db = getDb();
  const updatedAt = now();

  await db
    .insert(cauHinhTaiChinhDonVi)
    .values({
      donViId: input.donViId,
      duyetDanhMucChiPhi: input.duyetDanhMucChiPhi,
      duyetChiDinhKy: input.duyetChiDinhKy,
      duyetChiDotXuat: input.duyetChiDotXuat,
      capNhatBoiId: input.capNhatBoiId,
      updatedAt,
    })
    .onDuplicateKeyUpdate({
      set: {
        duyetDanhMucChiPhi: input.duyetDanhMucChiPhi,
        duyetChiDinhKy: input.duyetChiDinhKy,
        duyetChiDotXuat: input.duyetChiDotXuat,
        capNhatBoiId: input.capNhatBoiId,
        updatedAt,
      },
    });

  return getCauHinhTaiChinhDonVi(input.donViId);
}
