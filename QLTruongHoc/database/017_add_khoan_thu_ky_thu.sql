-- ============================================================
-- QLTruongHoc
-- Sprint 5 - H01/H02: Danh muc khoan thu, Ky thu
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE DanhMucKhoanThu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maKhoanThu VARCHAR(50) NOT NULL,
  tenKhoanThu VARCHAR(255) NOT NULL,
  loaiKhoanThu ENUM('hoc_phi', 'tien_an', 'dich_vu', 'tai_lieu', 'khac') NOT NULL,
  soTienMacDinh DECIMAL(18,2) NULL,
  batBuoc ENUM('co', 'khong') NOT NULL DEFAULT 'co',
  trangThai ENUM('hoat_dong', 'ngung_ap_dung') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_DanhMucKhoanThu_donViId_ma (donViId, maKhoanThu),
  KEY IX_DanhMucKhoanThu_donViId (donViId),
  CONSTRAINT FK_DanhMucKhoanThu_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE KyThu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maKyThu VARCHAR(50) NOT NULL,
  tenKyThu VARCHAR(255) NOT NULL,
  loaiKy ENUM('thang', 'khoa_hoc', 'hoc_ky', 'dot') NOT NULL,
  tuNgay DATE NOT NULL,
  denNgay DATE NOT NULL,
  hanThanhToan DATE NULL,
  trangThai ENUM('nhap', 'da_mo', 'da_dong') NOT NULL DEFAULT 'nhap',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_KyThu_donViId_ma (donViId, maKyThu),
  KEY IX_KyThu_donViId (donViId),
  CONSTRAINT FK_KyThu_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE KyThuKhoanThu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kyThuId BIGINT UNSIGNED NOT NULL,
  danhMucKhoanThuId BIGINT UNSIGNED NOT NULL,
  soTien DECIMAL(18,2) NOT NULL,
  ghiChu VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_KyThuKhoanThu_kyThuId_danhMucId (kyThuId, danhMucKhoanThuId),
  KEY IX_KyThuKhoanThu_kyThuId (kyThuId),
  CONSTRAINT FK_KyThuKhoanThu_KyThu FOREIGN KEY (kyThuId) REFERENCES KyThu(id),
  CONSTRAINT FK_KyThuKhoanThu_DanhMuc FOREIGN KEY (danhMucKhoanThuId) REFERENCES DanhMucKhoanThu(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
