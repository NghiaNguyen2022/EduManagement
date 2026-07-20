-- ============================================================
-- QLTruongHoc
-- Sprint 0B - Bo sung khoa tam dang nhap sai nhieu lan
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE NguoiDung
  ADD COLUMN soLanDangNhapSaiLienTiep INT UNSIGNED NOT NULL DEFAULT 0
    AFTER batBuocDoiMatKhau,
  ADD COLUMN khoaDangNhapDenLuc DATETIME NULL
    AFTER soLanDangNhapSaiLienTiep;
