-- ============================================================
-- QLTruongHoc
-- Cau hinh mau in theo don vi (header/footer/nhan chu ky)
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE CauHinhMauIn (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  hienThiLogo TINYINT(1) NOT NULL DEFAULT 1,
  ghiChuFooter VARCHAR(1000) NULL,
  nhanKyNguoiLap VARCHAR(100) NOT NULL DEFAULT 'Người lập phiếu',
  nhanKyNguoiNop VARCHAR(100) NOT NULL DEFAULT 'Phụ huynh / Người nộp',
  nhanKyDaiDienDonVi VARCHAR(100) NOT NULL DEFAULT 'Đại diện đơn vị',
  capNhatBoiId BIGINT UNSIGNED NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_CauHinhMauIn_donViId (donViId),
  CONSTRAINT FK_CauHinhMauIn_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_CauHinhMauIn_NguoiDung FOREIGN KEY (capNhatBoiId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
