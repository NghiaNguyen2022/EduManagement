import { bigint, datetime, index, mysqlEnum, mysqlTable, text } from "drizzle-orm/mysql-core";

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
