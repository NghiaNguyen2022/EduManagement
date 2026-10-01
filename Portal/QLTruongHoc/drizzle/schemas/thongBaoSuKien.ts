import {
  bigint,
  boolean,
  datetime,
  index,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Thông báo tự động do hệ thống sinh ra khi có sự kiện nghiệp vụ (VD: kế
 * toán tạo khoản chi cần duyệt, quản lý đơn vị duyệt/từ chối...) — nhắm tới
 * MỘT nhân viên cụ thể (`nguoiNhanId`). Tách biệt hoàn toàn khỏi `ThongBao`
 * (thông báo thủ công, gửi theo lớp/học sinh/toàn trường) vì mô hình đối
 * tượng nhận khác nhau. Xem docs/analysis/THONG_BAO_SU_KIEN.md.
 */
export const thongBaoSuKien = mysqlTable(
  "ThongBaoSuKien",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    nguoiNhanId: bigint("nguoiNhanId", { mode: "number", unsigned: true }).notNull(),
    loaiSuKien: varchar("loaiSuKien", { length: 100 }).notNull(),
    tieuDe: varchar("tieuDe", { length: 255 }).notNull(),
    noiDung: text("noiDung").notNull(),
    duongDan: varchar("duongDan", { length: 255 }),
    // Đã hiện popup (toast) 1 lần chưa — để mỗi sự kiện chỉ pop-up đúng 1
    // lần, tách biệt khỏi `daDoc` (đã mở xem ở mục chuông) để tránh vừa mất
    // toast vừa mất luôn dấu "chưa đọc".
    daHienThi: boolean("daHienThi").notNull().default(false),
    daHienThiAt: datetime("daHienThiAt", { mode: "string" }),
    daDoc: boolean("daDoc").notNull().default(false),
    daDocAt: datetime("daDocAt", { mode: "string" }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    hienThiIdx: index("IX_ThongBaoSuKien_donViId_nguoiNhanId_daHienThi").on(
      table.donViId,
      table.nguoiNhanId,
      table.daHienThi,
    ),
    docIdx: index("IX_ThongBaoSuKien_donViId_nguoiNhanId_daDoc").on(
      table.donViId,
      table.nguoiNhanId,
      table.daDoc,
    ),
  }),
);
