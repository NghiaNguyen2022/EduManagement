import { and, count, desc, eq, isNull, like, or } from "drizzle-orm";

import {
  donVi,
  giaoVien,
  hocSinh,
  hocSinhLopHoc,
  lopHoc,
  lopHocGiaoVien,
  nguoiDung,
  phieuXepLop,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listLopHocAllDonVi() {
  const db = getDb();

  return db
    .select({
      lopHoc,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(lopHoc)
    .innerJoin(donVi, eq(lopHoc.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, lopHoc.tenLop);
}

/** Tìm kiếm xuyên đơn vị theo tên/mã — dùng cho quản trị hệ thống. */
export async function searchLopHocAllDonVi(keyword: string) {
  const db = getDb();
  const pattern = `%${keyword}%`;

  return db
    .select({
      lopHoc,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(lopHoc)
    .innerJoin(donVi, eq(lopHoc.donViId, donVi.id))
    .where(
      and(
        eq(donVi.trangThai, "hoat_dong"),
        or(like(lopHoc.tenLop, pattern), like(lopHoc.maLop, pattern)),
      ),
    )
    .orderBy(lopHoc.tenLop)
    .limit(10);
}

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

export async function countLopHocTheoMaPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lopHoc)
    .where(and(eq(lopHoc.donViId, donViId), like(lopHoc.maLop, `${prefix}%`)));

  return rows[0]?.total ?? 0;
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

/** Dùng cho Portal giáo viên (J02) — lớp đang phân công (chính/chủ nhiệm/hỗ trợ), chưa hết hạn. */
export async function listLopHocByGiaoVienId(giaoVienId: number) {
  const db = getDb();

  return db
    .select({
      phanCong: lopHocGiaoVien,
      lopHoc,
    })
    .from(lopHocGiaoVien)
    .innerJoin(lopHoc, eq(lopHocGiaoVien.lopHocId, lopHoc.id))
    .where(
      and(
        eq(lopHocGiaoVien.giaoVienId, giaoVienId),
        eq(lopHocGiaoVien.trangThai, "hoat_dong"),
      ),
    )
    .orderBy(lopHoc.tenLop);
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

/** Sĩ số hiện tại/tối đa của TỪNG lớp đang học trong 1 đơn vị — cho Bảng điều hành. */
export async function listSiSoTheoLop(donViId: number) {
  const db = getDb();

  return db
    .select({
      id: lopHoc.id,
      tenLop: lopHoc.tenLop,
      maLop: lopHoc.maLop,
      siSoToiDa: lopHoc.siSoToiDa,
      siSoHienTai: count(hocSinhLopHoc.id),
    })
    .from(lopHoc)
    .leftJoin(
      hocSinhLopHoc,
      and(
        eq(hocSinhLopHoc.lopHocId, lopHoc.id),
        or(
          eq(hocSinhLopHoc.trangThai, "dang_hoc"),
          eq(hocSinhLopHoc.trangThai, "bao_luu"),
        ),
      ),
    )
    .where(and(eq(lopHoc.donViId, donViId), eq(lopHoc.trangThai, "dang_hoc")))
    .groupBy(lopHoc.id)
    .orderBy(lopHoc.tenLop);
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

export async function listEnrollmentsByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select({
      enrollment: hocSinhLopHoc,
      lopHoc,
    })
    .from(hocSinhLopHoc)
    .innerJoin(lopHoc, eq(hocSinhLopHoc.lopHocId, lopHoc.id))
    .where(eq(hocSinhLopHoc.hocSinhId, hocSinhId))
    .orderBy(desc(hocSinhLopHoc.ngayVaoLop));
}

export async function listActiveEnrollmentsByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select()
    .from(hocSinhLopHoc)
    .where(
      and(
        eq(hocSinhLopHoc.hocSinhId, hocSinhId),
        or(
          eq(hocSinhLopHoc.trangThai, "dang_hoc"),
          eq(hocSinhLopHoc.trangThai, "bao_luu"),
        ),
      ),
    );
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

// ---------------------------------------------------------------
// Phiếu xếp lớp
// ---------------------------------------------------------------

export async function countPhieuXepLopTheoPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(phieuXepLop)
    .where(and(eq(phieuXepLop.donViId, donViId), like(phieuXepLop.soPhieu, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function createPhieuXepLop(input: {
  donViId: number;
  enrollmentId: number;
  hocSinhId: number;
  lopHocId: number;
  soPhieu: string;
  nguoiLapId: number;
  ghiChu: string | null;
}) {
  const db = getDb();

  await db.insert(phieuXepLop).values({
    donViId: input.donViId,
    enrollmentId: input.enrollmentId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    soPhieu: input.soPhieu,
    nguoiLapId: input.nguoiLapId,
    ghiChu: input.ghiChu,
    createdAt: now(),
  });

  const rows = await db
    .select()
    .from(phieuXepLop)
    .where(and(eq(phieuXepLop.donViId, input.donViId), eq(phieuXepLop.soPhieu, input.soPhieu)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findPhieuXepLopById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select({
      phieuXepLop,
      hocSinh,
      lopHoc,
      enrollment: hocSinhLopHoc,
      nguoiLap: { id: nguoiDung.id, hoTen: nguoiDung.hoTen },
      donVi,
    })
    .from(phieuXepLop)
    .innerJoin(hocSinh, eq(phieuXepLop.hocSinhId, hocSinh.id))
    .innerJoin(lopHoc, eq(phieuXepLop.lopHocId, lopHoc.id))
    .innerJoin(hocSinhLopHoc, eq(phieuXepLop.enrollmentId, hocSinhLopHoc.id))
    .innerJoin(nguoiDung, eq(phieuXepLop.nguoiLapId, nguoiDung.id))
    .innerJoin(donVi, eq(phieuXepLop.donViId, donVi.id))
    .where(and(eq(phieuXepLop.id, id), eq(phieuXepLop.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}
