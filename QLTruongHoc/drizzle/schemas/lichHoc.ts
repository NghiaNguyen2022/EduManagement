import {
  bigint,
  date,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  time,
  varchar,
} from "drizzle-orm/mysql-core";

export const lichHoc = mysqlTable(
  "LichHoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }).notNull(),
    thuTrongTuan: int("thuTrongTuan").notNull(),
    gioBatDau: time("gioBatDau").notNull(),
    gioKetThuc: time("gioKetThuc").notNull(),
    phongHoc: varchar("phongHoc", { length: 100 }),
    giaoVienId: bigint("giaoVienId", { mode: "number", unsigned: true }),
    ngayApDungTu: date("ngayApDungTu", { mode: "string" }).notNull(),
    ngayApDungDen: date("ngayApDungDen", { mode: "string" }),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_hoat_dong"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    lopHocIdx: index("IX_LichHoc_lopHocId").on(table.lopHocId),
    lopHocTrangThaiIdx: index("IX_LichHoc_lopHocId_trangThai").on(
      table.lopHocId,
      table.trangThai
    )
  })
);

export const buoiHoc = mysqlTable(
  "BuoiHoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }).notNull(),
    lichHocId: bigint("lichHocId", { mode: "number", unsigned: true }),
    ngayHoc: date("ngayHoc", { mode: "string" }).notNull(),
    gioBatDau: time("gioBatDau").notNull(),
    gioKetThuc: time("gioKetThuc").notNull(),
    phongHoc: varchar("phongHoc", { length: 100 }),
    giaoVienId: bigint("giaoVienId", { mode: "number", unsigned: true }),
    loaiBuoi: mysqlEnum("loaiBuoi", ["thuong", "bu"])
      .notNull()
      .default("thuong"),
    trangThai: mysqlEnum("trangThai", ["du_kien", "da_hoc", "nghi", "huy"])
      .notNull()
      .default("du_kien"),
    ghiChu: varchar("ghiChu", { length: 500 }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    lopHocIdx: index("IX_BuoiHoc_lopHocId_ngayHoc").on(
      table.lopHocId,
      table.ngayHoc
    ),
    lichHocIdx: index("IX_BuoiHoc_lichHocId").on(table.lichHocId),
    giaoVienIdx: index("IX_BuoiHoc_giaoVienId_ngayHoc").on(
      table.giaoVienId,
      table.ngayHoc
    ),
    ngayHocIdx: index("IX_BuoiHoc_ngayHoc_trangThai").on(
      table.ngayHoc,
      table.trangThai
    )
  })
);
