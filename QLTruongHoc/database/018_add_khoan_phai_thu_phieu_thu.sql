-- ============================================================
-- QLTruongHoc
-- Sprint 5 - H03/H04/H05/H06/H07: Khoan phai thu, mien giam, thu tien, cong no, bien nhan
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE KhoanPhaiThu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  kyThuId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  tongTien DECIMAL(18,2) NOT NULL,
  giamTru DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  daThu DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  trangThai ENUM('chua_thu', 'thu_mot_phan', 'da_thu_du') NOT NULL DEFAULT 'chua_thu',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_KhoanPhaiThu_kyThuId_hocSinhId (kyThuId, hocSinhId),
  KEY IX_KhoanPhaiThu_donViId_trangThai (donViId, trangThai),
  KEY IX_KhoanPhaiThu_hocSinhId (hocSinhId),
  CONSTRAINT FK_KhoanPhaiThu_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_KhoanPhaiThu_KyThu FOREIGN KEY (kyThuId) REFERENCES KyThu(id),
  CONSTRAINT FK_KhoanPhaiThu_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE KhoanPhaiThuChiTiet (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  khoanPhaiThuId BIGINT UNSIGNED NOT NULL,
  danhMucKhoanThuId BIGINT UNSIGNED NOT NULL,
  soTien DECIMAL(18,2) NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_KhoanPhaiThuChiTiet_kpt_danhMuc (khoanPhaiThuId, danhMucKhoanThuId),
  KEY IX_KhoanPhaiThuChiTiet_khoanPhaiThuId (khoanPhaiThuId),
  CONSTRAINT FK_KPTCT_KhoanPhaiThu FOREIGN KEY (khoanPhaiThuId) REFERENCES KhoanPhaiThu(id),
  CONSTRAINT FK_KPTCT_DanhMuc FOREIGN KEY (danhMucKhoanThuId) REFERENCES DanhMucKhoanThu(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PhieuThu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  khoanPhaiThuId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  soPhieu VARCHAR(50) NOT NULL,
  soTien DECIMAL(18,2) NOT NULL,
  phuongThuc ENUM('tien_mat', 'chuyen_khoan', 'the', 'khac') NOT NULL,
  ghiChu VARCHAR(500) NULL,
  nguoiThuId BIGINT UNSIGNED NOT NULL,
  ngayThu DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_PhieuThu_donViId_soPhieu (donViId, soPhieu),
  KEY IX_PhieuThu_khoanPhaiThuId (khoanPhaiThuId),
  KEY IX_PhieuThu_hocSinhId (hocSinhId),
  CONSTRAINT FK_PhieuThu_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_PhieuThu_KhoanPhaiThu FOREIGN KEY (khoanPhaiThuId) REFERENCES KhoanPhaiThu(id),
  CONSTRAINT FK_PhieuThu_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_PhieuThu_NguoiThu FOREIGN KEY (nguoiThuId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
