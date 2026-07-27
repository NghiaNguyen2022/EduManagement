import {
  bigint,
  boolean,
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
      "khac",
    ]).notNull(),
    soTienMacDinh: decimal("soTienMacDinh", { precision: 18, scale: 2 }),
    batBuoc: mysqlEnum("batBuoc", ["co", "khong"]).notNull().default("co"),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_ap_dung"])
      .notNull()
      .default("hoat_dong"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maTheoDonViUq: uniqueIndex("UQ_DanhMucKhoanThu_donViId_ma").on(table.donViId, table.maKhoanThu),
    donViIdx: index("IX_DanhMucKhoanThu_donViId").on(table.donViId),
  }),
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
    trangThai: mysqlEnum("trangThai", ["nhap", "da_mo", "da_dong"]).notNull().default("nhap"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maTheoDonViUq: uniqueIndex("UQ_KyThu_donViId_ma").on(table.donViId, table.maKyThu),
    donViIdx: index("IX_KyThu_donViId").on(table.donViId),
  }),
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
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    kyThuKhoanThuUq: uniqueIndex("UQ_KyThuKhoanThu_kyThuId_danhMucId").on(
      table.kyThuId,
      table.danhMucKhoanThuId,
    ),
    kyThuIdx: index("IX_KyThuKhoanThu_kyThuId").on(table.kyThuId),
  }),
);

export const khoanPhaiThu = mysqlTable(
  "KhoanPhaiThu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    kyThuId: bigint("kyThuId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    tongTien: decimal("tongTien", { precision: 18, scale: 2 }).notNull(),
    giamTru: decimal("giamTru", { precision: 18, scale: 2 }).notNull().default("0.00"),
    daThu: decimal("daThu", { precision: 18, scale: 2 }).notNull().default("0.00"),
    trangThai: mysqlEnum("trangThai", ["chua_thu", "thu_mot_phan", "da_thu_du"])
      .notNull()
      .default("chua_thu"),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    kyThuHocSinhUq: uniqueIndex("UQ_KhoanPhaiThu_kyThuId_hocSinhId").on(
      table.kyThuId,
      table.hocSinhId,
    ),
    donViTrangThaiIdx: index("IX_KhoanPhaiThu_donViId_trangThai").on(
      table.donViId,
      table.trangThai,
    ),
    hocSinhIdx: index("IX_KhoanPhaiThu_hocSinhId").on(table.hocSinhId),
  }),
);

export const khoanPhaiThuChiTiet = mysqlTable(
  "KhoanPhaiThuChiTiet",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    khoanPhaiThuId: bigint("khoanPhaiThuId", { mode: "number", unsigned: true }).notNull(),
    danhMucKhoanThuId: bigint("danhMucKhoanThuId", { mode: "number", unsigned: true }).notNull(),
    soTien: decimal("soTien", { precision: 18, scale: 2 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    khoanPhaiThuUq: uniqueIndex("UQ_KhoanPhaiThuChiTiet_kpt_danhMuc").on(
      table.khoanPhaiThuId,
      table.danhMucKhoanThuId,
    ),
    khoanPhaiThuIdx: index("IX_KhoanPhaiThuChiTiet_khoanPhaiThuId").on(table.khoanPhaiThuId),
  }),
);

export const phieuThu = mysqlTable(
  "PhieuThu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    khoanPhaiThuId: bigint("khoanPhaiThuId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    soPhieu: varchar("soPhieu", { length: 50 }).notNull(),
    soTien: decimal("soTien", { precision: 18, scale: 2 }).notNull(),
    phuongThuc: mysqlEnum("phuongThuc", ["tien_mat", "chuyen_khoan", "the", "khac"]).notNull(),
    ghiChu: varchar("ghiChu", { length: 500 }),
    nguoiThuId: bigint("nguoiThuId", { mode: "number", unsigned: true }).notNull(),
    ngayThu: datetime("ngayThu", { mode: "string" }).notNull(),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViSoPhieuUq: uniqueIndex("UQ_PhieuThu_donViId_soPhieu").on(table.donViId, table.soPhieu),
    khoanPhaiThuIdx: index("IX_PhieuThu_khoanPhaiThuId").on(table.khoanPhaiThuId),
    hocSinhIdx: index("IX_PhieuThu_hocSinhId").on(table.hocSinhId),
  }),
);

/** H08 — Hoàn phí/chuyển phí/bảo lưu. Là YÊU CẦU ĐIỀU CHỈNH, có bước duyệt trước khi tác động lên KhoanPhaiThu. */
export const dieuChinhKhoanPhaiThu = mysqlTable(
  "DieuChinhKhoanPhaiThu",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    khoanPhaiThuId: bigint("khoanPhaiThuId", { mode: "number", unsigned: true }).notNull(),
    khoanPhaiThuDichId: bigint("khoanPhaiThuDichId", { mode: "number", unsigned: true }),
    loaiDieuChinh: mysqlEnum("loaiDieuChinh", ["hoan_phi", "chuyen_phi", "bao_luu"]).notNull(),
    soTien: decimal("soTien", { precision: 18, scale: 2 }).notNull().default("0.00"),
    lyDo: varchar("lyDo", { length: 500 }).notNull(),
    trangThai: mysqlEnum("trangThai", ["cho_duyet", "da_duyet", "tu_choi"])
      .notNull()
      .default("cho_duyet"),
    nguoiTaoId: bigint("nguoiTaoId", { mode: "number", unsigned: true }).notNull(),
    nguoiDuyetId: bigint("nguoiDuyetId", { mode: "number", unsigned: true }),
    ghiChuDuyet: varchar("ghiChuDuyet", { length: 500 }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    duyetAt: datetime("duyetAt", { mode: "string" }),
  },
  (table) => ({
    khoanPhaiThuIdx: index("IX_DieuChinhKhoanPhaiThu_khoanPhaiThuId").on(table.khoanPhaiThuId),
    donViTrangThaiIdx: index("IX_DieuChinhKhoanPhaiThu_donViId_trangThai").on(
      table.donViId,
      table.trangThai,
    ),
  }),
);

// ---------------------------------------------------------------
// Chi phí — ghi nhận trực tiếp (giống Phiếu thu: đã xảy ra, không cần
// bước duyệt riêng trước khi ghi nhận), khác H08 (yêu cầu điều chỉnh có
// duyệt) vì chi phí không đảo ngược một khoản thu đã có.
// ---------------------------------------------------------------

export const danhMucChiPhi = mysqlTable(
  "DanhMucChiPhi",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    maChiPhi: varchar("maChiPhi", { length: 50 }).notNull(),
    tenChiPhi: varchar("tenChiPhi", { length: 255 }).notNull(),
    loaiChiPhi: mysqlEnum("loaiChiPhi", [
      "luong",
      "mat_bang",
      "dien_nuoc",
      "vat_tu",
      "marketing",
      "khac",
    ]).notNull(),
    trangThai: mysqlEnum("trangThai", ["hoat_dong", "ngung_ap_dung"])
      .notNull()
      .default("hoat_dong"),
    // 2026-07-27: quản lý đơn vị có thể cấu hình (CauHinhDonVi.duyetDanhMucChiPhi)
    // yêu cầu duyệt trước khi một danh mục mới dùng được — tách riêng khỏi
    // `trangThai` (bật/tắt sử dụng) vì đây là 2 trục khác nhau: một danh mục
    // "hoat_dong" vẫn có thể đang "cho_duyet" (chưa dùng được) nếu đơn vị bật
    // cấu hình yêu cầu duyệt.
    trangThaiDuyet: mysqlEnum("trangThaiDuyet", [
      "khong_can_duyet",
      "cho_duyet",
      "da_duyet",
      "tu_choi",
    ])
      .notNull()
      .default("khong_can_duyet"),
    nguoiTaoId: bigint("nguoiTaoId", { mode: "number", unsigned: true }),
    nguoiDuyetId: bigint("nguoiDuyetId", { mode: "number", unsigned: true }),
    ghiChuDuyet: varchar("ghiChuDuyet", { length: 500 }),
    duyetAt: datetime("duyetAt", { mode: "string" }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    maTheoDonViUq: uniqueIndex("UQ_DanhMucChiPhi_donViId_ma").on(table.donViId, table.maChiPhi),
    donViIdx: index("IX_DanhMucChiPhi_donViId").on(table.donViId),
    trangThaiDuyetIdx: index("IX_DanhMucChiPhi_donViId_trangThaiDuyet").on(
      table.donViId,
      table.trangThaiDuyet,
    ),
  }),
);

export const chiPhi = mysqlTable(
  "ChiPhi",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    danhMucChiPhiId: bigint("danhMucChiPhiId", { mode: "number", unsigned: true }).notNull(),
    soTien: decimal("soTien", { precision: 18, scale: 2 }).notNull(),
    ngayChi: date("ngayChi", { mode: "string" }).notNull(),
    moTa: varchar("moTa", { length: 500 }),
    // "Định kỳ" (chi phí vận hành đều đặn, VD lương/mặt bằng) vs "đột xuất"
    // (phát sinh ngoài kế hoạch) — không phải luồng riêng, chỉ là nhãn để
    // đơn vị cấu hình yêu cầu duyệt khác nhau cho từng loại
    // (CauHinhDonVi.duyetChiDinhKy/duyetChiDotXuat) và để báo cáo phân loại.
    loaiDeXuat: mysqlEnum("loaiDeXuat", ["dinh_ky", "dot_xuat"]).notNull().default("dinh_ky"),
    // Trước 2026-07-27: ghi nhận trực tiếp, không qua duyệt (chi phí đã xảy
    // ra, khác H08 vì không đảo ngược một khoản thu đã có — xem lịch sử
    // quyết định trong docs/analysis/QUAN_LY_DON_VI_UX_VONG_2.md mục 3.2).
    // Đảo lại quyết định đó theo phản hồi người dùng: chi phí (dịch vụ, mua
    // sắm...) là tiền CHI RA nên cần duyệt TRƯỚC khi ghi nhận, không liên
    // quan gì tới việc "đảo ngược khoản thu" — đó là lý do không còn đúng.
    // Cấu trúc duyệt tái dùng đúng khuôn `DieuChinhKhoanPhaiThu` (H08): tạo ở
    // trạng thái chờ duyệt, một actor KHÁC có `tai_chinh.duyet` mới duyệt được.
    trangThai: mysqlEnum("trangThai", ["cho_duyet", "da_duyet", "tu_choi"])
      .notNull()
      .default("cho_duyet"),
    nguoiTaoId: bigint("nguoiTaoId", { mode: "number", unsigned: true }).notNull(),
    nguoiDuyetId: bigint("nguoiDuyetId", { mode: "number", unsigned: true }),
    ghiChuDuyet: varchar("ghiChuDuyet", { length: 500 }),
    duyetAt: datetime("duyetAt", { mode: "string" }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViNgayIdx: index("IX_ChiPhi_donViId_ngayChi").on(table.donViId, table.ngayChi),
    danhMucIdx: index("IX_ChiPhi_danhMucChiPhiId").on(table.danhMucChiPhiId),
    donViTrangThaiIdx: index("IX_ChiPhi_donViId_trangThai").on(table.donViId, table.trangThai),
  }),
);

/**
 * Cấu hình duyệt chi theo từng đơn vị — quản lý đơn vị/quản trị hệ thống bật
 * tắt riêng cho 3 phần (danh mục chi phí, đề xuất chi định kỳ, đề xuất chi
 * đột xuất), cho phép kế toán thao tác không cần duyệt khi đơn vị đã tin
 * tưởng. Mặc định TRUE (cần duyệt) — khớp hành vi đang có sẵn, đơn vị tự nới
 * lỏng khi cần, không đổi mặc định cho đơn vị chưa cấu hình.
 */
export const cauHinhTaiChinhDonVi = mysqlTable(
  "CauHinhTaiChinhDonVi",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    duyetDanhMucChiPhi: boolean("duyetDanhMucChiPhi").notNull().default(true),
    duyetChiDinhKy: boolean("duyetChiDinhKy").notNull().default(true),
    duyetChiDotXuat: boolean("duyetChiDotXuat").notNull().default(true),
    capNhatBoiId: bigint("capNhatBoiId", { mode: "number", unsigned: true }),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViUq: uniqueIndex("UQ_CauHinhTaiChinhDonVi_donViId").on(table.donViId),
  }),
);
