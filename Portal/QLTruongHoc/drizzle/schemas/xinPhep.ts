import {
  bigint,
  date,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";

export const donXinPhep = mysqlTable(
  "DonXinPhep",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }).notNull(),
    tuNgay: date("tuNgay", { mode: "string" }).notNull(),
    denNgay: date("denNgay", { mode: "string" }).notNull(),
    lyDo: varchar("lyDo", { length: 500 }).notNull(),
    trangThai: mysqlEnum("trangThai", ["cho_duyet", "da_duyet", "tu_choi"])
      .notNull()
      .default("cho_duyet"),
    nguoiTaoId: bigint("nguoiTaoId", { mode: "number", unsigned: true }).notNull(),
    nguoiDuyetId: bigint("nguoiDuyetId", { mode: "number", unsigned: true }),
    ghiChuDuyet: varchar("ghiChuDuyet", { length: 500 }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
    duyetAt: datetime("duyetAt", { mode: "string" }),
  },
  (table) => ({
    hocSinhIdx: index("IX_DonXinPhep_hocSinhId").on(table.hocSinhId),
    lopHocIdx: index("IX_DonXinPhep_lopHocId").on(table.lopHocId),
    donViTrangThaiIdx: index("IX_DonXinPhep_donViId_trangThai").on(
      table.donViId,
      table.trangThai,
    ),
  }),
);
