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

export const lead = mysqlTable(
  "Lead",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maLead: varchar("maLead", { length: 50 }).notNull(),
    hoTen: varchar("hoTen", { length: 255 }).notNull(),
    soDienThoai: varchar("soDienThoai", { length: 30 }).notNull(),
    email: varchar("email", { length: 255 }),
    nguon: mysqlEnum("nguon", [
      "gioi_thieu",
      "facebook",
      "website",
      "walk_in",
      "khac"
    ]).notNull().default("khac"),
    doTuoiHoacTrinhDo: varchar("doTuoiHoacTrinhDo", { length: 255 }),
    nhuCau: text("nhuCau"),
    tuVanVienId: bigint("tuVanVienId", { mode: "number", unsigned: true }),
    trangThai: mysqlEnum("trangThai", [
      "moi",
      "dang_cham_soc",
      "da_hen_lich",
      "da_hoc_thu",
      "da_dang_ky",
      "khong_tiep_tuc"
    ]).notNull().default("moi"),
    lyDoKhongTiepTuc: varchar("lyDoKhongTiepTuc", { length: 500 }),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    maLeadTheoDonViUq: uniqueIndex("UQ_Lead_donViId_maLead").on(
      table.donViId,
      table.maLead
    ),
    donViIdx: index("IX_Lead_donViId").on(table.donViId),
    trangThaiIdx: index("IX_Lead_donViId_trangThai").on(
      table.donViId,
      table.trangThai
    ),
    tuVanVienIdx: index("IX_Lead_tuVanVienId").on(table.tuVanVienId)
  })
);

export const leadHoatDong = mysqlTable(
  "LeadHoatDong",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    leadId: bigint("leadId", { mode: "number", unsigned: true }).notNull(),
    loaiHoatDong: mysqlEnum("loaiHoatDong", [
      "goi_dien",
      "gap_truc_tiep",
      "nhan_tin",
      "hen_lich",
      "hoc_thu",
      "khac"
    ]).notNull(),
    noiDung: text("noiDung").notNull(),
    ketQua: varchar("ketQua", { length: 500 }),
    nguoiThucHienId: bigint("nguoiThucHienId", { mode: "number", unsigned: true }).notNull(),
    thoiGian: datetime("thoiGian", { mode: "string" }).notNull(),
    // Trước 2026-07-27: mọi hoạt động (kể cả "hẹn lịch") chỉ là log quá khứ —
    // form không có ô chọn thời gian nên "hẹn lịch" thực chất chỉ ghi lại
    // NGAY LÚC TẠO, không đặt được lịch tương lai, không có khái niệm "đã
    // thực hiện/đã huỷ". Thêm `trangThai` để "hẹn lịch" hoạt động như task
    // thật: tạo ở `cho_xu_ly` khi đặt lịch tương lai, chuyển `da_xu_ly`/
    // `da_huy` sau khi tư vấn viên xử lý. Các loại hoạt động khác (gọi điện,
    // nhắn tin...) vốn đã là log việc ĐÃ XẢY RA nên tạo thẳng `da_xu_ly`,
    // không cần luồng task.
    trangThai: mysqlEnum("trangThai", ["cho_xu_ly", "da_xu_ly", "da_huy"])
      .notNull()
      .default("da_xu_ly"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull()
  },
  (table) => ({
    leadIdx: index("IX_LeadHoatDong_leadId").on(table.leadId),
    thoiGianIdx: index("IX_LeadHoatDong_leadId_thoiGian").on(
      table.leadId,
      table.thoiGian
    ),
    trangThaiThoiGianIdx: index("IX_LeadHoatDong_trangThai_thoiGian").on(
      table.trangThai,
      table.thoiGian
    )
  })
);
