-- ============================================================
-- QLTruongHoc
-- LeadHoatDong.trangThai - "hen lich" hoat dong nhu task that (cho_xu_ly /
-- da_xu_ly / da_huy) thay vi chi la log qua khu. Xem
-- docs/analysis/LEAD_HOAT_DONG_TASK.md
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE LeadHoatDong
  ADD COLUMN trangThai ENUM('cho_xu_ly','da_xu_ly','da_huy') NOT NULL DEFAULT 'da_xu_ly' AFTER thoiGian;

ALTER TABLE LeadHoatDong
  ADD KEY IX_LeadHoatDong_trangThai_thoiGian (trangThai, thoiGian);
