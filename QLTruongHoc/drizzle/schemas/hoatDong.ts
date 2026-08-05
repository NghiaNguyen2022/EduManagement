import {
  bigint,
  date,
  datetime,
  index,
  int,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Album ảnh hoạt động lớp học — giáo viên đăng nhiều ảnh/1 hoạt động (buổi
 * học, dã ngoại, lễ hội...) để phụ huynh xem, thay thế việc gửi ảnh qua
 * Zalo. Tách khỏi `ThongBao` (thông báo hành chính có đính kèm) vì đây là
 * dòng thời gian ảnh riêng, không phải thông báo cần xác nhận đã đọc.
 */
export const hoatDongLopHoc = mysqlTable(
  "HoatDongLopHoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }).notNull(),
    ngayHoatDong: date("ngayHoatDong", { mode: "string" }).notNull(),
    tieuDe: varchar("tieuDe", { length: 255 }).notNull(),
    moTa: text("moTa"),
    actorUserId: bigint("actorUserId", { mode: "number", unsigned: true }).notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViIdx: index("IX_HoatDongLopHoc_donViId_lopHocId_ngayHoatDong").on(
      table.donViId,
      table.lopHocId,
      table.ngayHoatDong,
    ),
  }),
);

// Nhiều ảnh cho 1 hoạt động — thuTu để giữ đúng thứ tự hiển thị lúc đăng.
export const hoatDongAnh = mysqlTable(
  "HoatDongAnh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    hoatDongId: bigint("hoatDongId", { mode: "number", unsigned: true }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    thuTu: int("thuTu").notNull().default(0),
  },
  (table) => ({
    hoatDongIdx: index("IX_HoatDongAnh_hoatDongId").on(table.hoatDongId),
  }),
);

// Gắn thẻ học sinh cụ thể trong 1 hoạt động — để trống nghĩa là ảnh áp dụng
// chung cả lớp (không phải mọi phụ huynh phải tick từng bé).
export const hoatDongHocSinh = mysqlTable(
  "HoatDongHocSinh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    hoatDongId: bigint("hoatDongId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
  },
  (table) => ({
    hoatDongIdx: index("IX_HoatDongHocSinh_hoatDongId").on(table.hoatDongId),
    hocSinhIdx: index("IX_HoatDongHocSinh_hocSinhId").on(table.hocSinhId),
  }),
);
