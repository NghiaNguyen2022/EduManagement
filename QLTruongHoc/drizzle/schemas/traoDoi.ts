import { bigint, boolean, datetime, index, mysqlEnum, mysqlTable, text } from "drizzle-orm/mysql-core";

export const traoDoiHocSinh = mysqlTable(
  "TraoDoiHocSinh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }),
    nguoiGuiVaiTro: mysqlEnum("nguoiGuiVaiTro", ["giao_vien", "phu_huynh", "hoc_vu", "khac"])
      .notNull()
      .default("hoc_vu"),
    kenhLienLac: mysqlEnum("kenhLienLac", ["truc_tiep", "dien_thoai", "nhan_tin", "email", "khac"])
      .notNull()
      .default("truc_tiep"),
    noiDung: text("noiDung").notNull(),
    ketQua: text("ketQua"),
    nguoiTaoId: bigint("nguoiTaoId", { mode: "number", unsigned: true }).notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViIdx: index("IX_TraoDoiHocSinh_donViId").on(table.donViId),
    hocSinhIdx: index("IX_TraoDoiHocSinh_hocSinhId").on(table.hocSinhId),
    lopHocIdx: index("IX_TraoDoiHocSinh_lopHocId").on(table.lopHocId),
    createdAtIdx: index("IX_TraoDoiHocSinh_createdAt").on(table.createdAt),
  }),
);

/**
 * Nhắn tin 2 chiều thật giữa phụ huynh và giáo viên, tách khỏi
 * `TraoDoiHocSinh` (log tổng kết cuộc trò chuyện do nhân viên ghi — kênh
 * trực tiếp/điện thoại/email, ngữ nghĩa khác: log-sự-kiện vs luồng-hội-thoại).
 * `nguoiGuiId` là `NguoiDung.id` thật của người gửi (cả 2 phía), không phải
 * nhãn vai trò tự chọn như bảng trên.
 */
export const tinNhanHocSinh = mysqlTable(
  "TinNhanHocSinh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }),
    nguoiGuiId: bigint("nguoiGuiId", { mode: "number", unsigned: true }).notNull(),
    nguoiGuiLaPhuHuynh: boolean("nguoiGuiLaPhuHuynh").notNull(),
    noiDung: text("noiDung").notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    hocSinhIdx: index("IX_TinNhanHocSinh_donViId_hocSinhId_createdAt").on(
      table.donViId,
      table.hocSinhId,
      table.createdAt,
    ),
  }),
);
