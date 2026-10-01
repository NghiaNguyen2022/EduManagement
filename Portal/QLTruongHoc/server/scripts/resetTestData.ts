import mysql from "mysql2/promise";

import { env } from "../config/env.js";

// Xoa toan bo du lieu nghiep vu de test lai tu dau, GIU LAI:
// - Cau truc don vi (DonVi), vai tro/quyen he thong (VaiTro/Quyen/VaiTroQuyen)
// - Duy nhat tai khoan "admin" (NguoiDung + NguoiDungVaiTroDonVi cua admin)
// Xoa het: hoc sinh, phu huynh, giao vien, lop hoc, lich hoc, diem danh,
// danh gia, thanh tich, tai chinh, tuyen sinh, thong bao, trao doi, xin phep,
// nhat ky he thong, phien dang nhap, va moi NguoiDung khac ngoai admin.

const TABLES_TO_TRUNCATE = [
  "DonXinPhep",
  "LeadHoatDong",
  "Lead",
  "TraoDoiHocSinh",
  "ThongBaoSuKien",
  "ThongBaoDaDoc",
  "ThongBao",
  "ChiPhi",
  "DanhMucChiPhi",
  "DieuChinhKhoanPhaiThu",
  "PhieuThu",
  "KhoanPhaiThuChiTiet",
  "KhoanPhaiThu",
  "KyThuKhoanThu",
  "KyThu",
  "DanhMucKhoanThu",
  "CauHinhTaiChinhDonVi",
  "HocSinhLopHocDanhGia",
  "HocSinhLopHoc",
  "BuoiHoc",
  "LichHoc",
  "LopHocGiaoVien",
  "LopHoc",
  "ChuongTrinhDaoTao",
  "GiaoVien",
  "HocSinhThanhTich",
  "HocSinhPhuHuynh",
  "PhuHuynh",
  "HocSinhTrangThaiLichSu",
  "HocSinh",
  "BaoGiang",
  "DiemDanh",
  "NhatKyHeThong",
  "PhienDangNhap",
];

async function main() {
  const connection = await mysql.createConnection({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    charset: "utf8mb4",
    multipleStatements: true,
  });

  try {
    const [adminRows] = await connection.query(
      "SELECT id FROM NguoiDung WHERE tenDangNhap = 'admin' LIMIT 1",
    );
    const admin = (adminRows as Array<{ id: number }>)[0];

    if (!admin) {
      throw new Error(
        "Khong tim thay tai khoan 'admin'. Dung lai de tranh xoa nham khi chua co admin.",
      );
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Dung DELETE thay vi TRUNCATE: user app khong co quyen DROP/TRUNCATE,
    // chi co DELETE. AUTO_INCREMENT khong reset ve 0 nhung khong anh huong
    // nghiep vu (ma nghiep vu sinh theo prefix + so thu tu, khong dua vao id).
    for (const table of TABLES_TO_TRUNCATE) {
      await connection.query(`DELETE FROM \`${table}\``);
      console.log(`Da xoa: ${table}`);
    }

    await connection.query(
      "DELETE FROM NguoiDungVaiTroDonVi WHERE nguoiDungId <> ?",
      [admin.id],
    );
    await connection.query("DELETE FROM NguoiDung WHERE id <> ?", [
      admin.id,
    ]);

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log(
      `Hoan tat. Giu lai DonVi, VaiTro/Quyen, va tai khoan admin (id=${admin.id}).`,
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Reset du lieu test that bai:", error);
  process.exitCode = 1;
});
