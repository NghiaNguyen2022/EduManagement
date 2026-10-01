-- ============================================================
-- QLTruongHoc
-- Cau hinh duyet chi theo don vi (quan ly don vi bat/tat duyet cho danh muc
-- chi phi / de xuat chi dinh ky / de xuat chi dot xuat, cho phep ke toan
-- thao tac khong can duyet). Xem docs/analysis/CHI_PHI_CAU_HINH_DUYET.md
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE DanhMucChiPhi
  ADD COLUMN trangThaiDuyet ENUM('khong_can_duyet','cho_duyet','da_duyet','tu_choi') NOT NULL DEFAULT 'khong_can_duyet' AFTER trangThai,
  ADD COLUMN nguoiTaoId BIGINT UNSIGNED NULL AFTER trangThaiDuyet,
  ADD COLUMN nguoiDuyetId BIGINT UNSIGNED NULL AFTER nguoiTaoId,
  ADD COLUMN ghiChuDuyet VARCHAR(500) NULL AFTER nguoiDuyetId,
  ADD COLUMN duyetAt DATETIME NULL AFTER ghiChuDuyet;

ALTER TABLE DanhMucChiPhi
  ADD KEY IX_DanhMucChiPhi_donViId_trangThaiDuyet (donViId, trangThaiDuyet),
  ADD CONSTRAINT FK_DanhMucChiPhi_NguoiTao FOREIGN KEY (nguoiTaoId) REFERENCES NguoiDung(id),
  ADD CONSTRAINT FK_DanhMucChiPhi_NguoiDuyet FOREIGN KEY (nguoiDuyetId) REFERENCES NguoiDung(id);

ALTER TABLE ChiPhi
  ADD COLUMN loaiDeXuat ENUM('dinh_ky','dot_xuat') NOT NULL DEFAULT 'dinh_ky' AFTER moTa;

CREATE TABLE CauHinhTaiChinhDonVi (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  duyetDanhMucChiPhi TINYINT(1) NOT NULL DEFAULT 1,
  duyetChiDinhKy TINYINT(1) NOT NULL DEFAULT 1,
  duyetChiDotXuat TINYINT(1) NOT NULL DEFAULT 1,
  capNhatBoiId BIGINT UNSIGNED NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_CauHinhTaiChinhDonVi_donViId (donViId),
  CONSTRAINT FK_CauHinhTaiChinhDonVi_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_CauHinhTaiChinhDonVi_NguoiDung FOREIGN KEY (capNhatBoiId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
