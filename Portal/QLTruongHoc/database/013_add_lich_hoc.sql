-- ============================================================
-- QLTruongHoc
-- Sprint 2 - E05/E06/E07/E08: Lich hoc lap lai va thoi khoa bieu
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE LichHoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lopHocId BIGINT UNSIGNED NOT NULL,
  thuTrongTuan INT NOT NULL,
  gioBatDau TIME NOT NULL,
  gioKetThuc TIME NOT NULL,
  phongHoc VARCHAR(100) NULL,
  giaoVienId BIGINT UNSIGNED NULL,
  ngayApDungTu DATE NOT NULL,
  ngayApDungDen DATE NULL,
  trangThai ENUM('hoat_dong','ngung_hoat_dong') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_LichHoc_lopHocId (lopHocId),
  KEY IX_LichHoc_lopHocId_trangThai (lopHocId, trangThai),
  CONSTRAINT FK_LichHoc_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_LichHoc_GiaoVien FOREIGN KEY (giaoVienId) REFERENCES GiaoVien(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE BuoiHoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lopHocId BIGINT UNSIGNED NOT NULL,
  lichHocId BIGINT UNSIGNED NULL,
  ngayHoc DATE NOT NULL,
  gioBatDau TIME NOT NULL,
  gioKetThuc TIME NOT NULL,
  phongHoc VARCHAR(100) NULL,
  giaoVienId BIGINT UNSIGNED NULL,
  loaiBuoi ENUM('thuong','bu') NOT NULL DEFAULT 'thuong',
  trangThai ENUM('du_kien','da_hoc','nghi','huy') NOT NULL DEFAULT 'du_kien',
  ghiChu VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_BuoiHoc_lopHocId_ngayHoc (lopHocId, ngayHoc),
  KEY IX_BuoiHoc_lichHocId (lichHocId),
  KEY IX_BuoiHoc_giaoVienId_ngayHoc (giaoVienId, ngayHoc),
  KEY IX_BuoiHoc_ngayHoc_trangThai (ngayHoc, trangThai),
  CONSTRAINT FK_BuoiHoc_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_BuoiHoc_LichHoc FOREIGN KEY (lichHocId) REFERENCES LichHoc(id),
  CONSTRAINT FK_BuoiHoc_GiaoVien FOREIGN KEY (giaoVienId) REFERENCES GiaoVien(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
