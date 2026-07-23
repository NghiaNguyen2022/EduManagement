-- ============================================================
-- QLTruongHoc
-- Sprint 3 (Diem danh) - F03: DonXinPhep (phu huynh gui don xin phep)
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE DonXinPhep (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  lopHocId BIGINT UNSIGNED NOT NULL,
  tuNgay DATE NOT NULL,
  denNgay DATE NOT NULL,
  lyDo VARCHAR(500) NOT NULL,
  trangThai ENUM('cho_duyet','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet',
  nguoiTaoId BIGINT UNSIGNED NOT NULL,
  nguoiDuyetId BIGINT UNSIGNED NULL,
  ghiChuDuyet VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  duyetAt DATETIME NULL,
  PRIMARY KEY (id),
  KEY IX_DonXinPhep_hocSinhId (hocSinhId),
  KEY IX_DonXinPhep_lopHocId (lopHocId),
  KEY IX_DonXinPhep_donViId_trangThai (donViId, trangThai),
  CONSTRAINT FK_DonXinPhep_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_DonXinPhep_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_DonXinPhep_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_DonXinPhep_NguoiTao FOREIGN KEY (nguoiTaoId) REFERENCES NguoiDung(id),
  CONSTRAINT FK_DonXinPhep_NguoiDuyet FOREIGN KEY (nguoiDuyetId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
