import {
  bigint,
  datetime,
  int,
  mysqlTable,
  tinyint,
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
