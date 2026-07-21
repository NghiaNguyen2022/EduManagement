import {
  bigint,
  boolean,
  date,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const hocSinh = mysqlTable(
  "HocSinh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maHocSinh: varchar("maHocSinh", { length: 50 }).notNull(),
    hoTen: varchar("hoTen", { length: 255 }).notNull(),
    tenThuongGoi: varchar("tenThuongGoi", { length: 100 }),
    ngaySinh: date("ngaySinh", { mode: "string" }),
    gioiTinh: mysqlEnum("gioiTinh", ["nam", "nu", "khac"]),
    diaChi: varchar("diaChi", { length: 500 }),
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

export const hocSinhTrangThaiLichSu = mysqlTable(
  "HocSinhTrangThaiLichSu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    trangThaiCu: mysqlEnum("trangThaiCu", [
      "tiep_nhan",
      "dang_hoc",
      "bao_luu",
      "ngung_hoc",
      "hoan_thanh"
    ]),
    trangThaiMoi: mysqlEnum("trangThaiMoi", [
      "tiep_nhan",
      "dang_hoc",
      "bao_luu",
      "ngung_hoc",
      "hoan_thanh"
    ]).notNull(),
    lyDo: varchar("lyDo", { length: 500 }),
    ngayHieuLuc: date("ngayHieuLuc", { mode: "string" }).notNull(),
    actorUserId: bigint("actorUserId", { mode: "number", unsigned: true }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull()
  },
  (table) => ({
    hocSinhIdx: index("IX_HocSinhTrangThaiLichSu_hocSinhId").on(table.hocSinhId)
  })
);

export const phuHuynh = mysqlTable(
  "PhuHuynh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    nguoiDungId: bigint("nguoiDungId", { mode: "number", unsigned: true }),
    maPhuHuynh: varchar("maPhuHuynh", { length: 50 }).notNull(),
    hoTen: varchar("hoTen", { length: 255 }).notNull(),
    ngaySinh: date("ngaySinh", { mode: "string" }),
    gioiTinh: mysqlEnum("gioiTinh", ["nam", "nu", "khac"]),
    dienThoai: varchar("dienThoai", { length: 30 }).notNull(),
    email: varchar("email", { length: 255 }),
    ngheNghiep: varchar("ngheNghiep", { length: 255 }),
    diaChi: varchar("diaChi", { length: 500 }),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_hoat_dong"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maPhuHuynhTheoDonViUq: uniqueIndex("UQ_PhuHuynh_donViId_maPhuHuynh").on(
      table.donViId,
      table.maPhuHuynh
    ),
    donViIdx: index("IX_PhuHuynh_donViId").on(table.donViId),
    dienThoaiIdx: index("IX_PhuHuynh_donViId_dienThoai").on(
      table.donViId,
      table.dienThoai
    )
  })
);

export const hocSinhPhuHuynh = mysqlTable(
  "HocSinhPhuHuynh",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    phuHuynhId: bigint("phuHuynhId", { mode: "number", unsigned: true }).notNull(),
    moiQuanHe: mysqlEnum("moiQuanHe", [
      "cha",
      "me",
      "ong",
      "ba",
      "nguoi_giam_ho",
      "khac"
    ]).notNull(),
    laLienHeChinh: boolean("laLienHeChinh").notNull().default(false),
    duocDonTre: boolean("duocDonTre").notNull().default(true),
    nhanThongBao: boolean("nhanThongBao").notNull().default(true),
    nhanThongTinHocPhi: boolean("nhanThongTinHocPhi").notNull().default(true),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    hocSinhPhuHuynhUq: uniqueIndex("UQ_HocSinhPhuHuynh").on(
      table.hocSinhId,
      table.phuHuynhId
    ),
    hocSinhIdx: index("IX_HocSinhPhuHuynh_hocSinhId").on(table.hocSinhId),
    phuHuynhIdx: index("IX_HocSinhPhuHuynh_phuHuynhId").on(table.phuHuynhId)
  })
);
