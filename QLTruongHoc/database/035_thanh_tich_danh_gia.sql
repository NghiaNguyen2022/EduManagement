-- ============================================================
-- QLTruongHoc
-- Them 2 bang moi cho ho so hoc sinh:
-- - HocSinhThanhTich: chung chi/thanh tich hoc sinh dat duoc (vd
--   IELTS 8.0), khong gan voi 1 luot xep lop cu the, khong co
--   workflow duyet (ghi la hien thi ngay).
-- - HocSinhLopHocDanhGia: ket qua hoc tap theo tung luot xep lop
--   (HocSinhLopHoc), cho phep nhieu lan danh gia/luot xep lop
--   (giua ky, cuoi ky, khac).
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE HocSinhThanhTich (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  tenThanhTich VARCHAR(255) NOT NULL,
  ketQua VARCHAR(100) NULL,
  ngayDat DATE NULL,
  noiCap VARCHAR(255) NULL,
  tepMinhChungUrl VARCHAR(500) NULL,
  ghiChu TEXT NULL,
  actorUserId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HocSinhThanhTich_hocSinhId (hocSinhId),
  CONSTRAINT FK_HocSinhThanhTich_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE HocSinhLopHocDanhGia (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enrollmentId BIGINT UNSIGNED NOT NULL,
  loaiDanhGia ENUM('giua_ky','cuoi_ky','khac') NOT NULL DEFAULT 'khac',
  diemSo DECIMAL(5,1) NULL,
  xepLoai VARCHAR(50) NULL,
  nhanXet TEXT NULL,
  ngayDanhGia DATE NOT NULL,
  actorUserId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HocSinhLopHocDanhGia_enrollmentId (enrollmentId),
  CONSTRAINT FK_HocSinhLopHocDanhGia_Enrollment FOREIGN KEY (enrollmentId) REFERENCES HocSinhLopHoc(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
