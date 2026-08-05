-- ============================================================
-- QLTruongHoc
-- Nhan tin 2 chieu that giua phu huynh va giao vien (TinNhanHocSinh),
-- tach khoi TraoDoiHocSinh (log tong ket cuoc tro chuyen do nhan vien
-- ghi). Thay the viec nhan tin qua Zalo.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE TinNhanHocSinh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  lopHocId BIGINT UNSIGNED NULL,
  nguoiGuiId BIGINT UNSIGNED NOT NULL,
  nguoiGuiLaPhuHuynh TINYINT(1) NOT NULL,
  noiDung TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_TinNhanHocSinh_donViId_hocSinhId_createdAt (donViId, hocSinhId, createdAt),
  CONSTRAINT FK_TinNhanHocSinh_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_TinNhanHocSinh_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_TinNhanHocSinh_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_TinNhanHocSinh_NguoiGui FOREIGN KEY (nguoiGuiId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
