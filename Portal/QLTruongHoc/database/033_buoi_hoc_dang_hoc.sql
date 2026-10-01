-- ============================================================
-- QLTruongHoc
-- Them trang thai "dang_hoc" (buoi hoc dang dien ra) cho BuoiHoc.
-- Tach ro hanh dong "giao vien bat dau/ket thuc buoi hoc" khoi
-- viec diem danh tu dong chuyen trang thai nhu truoc day - diem
-- danh (ghi/sua) chi cho phep khi buoi hoc dang o trang thai
-- "dang_hoc".
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE BuoiHoc
  MODIFY COLUMN trangThai ENUM('du_kien','dang_hoc','da_hoc','nghi','huy')
    NOT NULL DEFAULT 'du_kien';
