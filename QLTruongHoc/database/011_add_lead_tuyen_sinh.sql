-- ============================================================
-- QLTruongHoc
-- Sprint 1 - C01/C02/C03/C06: Lead va lich su cham soc
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE `Lead` (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maLead VARCHAR(50) NOT NULL,
  hoTen VARCHAR(255) NOT NULL,
  soDienThoai VARCHAR(30) NOT NULL,
  email VARCHAR(255) NULL,
  nguon ENUM('gioi_thieu','facebook','website','walk_in','khac')
    NOT NULL DEFAULT 'khac',
  doTuoiHoacTrinhDo VARCHAR(255) NULL,
  nhuCau TEXT NULL,
  tuVanVienId BIGINT UNSIGNED NULL,
  trangThai ENUM('moi','dang_cham_soc','da_hen_lich','da_hoc_thu','da_dang_ky','khong_tiep_tuc')
    NOT NULL DEFAULT 'moi',
  lyDoKhongTiepTuc VARCHAR(500) NULL,
  hocSinhId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_Lead_donViId_maLead (donViId, maLead),
  KEY IX_Lead_donViId (donViId),
  KEY IX_Lead_donViId_trangThai (donViId, trangThai),
  KEY IX_Lead_tuVanVienId (tuVanVienId),
  CONSTRAINT FK_Lead_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_Lead_TuVanVien FOREIGN KEY (tuVanVienId) REFERENCES NguoiDung(id),
  CONSTRAINT FK_Lead_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE LeadHoatDong (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  leadId BIGINT UNSIGNED NOT NULL,
  loaiHoatDong ENUM('goi_dien','gap_truc_tiep','nhan_tin','hen_lich','hoc_thu','khac')
    NOT NULL,
  noiDung TEXT NOT NULL,
  ketQua VARCHAR(500) NULL,
  nguoiThucHienId BIGINT UNSIGNED NOT NULL,
  thoiGian DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_LeadHoatDong_leadId (leadId),
  KEY IX_LeadHoatDong_leadId_thoiGian (leadId, thoiGian),
  CONSTRAINT FK_LeadHoatDong_Lead FOREIGN KEY (leadId) REFERENCES `Lead`(id),
  CONSTRAINT FK_LeadHoatDong_NguoiThucHien FOREIGN KEY (nguoiThucHienId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tu van vien can tao duoc hoat dong cham soc, khong chi xem.
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q ON q.maQuyen = 'tuyen_sinh.quan_ly'
WHERE vt.maVaiTro = 'tu_van'
  AND NOT EXISTS (
    SELECT 1 FROM VaiTroQuyen vtq
    WHERE vtq.vaiTroId = vt.id AND vtq.quyenId = q.id
  );
