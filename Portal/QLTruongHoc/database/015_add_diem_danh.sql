-- ============================================================
-- QLTruongHoc
-- Sprint 3 - F01/F02/F04: Diem danh theo buoi hoc
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE DiemDanh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  buoiHocId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  trangThai ENUM('co_mat','vang_co_phep','vang_khong_phep','di_tre','ve_som') NOT NULL,
  ghiChu VARCHAR(500) NULL,
  actorUserId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_DiemDanh_buoiHocId_hocSinhId (buoiHocId, hocSinhId),
  KEY IX_DiemDanh_buoiHocId (buoiHocId),
  KEY IX_DiemDanh_hocSinhId (hocSinhId),
  CONSTRAINT FK_DiemDanh_BuoiHoc FOREIGN KEY (buoiHocId) REFERENCES BuoiHoc(id),
  CONSTRAINT FK_DiemDanh_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_DiemDanh_NguoiDung FOREIGN KEY (actorUserId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
