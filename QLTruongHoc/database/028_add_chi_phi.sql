-- ============================================================
-- QLTruongHoc
-- Chi phi (DanhMucChiPhi + ChiPhi, kem duyet) - ghi lai migration con thieu
-- cho tinh nang Chi phi (da co san trong CSDL dev qua drizzle-kit push,
-- chua tung duoc ghi thanh file SQL), gop chung voi cot duyet moi them
-- 2026-07-27 (xem docs/analysis/QUAN_LY_DON_VI_UX_VONG_2.md muc 3.2 - chi
-- phi la tien CHI RA (dich vu, mua sam...) nen can duyet TRUOC khi ghi
-- nhan, khac H08 (dao nguoc mot khoan thu da co) - dung lai khuon duyet cua
-- DieuChinhKhoanPhaiThu.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE DanhMucChiPhi (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  maChiPhi VARCHAR(50) NOT NULL,
  tenChiPhi VARCHAR(255) NOT NULL,
  loaiChiPhi ENUM('luong','mat_bang','dien_nuoc','vat_tu','marketing','khac') NOT NULL,
  trangThai ENUM('hoat_dong','ngung_ap_dung') NOT NULL DEFAULT 'hoat_dong',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_DanhMucChiPhi_donViId_ma (donViId, maChiPhi),
  KEY IX_DanhMucChiPhi_donViId (donViId),
  CONSTRAINT FK_DanhMucChiPhi_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ChiPhi (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  danhMucChiPhiId BIGINT UNSIGNED NOT NULL,
  soTien DECIMAL(18,2) NOT NULL,
  ngayChi DATE NOT NULL,
  moTa VARCHAR(500) NULL,
  trangThai ENUM('cho_duyet','da_duyet','tu_choi') NOT NULL DEFAULT 'cho_duyet',
  nguoiTaoId BIGINT UNSIGNED NOT NULL,
  nguoiDuyetId BIGINT UNSIGNED NULL,
  ghiChuDuyet VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  duyetAt DATETIME NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_ChiPhi_donViId_ngayChi (donViId, ngayChi),
  KEY IX_ChiPhi_danhMucChiPhiId (danhMucChiPhiId),
  KEY IX_ChiPhi_donViId_trangThai (donViId, trangThai),
  CONSTRAINT FK_ChiPhi_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_ChiPhi_DanhMucChiPhi FOREIGN KEY (danhMucChiPhiId) REFERENCES DanhMucChiPhi(id),
  CONSTRAINT FK_ChiPhi_NguoiTao FOREIGN KEY (nguoiTaoId) REFERENCES NguoiDung(id),
  CONSTRAINT FK_ChiPhi_NguoiDuyet FOREIGN KEY (nguoiDuyetId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Duyet chi phi tai dung nguyen quyen `tai_chinh.duyet` da co san tu H08
-- (DieuChinhKhoanPhaiThu), khong them quyen moi. File seed
-- `008_seed_default_role_permissions.sql` hien chua liet ke quyen nay cho
-- CSDL dev thuc te da co (drift, xem docs/analysis/QUAN_LY_DON_VI_UX_VONG_2.md
-- muc 2) - can cap nhat lai file 008 khi don dep, khong lam trong migration nay.
