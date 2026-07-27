import { and, count, desc, eq, gte, like, lte, notInArray } from "drizzle-orm";

import { donVi, lead, leadHoatDong } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listLeadByDonVi(donViId: number) {
  const db = getDb();

  return db
    .select()
    .from(lead)
    .where(eq(lead.donViId, donViId))
    .orderBy(desc(lead.createdAt));
}

/** Dùng cho đơn vị hệ thống — xem gộp toàn bộ đơn vị đang hoạt động, kèm đơn vị sở hữu. */
export async function listLeadAllDonVi() {
  const db = getDb();

  return db
    .select({
      lead,
      donVi: {
        id: donVi.id,
        maDonVi: donVi.maDonVi,
        tenDonVi: donVi.tenDonVi,
      },
    })
    .from(lead)
    .innerJoin(donVi, eq(lead.donViId, donVi.id))
    .where(eq(donVi.trangThai, "hoat_dong"))
    .orderBy(donVi.tenDonVi, desc(lead.createdAt));
}

/** Lead chưa chốt (chưa đăng ký, chưa dừng chăm sóc) — dùng cho Portal tuyển sinh (J01). */
export async function countLeadDangXuLy(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lead)
    .where(
      and(
        eq(lead.donViId, donViId),
        notInArray(lead.trangThai, ["da_dang_ky", "khong_tiep_tuc"]),
      ),
    );

  return rows[0]?.total ?? 0;
}

/** Số lịch hẹn tư vấn (loaiHoatDong = hen_lich) diễn ra trong ngày, còn chờ xử lý — dùng cho Portal tuyển sinh. */
export async function countLichHenTuVanHomNay(donViId: number, homNay: string) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(leadHoatDong)
    .innerJoin(lead, eq(leadHoatDong.leadId, lead.id))
    .where(
      and(
        eq(lead.donViId, donViId),
        eq(leadHoatDong.loaiHoatDong, "hen_lich"),
        eq(leadHoatDong.trangThai, "cho_xu_ly"),
        gte(leadHoatDong.thoiGian, `${homNay} 00:00:00`),
        lte(leadHoatDong.thoiGian, `${homNay} 23:59:59`),
      ),
    );

  return rows[0]?.total ?? 0;
}

/** Tỷ lệ chuyển đổi lead thành học sinh (đã đăng ký / tổng lead) — dùng cho Portal tuyển sinh. */
export async function layTyLeChuyenDoiLead(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({ trangThai: lead.trangThai, total: count() })
    .from(lead)
    .where(eq(lead.donViId, donViId))
    .groupBy(lead.trangThai);

  const tongLead = rows.reduce((sum, row) => sum + row.total, 0);
  const daDangKy = rows.find((row) => row.trangThai === "da_dang_ky")?.total ?? 0;

  return { daDangKy, tongLead };
}

export async function findLeadById(
  donViId: number,
  leadId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(lead)
    .where(
      and(
        eq(lead.id, leadId),
        eq(lead.donViId, donViId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function countLeadTheoMaPrefix(
  donViId: number,
  prefix: string,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(lead)
    .where(
      and(
        eq(lead.donViId, donViId),
        like(lead.maLead, `${prefix}%`),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function createLead(input: {
  donViId: number;
  maLead: string;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  nguon:
    | "gioi_thieu"
    | "facebook"
    | "website"
    | "walk_in"
    | "khac";
  doTuoiHoacTrinhDo: string | null;
  nhuCau: string | null;
  tuVanVienId: number | null;
}) {
  const db = getDb();

  await db.insert(lead).values({
    donViId: input.donViId,
    maLead: input.maLead,
    hoTen: input.hoTen,
    soDienThoai: input.soDienThoai,
    email: input.email,
    nguon: input.nguon,
    doTuoiHoacTrinhDo: input.doTuoiHoacTrinhDo,
    nhuCau: input.nhuCau,
    tuVanVienId: input.tuVanVienId,
    trangThai: "moi",
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(lead)
    .where(
      and(
        eq(lead.donViId, input.donViId),
        eq(lead.maLead, input.maLead),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function updateLeadInfo(input: {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  nguon:
    | "gioi_thieu"
    | "facebook"
    | "website"
    | "walk_in"
    | "khac";
  doTuoiHoacTrinhDo: string | null;
  nhuCau: string | null;
}) {
  const db = getDb();

  await db
    .update(lead)
    .set({
      hoTen: input.hoTen,
      soDienThoai: input.soDienThoai,
      email: input.email,
      nguon: input.nguon,
      doTuoiHoacTrinhDo: input.doTuoiHoacTrinhDo,
      nhuCau: input.nhuCau,
      updatedAt: now(),
    })
    .where(eq(lead.id, input.id));

  const rows = await db
    .select()
    .from(lead)
    .where(eq(lead.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function assignTuVanVien(input: {
  id: number;
  tuVanVienId: number | null;
}) {
  const db = getDb();

  await db
    .update(lead)
    .set({
      tuVanVienId: input.tuVanVienId,
      updatedAt: now(),
    })
    .where(eq(lead.id, input.id));

  const rows = await db
    .select()
    .from(lead)
    .where(eq(lead.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateLeadTrangThai(input: {
  id: number;
  trangThai:
    | "moi"
    | "dang_cham_soc"
    | "da_hen_lich"
    | "da_hoc_thu"
    | "da_dang_ky"
    | "khong_tiep_tuc";
  lyDoKhongTiepTuc: string | null;
}) {
  const db = getDb();

  await db
    .update(lead)
    .set({
      trangThai: input.trangThai,
      lyDoKhongTiepTuc: input.lyDoKhongTiepTuc,
      updatedAt: now(),
    })
    .where(eq(lead.id, input.id));

  const rows = await db
    .select()
    .from(lead)
    .where(eq(lead.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function convertLeadToHocSinh(input: {
  id: number;
  hocSinhId: number;
}) {
  const db = getDb();

  await db
    .update(lead)
    .set({
      trangThai: "da_dang_ky",
      hocSinhId: input.hocSinhId,
      updatedAt: now(),
    })
    .where(eq(lead.id, input.id));

  const rows = await db
    .select()
    .from(lead)
    .where(eq(lead.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function listLeadHoatDong(leadId: number) {
  const db = getDb();

  return db
    .select()
    .from(leadHoatDong)
    .where(eq(leadHoatDong.leadId, leadId))
    .orderBy(desc(leadHoatDong.thoiGian));
}

export async function createLeadHoatDong(input: {
  leadId: number;
  loaiHoatDong:
    | "goi_dien"
    | "gap_truc_tiep"
    | "nhan_tin"
    | "hen_lich"
    | "hoc_thu"
    | "khac";
  noiDung: string;
  ketQua: string | null;
  nguoiThucHienId: number;
  thoiGian: string;
  trangThai: "cho_xu_ly" | "da_xu_ly" | "da_huy";
}) {
  const db = getDb();

  await db.insert(leadHoatDong).values({
    leadId: input.leadId,
    loaiHoatDong: input.loaiHoatDong,
    noiDung: input.noiDung,
    ketQua: input.ketQua,
    nguoiThucHienId: input.nguoiThucHienId,
    thoiGian: input.thoiGian,
    trangThai: input.trangThai,
    createdAt: now(),
  });

  const rows = await db
    .select()
    .from(leadHoatDong)
    .where(eq(leadHoatDong.leadId, input.leadId))
    .orderBy(desc(leadHoatDong.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findLeadHoatDongById(id: number) {
  const db = getDb();

  const rows = await db
    .select({ hoatDong: leadHoatDong, donViId: lead.donViId })
    .from(leadHoatDong)
    .innerJoin(lead, eq(leadHoatDong.leadId, lead.id))
    .where(eq(leadHoatDong.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateLeadHoatDongTrangThai(input: {
  id: number;
  trangThai: "da_xu_ly" | "da_huy";
}) {
  const db = getDb();

  await db
    .update(leadHoatDong)
    .set({ trangThai: input.trangThai })
    .where(eq(leadHoatDong.id, input.id));

  const rows = await db
    .select()
    .from(leadHoatDong)
    .where(eq(leadHoatDong.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Lịch hẹn (loaiHoatDong = hen_lich) còn CHỜ XỬ LÝ — dùng cho "Lịch hẹn sắp
 * tới" ở `LeadsPage`. Không lọc theo ngày (khác `countLichHenTuVanHomNay`
 * chỉ đếm hôm nay) — tư vấn viên cần thấy cả lịch hẹn quá hạn chưa xử lý.
 */
export async function listLichHenSapToi(donViId: number) {
  const db = getDb();

  return db
    .select({
      hoatDong: leadHoatDong,
      lead: {
        id: lead.id,
        maLead: lead.maLead,
        hoTen: lead.hoTen,
        soDienThoai: lead.soDienThoai,
      },
    })
    .from(leadHoatDong)
    .innerJoin(lead, eq(leadHoatDong.leadId, lead.id))
    .where(
      and(
        eq(lead.donViId, donViId),
        eq(leadHoatDong.loaiHoatDong, "hen_lich"),
        eq(leadHoatDong.trangThai, "cho_xu_ly"),
      ),
    )
    .orderBy(leadHoatDong.thoiGian);
}
