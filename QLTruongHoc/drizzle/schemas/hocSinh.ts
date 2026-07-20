import {
  bigint,
  date,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar
} from "drizzle-orm/mysql-core";

export const hocSinh = mysqlTable(
  "HocSinh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maHocSinh: varchar("maHocSinh", { length: 50 }).notNull(),
    hoTen: varchar("hoTen", { length: 255 }).notNull(),
    ngaySinh: date("ngaySinh", { mode: "string" }),
    gioiTinh: mysqlEnum("gioiTinh", ["nam", "nu", "khac"]),
    ngayNhapHoc: date("ngayNhapHoc", { mode: "string" }),
    trangThai: mysqlEnum("trangThai", [
      "tiep_nhan",
      "dang_hoc",
      "bao_luu",
      "ngung_hoc",
      "hoan_thanh"
    ]).notNull().default("tiep_nhan"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maHocSinhTheoDonViUq: uniqueIndex("UQ_HocSinh_donViId_maHocSinh").on(
      table.donViId,
      table.maHocSinh
    ),
    donViIdx: index("IX_HocSinh_donViId").on(table.donViId),
    trangThaiIdx: index("IX_HocSinh_trangThai").on(table.trangThai)
  })
);
