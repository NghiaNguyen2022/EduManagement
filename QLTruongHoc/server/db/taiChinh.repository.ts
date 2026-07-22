import { and, count, eq, gt, gte, like, lte, sql } from "drizzle-orm";

import {
  danhMucKhoanThu,
  donVi,
  hocSinh,
  hocSinhLopHoc,
  khoanPhaiThu,
  khoanPhaiThuChiTiet,
  kyThu,
  kyThuKhoanThu,
  phieuThu,
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

// ---------------------------------------------------------------
// Học sinh đang học trong lớp (dùng để sinh khoản phải thu)
// ---------------------------------------------------------------

export async function listHocSinhDangHocTrongLop(lopHocId: number) {
  const db = getDb();

  return db
    .select({ hocSinh })
    .from(hocSinhLopHoc)
    .innerJoin(hocSinh, eq(hocSinhLopHoc.hocSinhId, hocSinh.id))
    .where(
      and(
        eq(hocSinhLopHoc.lopHocId, lopHocId),
        eq(hocSinhLopHoc.trangThai, "dang_hoc"),
      ),
    );
}

// ---------------------------------------------------------------
// Khoản phải thu
// ---------------------------------------------------------------

export async function findKhoanPhaiThuByKyThuHocSinh(
  kyThuId: number,
  hocSinhId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(khoanPhaiThu)
    .where(
      and(
        eq(khoanPhaiThu.kyThuId, kyThuId),
        eq(khoanPhaiThu.hocSinhId, hocSinhId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createKhoanPhaiThu(input: {
  donViId: number;
  kyThuId: number;
  hocSinhId: number;
  tongTien: string;
  chiTiet: { danhMucKhoanThuId: number; soTien: string }[];
}) {
  const db = getDb();

  await db.insert(khoanPhaiThu).values({
    donViId: input.donViId,
    kyThuId: input.kyThuId,
    hocSinhId: input.hocSinhId,
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

export async function findKhoanPhaiThuById(
  donViId: number,
  id: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(khoanPhaiThu)
    .where(
      and(eq(khoanPhaiThu.id, id), eq(khoanPhaiThu.donViId, donViId)),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function listKhoanPhaiThuByKyThu(kyThuId: number) {
  const db = getDb();

  return db
    .select({ khoanPhaiThu, hocSinh })
    .from(khoanPhaiThu)
    .innerJoin(hocSinh, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .where(eq(khoanPhaiThu.kyThuId, kyThuId))
    .orderBy(hocSinh.hoTen);
}

/** Công nợ toàn đơn vị — mọi khoản phải thu còn nợ (tổng tiền - giảm trừ - đã thu > 0). */
export async function listCongNoByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select({ khoanPhaiThu, hocSinh, kyThu })
    .from(khoanPhaiThu)
    .innerJoin(hocSinh, eq(khoanPhaiThu.hocSinhId, hocSinh.id))
    .innerJoin(kyThu, eq(khoanPhaiThu.kyThuId, kyThu.id))
    .where(
      and(
        eq(khoanPhaiThu.donViId, donViId),
        gt(
          sql`${khoanPhaiThu.tongTien} - ${khoanPhaiThu.giamTru} - ${khoanPhaiThu.daThu}`,
          0,
        ),
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

  const rows = await db
    .select()
    .from(khoanPhaiThu)
    .where(eq(khoanPhaiThu.id, input.id))
    .limit(1);

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

  const rows = await db
    .select()
    .from(khoanPhaiThu)
    .where(eq(khoanPhaiThu.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

// ---------------------------------------------------------------
// Phiếu thu
// ---------------------------------------------------------------

export async function countPhieuThuTheoPrefix(
  donViId: number,
  prefix: string,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(phieuThu)
    .where(
      and(
        eq(phieuThu.donViId, donViId),
        like(phieuThu.soPhieu, `${prefix}%`),
      ),
    );

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
    ngayThu: now(),
    createdAt: now(),
  });

  const rows = await db
    .select()
    .from(phieuThu)
    .where(
      and(
        eq(phieuThu.donViId, input.donViId),
        eq(phieuThu.soPhieu, input.soPhieu),
      ),
    )
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

// ---------------------------------------------------------------
// Báo cáo tài chính
// ---------------------------------------------------------------

export async function sumPhieuThuTrongKhoang(
  donViId: number,
  tuNgay: string,
  denNgay: string,
) {
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
