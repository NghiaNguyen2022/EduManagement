import {
  bigint,
  boolean,
  date,
  datetime,
  decimal,
  index,
  mysqlEnum,
  mysqlTable,
  text,
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
    // Ảnh chân dung — dùng chung cơ chế `/api/upload` (đã có cho DonVi/NguoiDung).
    hinhAnhUrl: varchar("hinhAnhUrl", { length: 500 }),
    ngaySinh: date("ngaySinh", { mode: "string" }),
    gioiTinh: mysqlEnum("gioiTinh", ["nam", "nu", "khac"]),
    // Định danh chuẩn sổ đăng bộ học sinh.
    soDinhDanh: varchar("soDinhDanh", { length: 50 }),
    noiSinh: varchar("noiSinh", { length: 255 }),
    danToc: varchar("danToc", { length: 100 }),
    quocTich: varchar("quocTich", { length: 100 }),
    diaChi: varchar("diaChi", { length: 500 }),
    truongLopTruocDo: varchar("truongLopTruocDo", { length: 255 }),
    ngayNhapHoc: date("ngayNhapHoc", { mode: "string" }),
    // Diện chính sách/ưu tiên (hộ nghèo, dân tộc thiểu số, con TBLS...) — text
    // tự do, dùng làm căn cứ miễn giảm học phí sau này, không phải enum cứng
    // vì thực tế có nhiều tổ hợp diện khác nhau.
    dienChinhSach: varchar("dienChinhSach", { length: 255 }),
    // Sức khoẻ + liên hệ khẩn cấp — quan trọng nhất với mầm non nhưng để mở
    // cho mọi loại hình, không bắt buộc.
    chieuCaoCm: decimal("chieuCaoCm", { precision: 5, scale: 1 }),
    canNangKg: decimal("canNangKg", { precision: 5, scale: 1 }),
    diUngBenhNen: text("diUngBenhNen"),
    lienHeKhanCapHoTen: varchar("lienHeKhanCapHoTen", { length: 255 }),
    lienHeKhanCapSdt: varchar("lienHeKhanCapSdt", { length: 30 }),
    // Ghi chú ngữ cảnh cho học vụ khi xếp lớp — không phải trạng thái/luồng
    // duyệt. `nguyenVongLop` carry từ Lead.nhuCau lúc xác nhận đăng ký (trung
    // tâm) hoặc để trống (mầm non xếp theo tuổi, không cần nguyện vọng).
    // `ketQuaTestDauVao` do học vụ tự ghi lúc xếp lớp nếu chương trình yêu
    // cầu test đầu vào. Xem docs/analysis/TUYEN_SINH_THEO_LOAI_HINH.md.
    nguyenVongLop: text("nguyenVongLop"),
    ketQuaTestDauVao: text("ketQuaTestDauVao"),
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

// Phiếu xác nhận nhập học — lập khi tiếp nhận học sinh (có thể lập lại nếu
// thất lạc bản gốc, không giới hạn số lần). Mỗi lần lập là 1 bản ghi bất
// biến, có số phiếu riêng — xem lại/in lại chỉ đọc bản ghi cũ.
export const phieuNhapHoc = mysqlTable(
  "PhieuNhapHoc",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    donViId: bigint("donViId", { mode: "number", unsigned: true }).notNull(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    soPhieu: varchar("soPhieu", { length: 50 }).notNull(),
    ngayNhapHoc: date("ngayNhapHoc", { mode: "string" }).notNull(),
    nguoiLapId: bigint("nguoiLapId", { mode: "number", unsigned: true }).notNull(),
    ghiChu: varchar("ghiChu", { length: 500 }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  },
  (table) => ({
    donViSoPhieuUq: uniqueIndex("UQ_PhieuNhapHoc_donViId_soPhieu").on(
      table.donViId,
      table.soPhieu,
    ),
    hocSinhIdx: index("IX_PhieuNhapHoc_hocSinhId").on(table.hocSinhId),
  }),
);

// Chứng chỉ/thành tích học sinh đạt được (vd IELTS 8.0) — không gắn với 1
// lượt xếp lớp cụ thể, không có workflow duyệt (ghi là hiển thị ngay).
export const hocSinhThanhTich = mysqlTable(
  "HocSinhThanhTich",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    hocSinhId: bigint("hocSinhId", { mode: "number", unsigned: true }).notNull(),
    tenThanhTich: varchar("tenThanhTich", { length: 255 }).notNull(),
    ketQua: varchar("ketQua", { length: 100 }),
    ngayDat: date("ngayDat", { mode: "string" }),
    noiCap: varchar("noiCap", { length: 255 }),
    tepMinhChungUrl: varchar("tepMinhChungUrl", { length: 500 }),
    ghiChu: text("ghiChu"),
    actorUserId: bigint("actorUserId", { mode: "number", unsigned: true }),
    createdAt: datetime("createdAt", { mode: "string" }).notNull(),
    updatedAt: datetime("updatedAt", { mode: "string" }).notNull()
  },
  (table) => ({
    hocSinhIdx: index("IX_HocSinhThanhTich_hocSinhId").on(table.hocSinhId)
  })
);
