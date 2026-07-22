-- ============================================================
-- QLTruongHoc
-- Sprint 6 - I01: Thong bao noi bo
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE ThongBao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maThongBao VARCHAR(50) NOT NULL,
  tieuDe VARCHAR(255) NOT NULL,
  noiDung TEXT NOT NULL,
  phamVi ENUM('toan_truong', 'theo_lop', 'ca_nhan') NOT NULL DEFAULT 'toan_truong',
  doiTuong VARCHAR(255) NULL,
  nguoiTaoId BIGINT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_ThongBao_donViId_maThongBao (donViId, maThongBao),
  KEY IX_ThongBao_donViId (donViId),
  KEY IX_ThongBao_donViId_phamVi (donViId, phamVi),
  KEY IX_ThongBao_nguoiTaoId (nguoiTaoId),
  CONSTRAINT FK_ThongBao_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_ThongBao_NguoiTao FOREIGN KEY (nguoiTaoId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;