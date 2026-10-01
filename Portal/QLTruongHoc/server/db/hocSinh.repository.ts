import { and, count, desc, eq, isNull, like, ne, or } from "drizzle-orm";

import {
  donVi,
  hocSinh,
  hocSinhLopHoc,
  hocSinhTrangThaiLichSu,
  nguoiDung,
  phieuNhapHoc,
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

/**
 * Học sinh đang hoạt động nhưng chưa có lớp nào đang `dang_hoc` — suy trực
 * tiếp từ dữ liệu enrollment (`HocSinhLopHoc`), không cần cờ trạng thái
 * riêng: học sinh mới xác nhận đăng ký chưa chọn lớp, hoặc vừa kết thúc lớp
 * cũ mà chưa xếp lớp mới, đều tự động xuất hiện/biến mất đúng lúc. Xem
 * docs/analysis/THONG_BAO_SU_KIEN.md.
 */
export async function listHocSinhChoXepLop(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ hocSinh })
    .from(hocSinh)
    .leftJoin(
      hocSinhLopHoc,
      and(eq(hocSinhLopHoc.hocSinhId, hocSinh.id), eq(hocSinhLopHoc.trangThai, "dang_hoc")),
    )
    .where(
      and(
        eq(hocSinh.donViId, donViId),
        isNull(hocSinhLopHoc.id),
        ne(hocSinh.trangThai, "ngung_hoc"),
        ne(hocSinh.trangThai, "hoan_thanh"),
      ),
    )
    .orderBy(hocSinh.hoTen);

  return rows.map((row) => row.hocSinh);
}

/** Đếm nhanh cho stat card Cổng học vụ — cùng điều kiện `listHocSinhChoXepLop`. */
export async function countHocSinhChoXepLop(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinh)
    .leftJoin(
      hocSinhLopHoc,
      and(eq(hocSinhLopHoc.hocSinhId, hocSinh.id), eq(hocSinhLopHoc.trangThai, "dang_hoc")),
    )
    .where(
      and(
        eq(hocSinh.donViId, donViId),
        isNull(hocSinhLopHoc.id),
        ne(hocSinh.trangThai, "ngung_hoc"),
        ne(hocSinh.trangThai, "hoan_thanh"),
      ),
    );

  return rows[0]?.total ?? 0;
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

/** Tìm kiếm xuyên đơn vị theo tên/mã — dùng cho quản trị hệ thống. */
export async function searchHocSinhAllDonVi(keyword: string) {
  const db = getDb();
  const pattern = `%${keyword}%`;

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
    .where(
      and(
        eq(donVi.trangThai, "hoat_dong"),
        or(
          like(hocSinh.hoTen, pattern),
          like(hocSinh.maHocSinh, pattern),
          like(hocSinh.tenThuongGoi, pattern),
        ),
      ),
    )
    .orderBy(hocSinh.hoTen)
    .limit(10);
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
  nguyenVongLop?: string | null;
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
    nguyenVongLop: input.nguyenVongLop ?? null,
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
  hinhAnhUrl: string | null;
  ngaySinh: string | null;
  gioiTinh: "nam" | "nu" | "khac" | null;
  soDinhDanh: string | null;
  noiSinh: string | null;
  danToc: string | null;
  quocTich: string | null;
  diaChi: string | null;
  truongLopTruocDo: string | null;
  ngayNhapHoc: string | null;
  dienChinhSach: string | null;
  chieuCaoCm: string | null;
  canNangKg: string | null;
  diUngBenhNen: string | null;
  lienHeKhanCapHoTen: string | null;
  lienHeKhanCapSdt: string | null;
}) {
  const db = getDb();

  await db
    .update(hocSinh)
    .set({
      hoTen: input.hoTen,
      tenThuongGoi: input.tenThuongGoi,
      hinhAnhUrl: input.hinhAnhUrl,
      ngaySinh: input.ngaySinh,
      gioiTinh: input.gioiTinh,
      soDinhDanh: input.soDinhDanh,
      noiSinh: input.noiSinh,
      danToc: input.danToc,
      quocTich: input.quocTich,
      diaChi: input.diaChi,
      truongLopTruocDo: input.truongLopTruocDo,
      ngayNhapHoc: input.ngayNhapHoc,
      dienChinhSach: input.dienChinhSach,
      chieuCaoCm: input.chieuCaoCm,
      canNangKg: input.canNangKg,
      diUngBenhNen: input.diUngBenhNen,
      lienHeKhanCapHoTen: input.lienHeKhanCapHoTen,
      lienHeKhanCapSdt: input.lienHeKhanCapSdt,
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

export async function updateKetQuaTestDauVao(input: {
  id: number;
  ketQuaTestDauVao: string | null;
}) {
  const db = getDb();

  await db
    .update(hocSinh)
    .set({
      ketQuaTestDauVao: input.ketQuaTestDauVao,
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

// ---------------------------------------------------------------
// Phiếu xác nhận nhập học
// ---------------------------------------------------------------

export async function countPhieuNhapHocTheoPrefix(donViId: number, prefix: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(phieuNhapHoc)
    .where(and(eq(phieuNhapHoc.donViId, donViId), like(phieuNhapHoc.soPhieu, `${prefix}%`)));

  return rows[0]?.total ?? 0;
}

export async function createPhieuNhapHoc(input: {
  donViId: number;
  hocSinhId: number;
  soPhieu: string;
  ngayNhapHoc: string;
  nguoiLapId: number;
  ghiChu: string | null;
}) {
  const db = getDb();

  await db.insert(phieuNhapHoc).values({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    soPhieu: input.soPhieu,
    ngayNhapHoc: input.ngayNhapHoc,
    nguoiLapId: input.nguoiLapId,
    ghiChu: input.ghiChu,
    createdAt: now(),
  });

  const rows = await db
    .select()
    .from(phieuNhapHoc)
    .where(and(eq(phieuNhapHoc.donViId, input.donViId), eq(phieuNhapHoc.soPhieu, input.soPhieu)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findPhieuNhapHocById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select({
      phieuNhapHoc,
      hocSinh,
      nguoiLap: { id: nguoiDung.id, hoTen: nguoiDung.hoTen },
      donVi,
    })
    .from(phieuNhapHoc)
    .innerJoin(hocSinh, eq(phieuNhapHoc.hocSinhId, hocSinh.id))
    .innerJoin(nguoiDung, eq(phieuNhapHoc.nguoiLapId, nguoiDung.id))
    .innerJoin(donVi, eq(phieuNhapHoc.donViId, donVi.id))
    .where(and(eq(phieuNhapHoc.id, id), eq(phieuNhapHoc.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listPhieuNhapHocByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select()
    .from(phieuNhapHoc)
    .where(eq(phieuNhapHoc.hocSinhId, hocSinhId))
    .orderBy(desc(phieuNhapHoc.createdAt));
}
