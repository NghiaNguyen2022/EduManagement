-- ============================================================
-- QLTruongHoc
-- Bổ sung hồ sơ pháp lý cho DonVi (hình ảnh, người đại diện, MST, giấy
-- phép) và ảnh đại diện cho NguoiDung.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE DonVi
  ADD COLUMN hinhAnhUrl VARCHAR(500) NULL AFTER email,
  ADD COLUMN nguoiDaiDien VARCHAR(255) NULL AFTER hinhAnhUrl,
  ADD COLUMN maSoThue VARCHAR(50) NULL AFTER nguoiDaiDien,
  ADD COLUMN maGiayPhep VARCHAR(100) NULL AFTER maSoThue,
  ADD COLUMN giayPhepUrl VARCHAR(500) NULL AFTER maGiayPhep;

ALTER TABLE NguoiDung
  ADD COLUMN hinhAnhUrl VARCHAR(500) NULL AFTER email;
