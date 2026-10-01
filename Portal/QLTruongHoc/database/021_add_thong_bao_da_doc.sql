-- ============================================================
-- QLTruongHoc
-- Sprint 6 - I03: ThongBaoDaDoc
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE ThongBaoDaDoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  thongBaoId BIGINT UNSIGNED NOT NULL,
  nguoiDungId BIGINT UNSIGNED NOT NULL,
  daDocAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_ThongBaoDaDoc_thongBaoId_nguoiDungId (thongBaoId, nguoiDungId),
  KEY IX_ThongBaoDaDoc_thongBaoId (thongBaoId),
  KEY IX_ThongBaoDaDoc_nguoiDungId (nguoiDungId),
  CONSTRAINT FK_ThongBaoDaDoc_ThongBao FOREIGN KEY (thongBaoId) REFERENCES ThongBao(id),
  CONSTRAINT FK_ThongBaoDaDoc_NguoiDung FOREIGN KEY (nguoiDungId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;