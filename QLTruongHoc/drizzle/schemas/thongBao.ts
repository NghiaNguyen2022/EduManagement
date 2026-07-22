import {
  bigint,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const thongBao = mysqlTable(
  "ThongBao",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maThongBao: varchar("maThongBao", { length: 50 }).notNull(),
    tieuDe: varchar("tieuDe", { length: 255 }).notNull(),
    noiDung: text("noiDung").notNull(),
    tepDinhKemTen: varchar("tepDinhKemTen", { length: 255 }),
    tepDinhKemUrl: text("tepDinhKemUrl"),
    phamVi: mysqlEnum("phamVi", ["toan_truong", "theo_lop", "ca_nhan"])
      .notNull()
      .default("toan_truong"),
    doiTuong: varchar("doiTuong", { length: 255 }),
    nguoiTaoId: bigint("nguoiTaoId", { mode: "number", unsigned: true }).notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maThongBaoTheoDonViUq: uniqueIndex("UQ_ThongBao_donViId_maThongBao").on(
      table.donViId,
      table.maThongBao,
    ),
    donViIdx: index("IX_ThongBao_donViId").on(table.donViId),
    phamViIdx: index("IX_ThongBao_donViId_phamVi").on(table.donViId, table.phamVi),
    nguoiTaoIdx: index("IX_ThongBao_nguoiTaoId").on(table.nguoiTaoId),
  }),
);

export const thongBaoDaDoc = mysqlTable(
  "ThongBaoDaDoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    thongBaoId: bigint("thongBaoId", { mode: "number", unsigned: true }).notNull(),
    nguoiDungId: bigint("nguoiDungId", { mode: "number", unsigned: true }).notNull(),
    daDocAt: datetime("daDocAt", { mode: "string" }).notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    uniqueThongBaoNguoiDung: uniqueIndex("UQ_ThongBaoDaDoc_thongBaoId_nguoiDungId").on(
      table.thongBaoId,
      table.nguoiDungId,
    ),
    thongBaoIdx: index("IX_ThongBaoDaDoc_thongBaoId").on(table.thongBaoId),
    nguoiDungIdx: index("IX_ThongBaoDaDoc_nguoiDungId").on(table.nguoiDungId),
  }),
);
