-- ============================================================
-- QLTruongHoc
-- Sprint 5 (Tai chinh) - H08: DieuChinhKhoanPhaiThu (hoan phi / chuyen phi / bao luu)
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE DieuChinhKhoanPhaiThu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  khoanPhaiThuId BIGINT UNSIGNED NOT NULL,
  khoanPhaiThuDichId BIGINT UNSIGNED NULL,
  loaiDieuChinh ENUM('hoan_phi','chuyen_phi','bao_luu') NOT NULL,
  soTien DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  lyDo VARCHAR(500) NOT NULL,
  trangThai ENUM('cho_duyet','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet',
  nguoiTaoId BIGINT UNSIGNED NOT NULL,
  nguoiDuyetId BIGINT UNSIGNED NULL,
  ghiChuDuyet VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  duyetAt DATETIME NULL,
  PRIMARY KEY (id),
  KEY IX_DieuChinhKhoanPhaiThu_khoanPhaiThuId (khoanPhaiThuId),
  KEY IX_DieuChinhKhoanPhaiThu_donViId_trangThai (donViId, trangThai),
  CONSTRAINT FK_DieuChinhKhoanPhaiThu_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_DieuChinhKhoanPhaiThu_KhoanPhaiThu FOREIGN KEY (khoanPhaiThuId) REFERENCES KhoanPhaiThu(id),
  CONSTRAINT FK_DieuChinhKhoanPhaiThu_KhoanPhaiThuDich FOREIGN KEY (khoanPhaiThuDichId) REFERENCES KhoanPhaiThu(id),
  CONSTRAINT FK_DieuChinhKhoanPhaiThu_NguoiTao FOREIGN KEY (nguoiTaoId) REFERENCES NguoiDung(id),
  CONSTRAINT FK_DieuChinhKhoanPhaiThu_NguoiDuyet FOREIGN KEY (nguoiDuyetId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
