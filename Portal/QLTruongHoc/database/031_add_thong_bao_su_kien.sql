-- ============================================================
-- QLTruongHoc
-- Thong bao su kien tu dong (popup/toast khi co su kien nghiep vu: tao
-- khoan chi can duyet, duyet/tu choi...) — nham toi 1 nhan vien cu the,
-- tach biet khoi ThongBao (thong bao thu cong theo lop/hoc sinh/toan
-- truong). Xem docs/analysis/THONG_BAO_SU_KIEN.md
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE ThongBaoSuKien (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  nguoiNhanId BIGINT UNSIGNED NOT NULL,
  loaiSuKien VARCHAR(100) NOT NULL,
  tieuDe VARCHAR(255) NOT NULL,
  noiDung TEXT NOT NULL,
  duongDan VARCHAR(255) NULL,
  daHienThi TINYINT(1) NOT NULL DEFAULT 0,
  daHienThiAt DATETIME NULL,
  daDoc TINYINT(1) NOT NULL DEFAULT 0,
  daDocAt DATETIME NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_ThongBaoSuKien_donViId_nguoiNhanId_daHienThi (donViId, nguoiNhanId, daHienThi),
  KEY IX_ThongBaoSuKien_donViId_nguoiNhanId_daDoc (donViId, nguoiNhanId, daDoc),
  CONSTRAINT FK_ThongBaoSuKien_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_ThongBaoSuKien_NguoiNhan FOREIGN KEY (nguoiNhanId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
