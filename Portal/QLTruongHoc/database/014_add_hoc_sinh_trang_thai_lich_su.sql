-- ============================================================
-- QLTruongHoc
-- Sprint 2 - D05/D06: Lich su trang thai hoc tap
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE HocSinhTrangThaiLichSu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  trangThaiCu ENUM('tiep_nhan','dang_hoc','bao_luu','ngung_hoc','hoan_thanh') NULL,
  trangThaiMoi ENUM('tiep_nhan','dang_hoc','bao_luu','ngung_hoc','hoan_thanh') NOT NULL,
  lyDo VARCHAR(500) NULL,
  ngayHieuLuc DATE NOT NULL,
  actorUserId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HocSinhTrangThaiLichSu_hocSinhId (hocSinhId),
  CONSTRAINT FK_HocSinhTrangThaiLichSu_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_HocSinhTrangThaiLichSu_NguoiDung FOREIGN KEY (actorUserId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
