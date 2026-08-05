import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { hocSinh, hocSinhLopHoc, lopHoc, tinNhanHocSinh } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listTinNhanByHocSinh(hocSinhId: number) {
  const db = getDb();

  return db
    .select()
    .from(tinNhanHocSinh)
    .where(eq(tinNhanHocSinh.hocSinhId, hocSinhId))
    .orderBy(asc(tinNhanHocSinh.createdAt), asc(tinNhanHocSinh.id));
}

/**
 * Danh sách hộp thư tổng hợp cho nhân viên — mỗi học sinh 1 dòng (tin nhắn
 * mới nhất), để tra cứu nhanh thay vì phải mở từng học sinh một. Gộp theo
 * hocSinhId ở tầng ứng dụng (giữ dòng đầu tiên gặp — do đã ORDER BY DESC nên
 * là dòng mới nhất) thay vì viết SQL group-by phức tạp — khối lượng tin
 * nhắn của 1 trường không lớn tới mức cần tối ưu truy vấn.
 */
export async function listTinNhanThreadsByDonVi(donViId: number) {
  const db = getDb();

  const rows = await db
    .select({
      tinNhan: tinNhanHocSinh,
      hocSinh: {
        id: hocSinh.id,
        hoTen: hocSinh.hoTen,
        maHocSinh: hocSinh.maHocSinh,
      },
    })
    .from(tinNhanHocSinh)
    .innerJoin(hocSinh, eq(tinNhanHocSinh.hocSinhId, hocSinh.id))
    .where(eq(tinNhanHocSinh.donViId, donViId))
    .orderBy(desc(tinNhanHocSinh.createdAt), desc(tinNhanHocSinh.id));

  const threads = new Map<number, (typeof rows)[number]>();

  for (const row of rows) {
    if (!threads.has(row.hocSinh.id)) {
      threads.set(row.hocSinh.id, row);
    }
  }

  const hocSinhIds = [...threads.keys()];

  // Gắn thêm lớp đang học hiện tại của mỗi học sinh — để hộp thư nhóm được
  // theo lớp cho giáo viên phụ trách nhiều lớp dễ tra cứu.
  const lopRows =
    hocSinhIds.length === 0
      ? []
      : await db
          .select({
            hocSinhId: hocSinhLopHoc.hocSinhId,
            lopHoc: { id: lopHoc.id, tenLop: lopHoc.tenLop },
          })
          .from(hocSinhLopHoc)
          .innerJoin(lopHoc, eq(hocSinhLopHoc.lopHocId, lopHoc.id))
          .where(
            and(
              inArray(hocSinhLopHoc.hocSinhId, hocSinhIds),
              eq(hocSinhLopHoc.trangThai, "dang_hoc"),
            ),
          );

  const lopByHocSinh = new Map(lopRows.map((row) => [row.hocSinhId, row.lopHoc]));

  return [...threads.values()].map((row) => ({
    ...row,
    lopHoc: lopByHocSinh.get(row.hocSinh.id) ?? null,
  }));
}

export async function createTinNhan(input: {
  donViId: number;
  hocSinhId: number;
  lopHocId: number | null;
  nguoiGuiId: number;
  nguoiGuiLaPhuHuynh: boolean;
  noiDung: string;
}) {
  const db = getDb();
  const timestamp = now();

  await db.insert(tinNhanHocSinh).values({
    donViId: input.donViId,
    hocSinhId: input.hocSinhId,
    lopHocId: input.lopHocId,
    nguoiGuiId: input.nguoiGuiId,
    nguoiGuiLaPhuHuynh: input.nguoiGuiLaPhuHuynh,
    noiDung: input.noiDung,
    createdAt: timestamp,
  });

  const rows = await db
    .select()
    .from(tinNhanHocSinh)
    .where(eq(tinNhanHocSinh.hocSinhId, input.hocSinhId))
    .orderBy(desc(tinNhanHocSinh.id))
    .limit(1);

  return rows[0] ?? null;
}
