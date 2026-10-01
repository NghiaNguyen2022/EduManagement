import {
  bigint,
  boolean,
  datetime,
  int,
  mysqlTable,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const cauHinhHeThong = mysqlTable("CauHinhHeThong", {
  id: tinyint("id", { unsigned: true }).primaryKey(),

  soLanDangNhapSaiToiDa: int("soLanDangNhapSaiToiDa", { unsigned: true })
    .notNull()
    .default(5),

  soPhutKhoaDangNhap: int("soPhutKhoaDangNhap", { unsigned: true })
    .notNull()
    .default(15),

  doDaiMatKhauToiThieu: int("doDaiMatKhauToiThieu", { unsigned: true })
    .notNull()
    .default(8),

  capNhatBoiId: bigint("capNhatBoiId", { mode: "number", unsigned: true }),

  updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
});

// Thiết lập hiển thị trên phiếu in (header/footer/nhãn chữ ký) theo từng đơn
// vị — KHÔNG lặp lại tên/địa chỉ/logo (đã có sẵn trên `DonVi`), chỉ lưu phần
// đặc thù cho in ấn mà `DonVi` không có.
export const cauHinhMauIn = mysqlTable(
  "CauHinhMauIn",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    hienThiLogo: boolean("hienThiLogo").notNull().default(true),
    ghiChuFooter: varchar("ghiChuFooter", { length: 1000 }),
    nhanKyNguoiLap: varchar("nhanKyNguoiLap", { length: 100 }).notNull().default("Người lập phiếu"),
    nhanKyNguoiNop: varchar("nhanKyNguoiNop", { length: 100 })
      .notNull()
      .default("Phụ huynh / Người nộp"),
    nhanKyDaiDienDonVi: varchar("nhanKyDaiDienDonVi", { length: 100 })
      .notNull()
      .default("Đại diện đơn vị"),
    capNhatBoiId: bigint("capNhatBoiId", { mode: "number", unsigned: true }),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViUq: uniqueIndex("UQ_CauHinhMauIn_donViId").on(table.donViId),
  }),
);
