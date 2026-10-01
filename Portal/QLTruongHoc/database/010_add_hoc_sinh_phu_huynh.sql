-- ============================================================
-- QLTruongHoc
-- Sprint 1 - D01/D03: Ho so hoc sinh va phu huynh
-- MySQL 8+
--
-- HocSinh chua ton tai trong DB (chi co scaffold code truoc do,
-- chua tung ap dung) nen tao moi thay vi ALTER.
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE HocSinh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maHocSinh VARCHAR(50) NOT NULL,
  hoTen VARCHAR(255) NOT NULL,
  tenThuongGoi VARCHAR(100) NULL,
  ngaySinh DATE NULL,
  gioiTinh ENUM('nam','nu','khac') NULL,
  diaChi VARCHAR(500) NULL,
  ngayNhapHoc DATE NULL,
  trangThai ENUM('tiep_nhan','dang_hoc','bao_luu','ngung_hoc','hoan_thanh')
    NOT NULL DEFAULT 'tiep_nhan',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_HocSinh_donViId_maHocSinh (donViId, maHocSinh),
  KEY IX_HocSinh_donViId (donViId),
  KEY IX_HocSinh_trangThai (trangThai),
  CONSTRAINT FK_HocSinh_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PhuHuynh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  nguoiDungId BIGINT UNSIGNED NULL,
  maPhuHuynh VARCHAR(50) NOT NULL,
  hoTen VARCHAR(255) NOT NULL,
  ngaySinh DATE NULL,
  gioiTinh ENUM('nam','nu','khac') NULL,
  dienThoai VARCHAR(30) NOT NULL,
  email VARCHAR(255) NULL,
  ngheNghiep VARCHAR(255) NULL,
  diaChi VARCHAR(500) NULL,
  trangThai ENUM('hoat_dong','ngung_hoat_dong') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_PhuHuynh_donViId_maPhuHuynh (donViId, maPhuHuynh),
  KEY IX_PhuHuynh_donViId (donViId),
  KEY IX_PhuHuynh_donViId_dienThoai (donViId, dienThoai),
  CONSTRAINT FK_PhuHuynh_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_PhuHuynh_NguoiDung FOREIGN KEY (nguoiDungId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE HocSinhPhuHuynh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  phuHuynhId BIGINT UNSIGNED NOT NULL,
  moiQuanHe ENUM('cha','me','ong','ba','nguoi_giam_ho','khac') NOT NULL,
  laLienHeChinh TINYINT(1) NOT NULL DEFAULT 0,
  duocDonTre TINYINT(1) NOT NULL DEFAULT 1,
  nhanThongBao TINYINT(1) NOT NULL DEFAULT 1,
  nhanThongTinHocPhi TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_HocSinhPhuHuynh (hocSinhId, phuHuynhId),
  KEY IX_HocSinhPhuHuynh_hocSinhId (hocSinhId),
  KEY IX_HocSinhPhuHuynh_phuHuynhId (phuHuynhId),
  CONSTRAINT FK_HocSinhPhuHuynh_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_HocSinhPhuHuynh_PhuHuynh FOREIGN KEY (phuHuynhId) REFERENCES PhuHuynh(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
