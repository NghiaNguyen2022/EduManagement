-- ============================================================
-- QLTruongHoc
-- Sprint 6 - I02: Attachment metadata for ThongBao
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE ThongBao
  ADD COLUMN tepDinhKemTen VARCHAR(255) NULL AFTER noiDung,
  ADD COLUMN tepDinhKemUrl TEXT NULL AFTER tepDinhKemTen;