import { and, count, desc, eq, like } from "drizzle-orm";

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
}) {
  const db = getDb();

  await db.insert(leadHoatDong).values({
    leadId: input.leadId,
    loaiHoatDong: input.loaiHoatDong,
    noiDung: input.noiDung,
    ketQua: input.ketQua,
    nguoiThucHienId: input.nguoiThucHienId,
    thoiGian: input.thoiGian,
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
