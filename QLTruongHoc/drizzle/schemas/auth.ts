import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const vaiTro = mysqlTable(
  "VaiTro",
  {
    id: int("id", { unsigned: true })
      .autoincrement()
      .primaryKey(),

    maVaiTro: varchar("maVaiTro", { length: 60 }).notNull(),
    tenVaiTro: varchar("tenVaiTro", { length: 150 }).notNull(),
    moTa: varchar("moTa", { length: 500 }),

    phamVi: mysqlEnum("phamVi", [
      "he_thong",
      "don_vi",
      "cong_thong_tin",
    ])
      .notNull()
      .default("don_vi"),

    laVaiTroHeThong: boolean("laVaiTroHeThong")
      .notNull()
      .default(true),

    dangHoatDong: boolean("dangHoatDong")
      .notNull()
      .default(true),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maVaiTroUq: uniqueIndex("UQ_VaiTro_maVaiTro").on(table.maVaiTro),
    phamViIdx: index("IX_VaiTro_phamVi").on(table.phamVi),
  }),
);

export const quyen = mysqlTable(
  "Quyen",
  {
    id: int("id", { unsigned: true })
      .autoincrement()
      .primaryKey(),

    maQuyen: varchar("maQuyen", { length: 100 }).notNull(),
    tenQuyen: varchar("tenQuyen", { length: 180 }).notNull(),
    nhomQuyen: varchar("nhomQuyen", { length: 100 }).notNull(),
    moTa: varchar("moTa", { length: 500 }),

    dangHoatDong: boolean("dangHoatDong")
      .notNull()
      .default(true),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maQuyenUq: uniqueIndex("UQ_Quyen_maQuyen").on(table.maQuyen),
    nhomQuyenIdx: index("IX_Quyen_nhomQuyen").on(table.nhomQuyen),
  }),
);

export const vaiTroQuyen = mysqlTable(
  "VaiTroQuyen",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    vaiTroId: int("vaiTroId", { unsigned: true }).notNull(),
    quyenId: int("quyenId", { unsigned: true }).notNull(),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    vaiTroQuyenUq: uniqueIndex("UQ_VaiTroQuyen").on(
      table.vaiTroId,
      table.quyenId,
    ),
    vaiTroIdx: index("IX_VaiTroQuyen_vaiTroId").on(table.vaiTroId),
    quyenIdx: index("IX_VaiTroQuyen_quyenId").on(table.quyenId),
  }),
);

export const nguoiDungVaiTroDonVi = mysqlTable(
  "NguoiDungVaiTroDonVi",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    nguoiDungId: bigint("nguoiDungId", {
      mode: "number",
      unsigned: true,
    }).notNull(),

    vaiTroId: int("vaiTroId", { unsigned: true }).notNull(),

    donViId: bigint("donViId", {
      mode: "number",
      unsigned: true,
    }).notNull(),

    dangHoatDong: boolean("dangHoatDong")
      .notNull()
      .default(true),

    tuNgay: datetime("tuNgay", { mode: "string" }),
    denNgay: datetime("denNgay", { mode: "string" }),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    phanQuyenUq: uniqueIndex("UQ_NguoiDungVaiTroDonVi").on(
      table.nguoiDungId,
      table.vaiTroId,
      table.donViId,
    ),
    nguoiDungIdx: index("IX_NguoiDungVaiTroDonVi_nguoiDungId").on(
      table.nguoiDungId,
    ),
    donViIdx: index("IX_NguoiDungVaiTroDonVi_donViId").on(
      table.donViId,
    ),
    vaiTroIdx: index("IX_NguoiDungVaiTroDonVi_vaiTroId").on(
      table.vaiTroId,
    ),
  }),
);

export const phienDangNhap = mysqlTable(
  "PhienDangNhap",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    nguoiDungId: bigint("nguoiDungId", {
      mode: "number",
      unsigned: true,
    }).notNull(),

    donViHienTaiId: bigint("donViHienTaiId", {
      mode: "number",
      unsigned: true,
    }),

    maPhienHash: varchar("maPhienHash", { length: 255 }).notNull(),

    diaChiIp: varchar("diaChiIp", { length: 80 }),
    userAgent: varchar("userAgent", { length: 500 }),

    hetHanLuc: datetime("hetHanLuc", { mode: "string" }).notNull(),
    huyLuc: datetime("huyLuc", { mode: "string" }),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maPhienHashUq: uniqueIndex("UQ_PhienDangNhap_maPhienHash").on(
      table.maPhienHash,
    ),
    nguoiDungIdx: index("IX_PhienDangNhap_nguoiDungId").on(
      table.nguoiDungId,
    ),
    hetHanIdx: index("IX_PhienDangNhap_hetHanLuc").on(table.hetHanLuc),
  }),
);

export const nhatKyHeThong = mysqlTable(
  "NhatKyHeThong",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    nguoiDungId: bigint("nguoiDungId", {
      mode: "number",
      unsigned: true,
    }),

    donViId: bigint("donViId", {
      mode: "number",
      unsigned: true,
    }),

    hanhDong: varchar("hanhDong", { length: 120 }).notNull(),
    doiTuong: varchar("doiTuong", { length: 120 }),
    doiTuongId: varchar("doiTuongId", { length: 80 }),

    noiDung: text("noiDung"),
    duLieu: json("duLieu"),

    mucDo: mysqlEnum("mucDo", [
      "thong_tin",
      "canh_bao",
      "loi",
    ])
      .notNull()
      .default("thong_tin"),

    diaChiIp: varchar("diaChiIp", { length: 80 }),

    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    nguoiDungIdx: index("IX_NhatKyHeThong_nguoiDungId").on(
      table.nguoiDungId,
    ),
    donViIdx: index("IX_NhatKyHeThong_donViId").on(table.donViId),
    hanhDongIdx: index("IX_NhatKyHeThong_hanhDong").on(table.hanhDong),
    createdAtIdx: index("IX_NhatKyHeThong_createdAt").on(
      table.createdAt,
    ),
  }),
);
