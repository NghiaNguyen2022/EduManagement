import { and, count, eq, like } from "drizzle-orm";

import {
  hocSinh,
  hocSinhPhuHuynh,
  phuHuynh,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function findPhuHuynhByPhone(
  donViId: number,
  dienThoai: string,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(phuHuynh)
    .where(
      and(
        eq(phuHuynh.donViId, donViId),
        eq(phuHuynh.dienThoai, dienThoai),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findPhuHuynhById(id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(phuHuynh)
    .where(eq(phuHuynh.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function countPhuHuynhTheoMaPrefix(
  donViId: number,
  prefix: string,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(phuHuynh)
    .where(
      and(
        eq(phuHuynh.donViId, donViId),
        like(phuHuynh.maPhuHuynh, `${prefix}%`),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function createPhuHuynh(input: {
  donViId: number;
  maPhuHuynh: string;
  hoTen: string;
  ngaySinh: string | null;
  gioiTinh: "nam" | "nu" | "khac" | null;
  dienThoai: string;
  email: string | null;
  ngheNghiep: string | null;
  diaChi: string | null;
}) {
  const db = getDb();

  await db.insert(phuHuynh).values({
    donViId: input.donViId,
    maPhuHuynh: input.maPhuHuynh,
    hoTen: input.hoTen,
    ngaySinh: input.ngaySinh,
    gioiTinh: input.gioiTinh,
    dienThoai: input.dienThoai,
    email: input.email,
    ngheNghiep: input.ngheNghiep,
    diaChi: input.diaChi,
    trangThai: "hoat_dong",
    createdAt: now(),
    updatedAt: now(),
  });

  return findPhuHuynhByPhone(input.donViId, input.dienThoai);
}

export async function listGuardianLinksByHocSinh(
  hocSinhId: number,
) {
  const db = getDb();

  return db
    .select({
      lienKet: hocSinhPhuHuynh,
      phuHuynh,
    })
    .from(hocSinhPhuHuynh)
    .innerJoin(
      phuHuynh,
      eq(hocSinhPhuHuynh.phuHuynhId, phuHuynh.id),
    )
    .where(eq(hocSinhPhuHuynh.hocSinhId, hocSinhId));
}

export async function findGuardianLink(
  hocSinhId: number,
  phuHuynhId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(hocSinhPhuHuynh)
    .where(
      and(
        eq(hocSinhPhuHuynh.hocSinhId, hocSinhId),
        eq(hocSinhPhuHuynh.phuHuynhId, phuHuynhId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findGuardianLinkById(
  linkId: number,
) {
  const db = getDb();

  const rows = await db
    .select({
      lienKet: hocSinhPhuHuynh,
      donViId: hocSinh.donViId,
    })
    .from(hocSinhPhuHuynh)
    .innerJoin(
      hocSinh,
      eq(hocSinhPhuHuynh.hocSinhId, hocSinh.id),
    )
    .where(eq(hocSinhPhuHuynh.id, linkId))
    .limit(1);

  return rows[0] ?? null;
}

export async function countGuardianLinksForHocSinh(
  hocSinhId: number,
) {
  const db = getDb();

  const rows = await db
    .select({ total: count() })
    .from(hocSinhPhuHuynh)
    .where(eq(hocSinhPhuHuynh.hocSinhId, hocSinhId));

  return rows[0]?.total ?? 0;
}

export async function clearPrimaryContact(
  hocSinhId: number,
) {
  const db = getDb();

  await db
    .update(hocSinhPhuHuynh)
    .set({
      laLienHeChinh: false,
      updatedAt: now(),
    })
    .where(eq(hocSinhPhuHuynh.hocSinhId, hocSinhId));
}

export async function createGuardianLink(input: {
  hocSinhId: number;
  phuHuynhId: number;
  moiQuanHe:
    | "cha"
    | "me"
    | "ong"
    | "ba"
    | "nguoi_giam_ho"
    | "khac";
  laLienHeChinh: boolean;
  duocDonTre: boolean;
  nhanThongBao: boolean;
  nhanThongTinHocPhi: boolean;
}) {
  const db = getDb();

  await db.insert(hocSinhPhuHuynh).values({
    hocSinhId: input.hocSinhId,
    phuHuynhId: input.phuHuynhId,
    moiQuanHe: input.moiQuanHe,
    laLienHeChinh: input.laLienHeChinh,
    duocDonTre: input.duocDonTre,
    nhanThongBao: input.nhanThongBao,
    nhanThongTinHocPhi: input.nhanThongTinHocPhi,
    createdAt: now(),
    updatedAt: now(),
  });

  return findGuardianLink(input.hocSinhId, input.phuHuynhId);
}

export async function updateGuardianLink(input: {
  id: number;
  moiQuanHe:
    | "cha"
    | "me"
    | "ong"
    | "ba"
    | "nguoi_giam_ho"
    | "khac";
  laLienHeChinh: boolean;
  duocDonTre: boolean;
  nhanThongBao: boolean;
  nhanThongTinHocPhi: boolean;
}) {
  const db = getDb();

  await db
    .update(hocSinhPhuHuynh)
    .set({
      moiQuanHe: input.moiQuanHe,
      laLienHeChinh: input.laLienHeChinh,
      duocDonTre: input.duocDonTre,
      nhanThongBao: input.nhanThongBao,
      nhanThongTinHocPhi: input.nhanThongTinHocPhi,
      updatedAt: now(),
    })
    .where(eq(hocSinhPhuHuynh.id, input.id));

  const rows = await db
    .select()
    .from(hocSinhPhuHuynh)
    .where(eq(hocSinhPhuHuynh.id, input.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteGuardianLink(id: number) {
  const db = getDb();

  await db
    .delete(hocSinhPhuHuynh)
    .where(eq(hocSinhPhuHuynh.id, id));
}
