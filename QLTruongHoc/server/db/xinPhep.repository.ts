import { and, desc, eq, inArray } from "drizzle-orm";

import { donXinPhep, hocSinh, lopHoc } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export async function createDonXinPhep(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId: number;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  nguoiTaoId: number;
}) {
  const db = getDb();
  const createdAt = now();

  await db.insert(donXinPhep).values({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    tuNgay: input.tuNgay,
    denNgay: input.denNgay,
    lyDo: input.lyDo,
    nguoiTaoId: input.nguoiTaoId,
    createdAt,
    updatedAt: createdAt,
  });

  const rows = await db
    .select()
    .from(donXinPhep)
    .where(
      and(
        eq(donXinPhep.donViId, input.donViId),
        eq(donXinPhep.hocSinhId, input.hocSinhId),
        eq(donXinPhep.nguoiTaoId, input.nguoiTaoId),
        eq(donXinPhep.createdAt, createdAt),
      ),
    )
    .orderBy(desc(donXinPhep.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findDonXinPhepById(donViId: number, id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(donXinPhep)
    .where(and(eq(donXinPhep.id, id), eq(donXinPhep.donViId, donViId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listDonXinPhepByHocSinhIds(hocSinhIds: number[]) {
  const db = getDb();

  if (hocSinhIds.length === 0) {
    return [];
  }

  return db
    .select({
      donXinPhep,
      hocSinh: {
        id: hocSinh.id,
        maHocSinh: hocSinh.maHocSinh,
        hoTen: hocSinh.hoTen,
      },
      lopHoc: {
        id: lopHoc.id,
        maLop: lopHoc.maLop,
        tenLop: lopHoc.tenLop,
      },
    })
    .from(donXinPhep)
    .innerJoin(hocSinh, eq(donXinPhep.hocSinhId, hocSinh.id))
    .innerJoin(lopHoc, eq(donXinPhep.lopHocId, lopHoc.id))
    .where(inArray(donXinPhep.hocSinhId, hocSinhIds))
    .orderBy(desc(donXinPhep.createdAt));
}

export async function listDonXinPhepByDonVi(donViId: number, trangThai?: string) {
  const db = getDb();

  const conditions = [eq(donXinPhep.donViId, donViId)];

  if (trangThai) {
    conditions.push(eq(donXinPhep.trangThai, trangThai as "cho_duyet" | "da_duyet" | "tu_choi"));
  }

  return db
    .select({
      donXinPhep,
      hocSinh: {
        id: hocSinh.id,
        maHocSinh: hocSinh.maHocSinh,
        hoTen: hocSinh.hoTen,
      },
      lopHoc: {
        id: lopHoc.id,
        maLop: lopHoc.maLop,
        tenLop: lopHoc.tenLop,
      },
    })
    .from(donXinPhep)
    .innerJoin(hocSinh, eq(donXinPhep.hocSinhId, hocSinh.id))
    .innerJoin(lopHoc, eq(donXinPhep.lopHocId, lopHoc.id))
    .where(and(...conditions))
    .orderBy(desc(donXinPhep.createdAt));
}

export async function updateDonXinPhepTrangThai(input: {
  id: number;
  trangThai: "da_duyet" | "tu_choi";
  nguoiDuyetId: number;
  ghiChuDuyet: string | null;
}) {
  const db = getDb();
  const duyetAt = now();

  await db
    .update(donXinPhep)
    .set({
      trangThai: input.trangThai,
      nguoiDuyetId: input.nguoiDuyetId,
      ghiChuDuyet: input.ghiChuDuyet,
      duyetAt,
      updatedAt: duyetAt,
    })
    .where(eq(donXinPhep.id, input.id));
}
