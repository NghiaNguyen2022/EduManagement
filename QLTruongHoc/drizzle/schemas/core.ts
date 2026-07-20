import {
  bigint,
  boolean,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const donVi = mysqlTable(
  "DonVi",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    donViChaId: bigint("donViChaId", {
      mode: "number",
      unsigned: true,
    }),

    maDonVi: varchar("maDonVi", { length: 50 }).notNull(),
    tenDonVi: varchar("tenDonVi", { length: 255 }).notNull(),

    loaiDonVi: mysqlEnum("loaiDonVi", [
      "he_thong",
      "truong",
      "trung_tam",
      "co_so",
    ]).notNull(),

    loaiHinhDaoTao: mysqlEnum("loaiHinhDaoTao", [
      "mam_non",
      "ngoai_ngu",
      "tin_hoc",
      "khac",
    ]),

    diaChi: varchar("diaChi", { length: 500 }),
    soDienThoai: varchar("soDienThoai", { length: 30 }),
    email: varchar("email", { length: 255 }),

    trangThai: mysqlEnum("trangThai", [
      "hoat_dong",
      "tam_ngung",
      "ngung_hoat_dong",
    ])
      .notNull()
      .default("hoat_dong"),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maDonViUq: uniqueIndex("UQ_DonVi_maDonVi").on(table.maDonVi),
    donViChaIdx: index("IX_DonVi_donViChaId").on(table.donViChaId),
    loaiDonViIdx: index("IX_DonVi_loaiDonVi").on(table.loaiDonVi),
    trangThaiIdx: index("IX_DonVi_trangThai").on(table.trangThai),
  }),
);

export const nguoiDung = mysqlTable(
  "NguoiDung",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    tenDangNhap: varchar("tenDangNhap", { length: 100 }).notNull(),
    matKhauHash: varchar("matKhauHash", { length: 255 }).notNull(),

    hoTen: varchar("hoTen", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    soDienThoai: varchar("soDienThoai", { length: 30 }),

    trangThai: mysqlEnum("trangThai", [
      "hoat_dong",
      "tam_khoa",
      "ngung",
    ])
      .notNull()
      .default("hoat_dong"),

    batBuocDoiMatKhau: boolean("batBuocDoiMatKhau")
      .notNull()
      .default(true),

    lanDangNhapCuoi: datetime("lanDangNhapCuoi", { mode: "string" }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    tenDangNhapUq: uniqueIndex("UQ_NguoiDung_tenDangNhap").on(
      table.tenDangNhap,
    ),
    emailUq: uniqueIndex("UQ_NguoiDung_email").on(table.email),
    trangThaiIdx: index("IX_NguoiDung_trangThai").on(table.trangThai),
  }),
);
