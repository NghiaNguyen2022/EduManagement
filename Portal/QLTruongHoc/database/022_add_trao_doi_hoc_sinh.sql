-- ============================================================
-- QLTruongHoc
-- Sprint 6 - I04: TraoDoiHocSinh
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE TraoDoiHocSinh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  lopHocId BIGINT UNSIGNED NULL,
  nguoiGuiVaiTro ENUM('giao_vien','phu_huynh','hoc_vu','khac') NOT NULL DEFAULT 'hoc_vu',
  kenhLienLac ENUM('truc_tiep','dien_thoai','nhan_tin','email','khac') NOT NULL DEFAULT 'truc_tiep',
  noiDung TEXT NOT NULL,
  ketQua TEXT NULL,
  nguoiTaoId BIGINT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_TraoDoiHocSinh_donViId (donViId),
  KEY IX_TraoDoiHocSinh_hocSinhId (hocSinhId),
  KEY IX_TraoDoiHocSinh_lopHocId (lopHocId),
  KEY IX_TraoDoiHocSinh_createdAt (createdAt),
  CONSTRAINT FK_TraoDoiHocSinh_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_TraoDoiHocSinh_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_TraoDoiHocSinh_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_TraoDoiHocSinh_NguoiDung FOREIGN KEY (nguoiTaoId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;