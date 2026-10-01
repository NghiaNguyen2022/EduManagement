import { desc, eq } from "drizzle-orm";

import {
  hocSinh,
  hocSinhLopHoc,
  hocSinhLopHocDanhGia,
  lopHoc,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

/**
 * Toàn bộ đánh giá của 1 học sinh, gắn thẳng theo `hocSinhId` — liền mạch
 * qua các lần chuyển lớp. LEFT JOIN qua enrollment/lớp chỉ để lấy nhãn lớp
 * làm ngữ cảnh hiển thị khi có (`enrollmentId` không còn bắt buộc).
 */
export async function listDanhGiaByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select({
      danhGia: hocSinhLopHocDanhGia,
      lopHoc: {
        id: lopHoc.id,
        maLop: lopHoc.maLop,
        tenLop: lopHoc.tenLop,
      },
    })
    .from(hocSinhLopHocDanhGia)
    .leftJoin(
      hocSinhLopHoc,
      eq(hocSinhLopHocDanhGia.enrollmentId, hocSinhLopHoc.id),
    )
    .leftJoin(lopHoc, eq(hocSinhLopHoc.lopHocId, lopHoc.id))
    .where(eq(hocSinhLopHocDanhGia.hocSinhId, hocSinhId))
    .orderBy(desc(hocSinhLopHocDanhGia.ngayDanhGia), desc(hocSinhLopHocDanhGia.id));
}

export async function findDanhGiaById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      danhGia: hocSinhLopHocDanhGia,
      donViId: hocSinh.donViId,
    })
    .from(hocSinhLopHocDanhGia)
    .innerJoin(hocSinh, eq(hocSinhLopHocDanhGia.hocSinhId, hocSinh.id))
    .where(eq(hocSinhLopHocDanhGia.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createDanhGia(input: {
  hocSinhId: number;
  enrollmentId: number | null;
  loaiDanhGia:
    | "giua_ky"
    | "cuoi_ky"
    | "khac"
    | "theo_thang"
    | "theo_quy"
    | "theo_nam";
  linhVucPhatTrien:
    | "the_chat"
    | "nhan_thuc"
    | "ngon_ngu"
    | "tinh_cam_ky_nang_xa_hoi"
    | "tham_my"
    | null;
  diemSo: string | null;
  xepLoai: string | null;
  nhanXet: string | null;
  ngayDanhGia: string;
  actorUserId: number;
}) {
  const db = getDb();
  const timestamp = now();

  await db.insert(hocSinhLopHocDanhGia).values({
    hocSinhId: input.hocSinhId,
    enrollmentId: input.enrollmentId,
    loaiDanhGia: input.loaiDanhGia,
    linhVucPhatTrien: input.linhVucPhatTrien,
    diemSo: input.diemSo,
    xepLoai: input.xepLoai,
    nhanXet: input.nhanXet,
    ngayDanhGia: input.ngayDanhGia,
    actorUserId: input.actorUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const rows = await db
    .select()
    .from(hocSinhLopHocDanhGia)
    .where(eq(hocSinhLopHocDanhGia.hocSinhId, input.hocSinhId))
    .orderBy(desc(hocSinhLopHocDanhGia.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteDanhGia(id: number) {
  const db = getDb();

  await db.delete(hocSinhLopHocDanhGia).where(eq(hocSinhLopHocDanhGia.id, id));
}
