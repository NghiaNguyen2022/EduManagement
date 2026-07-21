-- ============================================================
-- QLTruongHoc
-- Sprint 2 - E01/E02/E03/E04: Chuong trinh, giao vien, lop hoc, xep lop
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE ChuongTrinhDaoTao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maChuongTrinh VARCHAR(50) NOT NULL,
  tenChuongTrinh VARCHAR(255) NOT NULL,
  capDo VARCHAR(100) NULL,
  tongSoBuoi INT NULL,
  tongSoGio DECIMAL(10,2) NULL,
  moTa TEXT NULL,
  trangThai ENUM('hoat_dong','ngung_hoat_dong') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_ChuongTrinhDaoTao_donViId_ma (donViId, maChuongTrinh),
  KEY IX_ChuongTrinhDaoTao_donViId (donViId),
  CONSTRAINT FK_ChuongTrinhDaoTao_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE GiaoVien (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  nguoiDungId BIGINT UNSIGNED NULL,
  maGiaoVien VARCHAR(50) NOT NULL,
  hoTen VARCHAR(255) NOT NULL,
  dienThoai VARCHAR(30) NULL,
  email VARCHAR(255) NULL,
  chuyenMon VARCHAR(255) NULL,
  trinhDo VARCHAR(255) NULL,
  trangThai ENUM('hoat_dong','ngung_hoat_dong') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_GiaoVien_donViId_ma (donViId, maGiaoVien),
  KEY IX_GiaoVien_donViId (donViId),
  CONSTRAINT FK_GiaoVien_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_GiaoVien_NguoiDung FOREIGN KEY (nguoiDungId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE LopHoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  chuongTrinhDaoTaoId BIGINT UNSIGNED NULL,
  maLop VARCHAR(50) NOT NULL,
  tenLop VARCHAR(255) NOT NULL,
  capDo VARCHAR(100) NULL,
  ngayBatDau DATE NULL,
  ngayKetThuc DATE NULL,
  siSoToiDa INT NULL,
  phongHoc VARCHAR(100) NULL,
  trangThai ENUM('chuan_bi','dang_hoc','tam_dung','ket_thuc','huy')
    NOT NULL DEFAULT 'chuan_bi',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_LopHoc_donViId_ma (donViId, maLop),
  KEY IX_LopHoc_donViId (donViId),
  KEY IX_LopHoc_donViId_trangThai (donViId, trangThai),
  CONSTRAINT FK_LopHoc_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_LopHoc_ChuongTrinhDaoTao FOREIGN KEY (chuongTrinhDaoTaoId) REFERENCES ChuongTrinhDaoTao(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE LopHocGiaoVien (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lopHocId BIGINT UNSIGNED NOT NULL,
  giaoVienId BIGINT UNSIGNED NOT NULL,
  vaiTro ENUM('giao_vien_chinh','ho_tro','chu_nhiem') NOT NULL DEFAULT 'giao_vien_chinh',
  tuNgay DATE NOT NULL,
  denNgay DATE NULL,
  trangThai ENUM('hoat_dong','ngung_hoat_dong') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_LopHocGiaoVien_lopHocId (lopHocId),
  KEY IX_LopHocGiaoVien_giaoVienId (giaoVienId),
  CONSTRAINT FK_LopHocGiaoVien_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_LopHocGiaoVien_GiaoVien FOREIGN KEY (giaoVienId) REFERENCES GiaoVien(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE HocSinhLopHoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  lopHocId BIGINT UNSIGNED NOT NULL,
  ngayVaoLop DATE NOT NULL,
  ngayRoiLop DATE NULL,
  lyDoRoiLop VARCHAR(500) NULL,
  trangThai ENUM('dang_hoc','bao_luu','chuyen_lop','ngung_hoc','hoan_thanh')
    NOT NULL DEFAULT 'dang_hoc',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HocSinhLopHoc_hocSinhId_trangThai (hocSinhId, trangThai),
  KEY IX_HocSinhLopHoc_lopHocId_trangThai (lopHocId, trangThai),
  CONSTRAINT FK_HocSinhLopHoc_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_HocSinhLopHoc_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
