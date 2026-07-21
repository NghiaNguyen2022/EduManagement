import {
  bigint,
  date,
  datetime,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const chuongTrinhDaoTao = mysqlTable(
  "ChuongTrinhDaoTao",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maChuongTrinh: varchar("maChuongTrinh", { length: 50 }).notNull(),
    tenChuongTrinh: varchar("tenChuongTrinh", { length: 255 }).notNull(),
    capDo: varchar("capDo", { length: 100 }),
    tongSoBuoi: int("tongSoBuoi"),
    tongSoGio: decimal("tongSoGio", { precision: 10, scale: 2 }),
    moTa: text("moTa"),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_hoat_dong"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maCTTheoDonViUq: uniqueIndex("UQ_ChuongTrinhDaoTao_donViId_ma").on(
      table.donViId,
      table.maChuongTrinh
    ),
    donViIdx: index("IX_ChuongTrinhDaoTao_donViId").on(table.donViId)
  })
);

export const giaoVien = mysqlTable(
  "GiaoVien",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    nguoiDungId: bigint("nguoiDungId", { mode: "number", unsigned: true }),
    maGiaoVien: varchar("maGiaoVien", { length: 50 }).notNull(),
    hoTen: varchar("hoTen", { length: 255 }).notNull(),
    dienThoai: varchar("dienThoai", { length: 30 }),
    email: varchar("email", { length: 255 }),
    chuyenMon: varchar("chuyenMon", { length: 255 }),
    trinhDo: varchar("trinhDo", { length: 255 }),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_hoat_dong"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maGVTheoDonViUq: uniqueIndex("UQ_GiaoVien_donViId_ma").on(
      table.donViId,
      table.maGiaoVien
    ),
    donViIdx: index("IX_GiaoVien_donViId").on(table.donViId)
  })
);

export const lopHoc = mysqlTable(
  "LopHoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    chuongTrinhDaoTaoId: bigint("chuongTrinhDaoTaoId", { mode: "number", unsigned: true }),
    maLop: varchar("maLop", { length: 50 }).notNull(),
    tenLop: varchar("tenLop", { length: 255 }).notNull(),
    capDo: varchar("capDo", { length: 100 }),
    ngayBatDau: date("ngayBatDau", { mode: "string" }),
    ngayKetThuc: date("ngayKetThuc", { mode: "string" }),
    siSoToiDa: int("siSoToiDa"),
    phongHoc: varchar("phongHoc", { length: 100 }),
    trangThai: mysqlEnum("trangThai", [
      "chuan_bi",
      "dang_hoc",
      "tam_dung",
      "ket_thuc",
      "huy"
    ]).notNull().default("chuan_bi"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maLopTheoDonViUq: uniqueIndex("UQ_LopHoc_donViId_ma").on(
      table.donViId,
      table.maLop
    ),
    donViIdx: index("IX_LopHoc_donViId").on(table.donViId),
    trangThaiIdx: index("IX_LopHoc_donViId_trangThai").on(
      table.donViId,
      table.trangThai
    )
  })
);

export const lopHocGiaoVien = mysqlTable(
  "LopHocGiaoVien",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }).notNull(),
    giaoVienId: bigint("giaoVienId", { mode: "number", unsigned: true }).notNull(),
    vaiTro: mysqlEnum("vaiTro", [
      "giao_vien_chinh",
      "ho_tro",
      "chu_nhiem"
    ]).notNull().default("giao_vien_chinh"),
    tuNgay: date("tuNgay", { mode: "string" }).notNull(),
    denNgay: date("denNgay", { mode: "string" }),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_hoat_dong"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    lopHocIdx: index("IX_LopHocGiaoVien_lopHocId").on(table.lopHocId),
    giaoVienIdx: index("IX_LopHocGiaoVien_giaoVienId").on(table.giaoVienId)
  })
);

export const hocSinhLopHoc = mysqlTable(
  "HocSinhLopHoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    lopHocId: bigint("lopHocId", { mode: "number", unsigned: true }).notNull(),
    ngayVaoLop: date("ngayVaoLop", { mode: "string" }).notNull(),
    ngayRoiLop: date("ngayRoiLop", { mode: "string" }),
    lyDoRoiLop: varchar("lyDoRoiLop", { length: 500 }),
    trangThai: mysqlEnum("trangThai", [
      "dang_hoc",
      "bao_luu",
      "chuyen_lop",
      "ngung_hoc",
      "hoan_thanh"
    ]).notNull().default("dang_hoc"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    hocSinhIdx: index("IX_HocSinhLopHoc_hocSinhId_trangThai").on(
      table.hocSinhId,
      table.trangThai
    ),
    lopHocIdx: index("IX_HocSinhLopHoc_lopHocId_trangThai").on(
      table.lopHocId,
      table.trangThai
    )
  })
);
