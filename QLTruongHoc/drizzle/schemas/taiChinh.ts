import {
  bigint,
  date,
  datetime,
  decimal,
  index,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const danhMucKhoanThu = mysqlTable(
  "DanhMucKhoanThu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maKhoanThu: varchar("maKhoanThu", { length: 50 }).notNull(),
    tenKhoanThu: varchar("tenKhoanThu", { length: 255 }).notNull(),
    loaiKhoanThu: mysqlEnum("loaiKhoanThu", [
      "hoc_phi",
      "tien_an",
      "dich_vu",
      "tai_lieu",
      "khac"
    ]).notNull(),
    soTienMacDinh: decimal("soTienMacDinh", { precision: 18, scale: 2 }),
    batBuoc: mysqlEnum("batBuoc", ["co", "khong"]).notNull().default("co"),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_ap_dung"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maTheoDonViUq: uniqueIndex("UQ_DanhMucKhoanThu_donViId_ma").on(
      table.donViId,
      table.maKhoanThu
    ),
    donViIdx: index("IX_DanhMucKhoanThu_donViId").on(table.donViId)
  })
);

export const kyThu = mysqlTable(
  "KyThu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maKyThu: varchar("maKyThu", { length: 50 }).notNull(),
    tenKyThu: varchar("tenKyThu", { length: 255 }).notNull(),
    loaiKy: mysqlEnum("loaiKy", ["thang", "khoa_hoc", "hoc_ky", "dot"]).notNull(),
    tuNgay: date("tuNgay", { mode: "string" }).notNull(),
    denNgay: date("denNgay", { mode: "string" }).notNull(),
    hanThanhToan: date("hanThanhToan", { mode: "string" }),
    trangThai: mysqlEnum("trangThai", ["nhap", "da_mo", "da_dong"])
      .notNull()
      .default("nhap"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maTheoDonViUq: uniqueIndex("UQ_KyThu_donViId_ma").on(
      table.donViId,
      table.maKyThu
    ),
    donViIdx: index("IX_KyThu_donViId").on(table.donViId)
  })
);

export const kyThuKhoanThu = mysqlTable(
  "KyThuKhoanThu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    kyThuId: bigint("kyThuId", { mode: "number", unsigned: true }).notNull(),
    danhMucKhoanThuId: bigint("danhMucKhoanThuId", { mode: "number", unsigned: true }).notNull(),
    soTien: decimal("soTien", { precision: 18, scale: 2 }).notNull(),
    ghiChu: varchar("ghiChu", { length: 500 }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    kyThuKhoanThuUq: uniqueIndex("UQ_KyThuKhoanThu_kyThuId_danhMucId").on(
      table.kyThuId,
      table.danhMucKhoanThuId
    ),
    kyThuIdx: index("IX_KyThuKhoanThu_kyThuId").on(table.kyThuId)
  })
);
