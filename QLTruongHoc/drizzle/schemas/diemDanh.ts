import {
  bigint,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const diemDanh = mysqlTable(
  "DiemDanh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    buoiHocId: bigint("buoiHocId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    trangThai: mysqlEnum("trangThai", [
      "co_mat",
      "vang_co_phep",
      "vang_khong_phep",
      "di_tre",
      "ve_som"
    ]).notNull(),
    ghiChu: varchar("ghiChu", { length: 500 }),
    nhanXet: varchar("nhanXet", { length: 500 }),
    actorUserId: bigint("actorUserId", { mode: "number", unsigned: true }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    buoiHocHocSinhUq: uniqueIndex("UQ_DiemDanh_buoiHocId_hocSinhId").on(
      table.buoiHocId,
      table.hocSinhId
    ),
    buoiHocIdx: index("IX_DiemDanh_buoiHocId").on(table.buoiHocId),
    hocSinhIdx: index("IX_DiemDanh_hocSinhId").on(table.hocSinhId)
  })
);

export const baoGiang = mysqlTable(
  "BaoGiang",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    buoiHocId: bigint("buoiHocId", { mode: "number", unsigned: true }).notNull(),
    noiDungBaiHoc: varchar("noiDungBaiHoc", { length: 2000 }),
    baiTap: varchar("baiTap", { length: 2000 }),
    ghiChu: varchar("ghiChu", { length: 500 }),
    actorUserId: bigint("actorUserId", { mode: "number", unsigned: true }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    buoiHocUq: uniqueIndex("UQ_BaoGiang_buoiHocId").on(table.buoiHocId)
  })
);
