-- ============================================================
-- QLTruongHoc
-- Tach luong tuyen sinh theo loai hinh dao tao (mam non ghi danh
-- truc tiep, khong qua Lead) + chuyen "xep lop" cho hoc vu + test
-- dau vao theo tung chuong trinh. Xem
-- docs/analysis/TUYEN_SINH_THEO_LOAI_HINH.md
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE HocSinh
  ADD COLUMN nguyenVongLop TEXT NULL AFTER ngayNhapHoc,
  ADD COLUMN ketQuaTestDauVao TEXT NULL AFTER nguyenVongLop;

ALTER TABLE ChuongTrinhDaoTao
  ADD COLUMN coTestDauVao TINYINT(1) NOT NULL DEFAULT 0 AFTER moTa;
