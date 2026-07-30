-- ============================================================
-- QLTruongHoc
-- KhoanPhaiThu theo lop hoc + Phieu nhap hoc + Phieu xep lop
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

-- KhoanPhaiThu hien chi rang buoc duy nhat theo (kyThuId, hocSinhId): hoc
-- sinh hoc 2 lop trong cung ky thu se bi bo qua khi sinh khoan phai thu cho
-- lop thu 2 (trung khoa). Them lopHocId va doi unique key de tach theo lop.
ALTER TABLE KhoanPhaiThu ADD COLUMN lopHocId BIGINT UNSIGNED NULL AFTER hocSinhId;
ALTER TABLE KhoanPhaiThu ADD CONSTRAINT FK_KhoanPhaiThu_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id);

-- Gan best-effort cho du lieu cu: chi gan khi hoc sinh dang hoc dung 1 lop
-- (khong doan khi mo ho — de NULL, van hop le vi unique key cho phep nhieu
-- NULL trong MySQL).
UPDATE KhoanPhaiThu kpt
JOIN (
  SELECT hocSinhId, MIN(lopHocId) AS lopHocId
  FROM HocSinhLopHoc
  WHERE trangThai = 'dang_hoc'
  GROUP BY hocSinhId
  HAVING COUNT(*) = 1
) hs ON hs.hocSinhId = kpt.hocSinhId
SET kpt.lopHocId = hs.lopHocId
WHERE kpt.lopHocId IS NULL;

-- Tạo khoá mới TRƯỚC khi xoá khoá cũ: khoá cũ đang được FK_KhoanPhaiThu_KyThu
-- dùng làm index hỗ trợ (kyThuId là cột đầu) nên MySQL không cho xoá nếu
-- không còn index nào khác phủ được cột đó — khoá mới cũng bắt đầu bằng
-- kyThuId nên tự động thay thế được.
ALTER TABLE KhoanPhaiThu ADD UNIQUE KEY UQ_KhoanPhaiThu_kyThuId_hocSinhId_lopHocId (kyThuId, hocSinhId, lopHocId);
ALTER TABLE KhoanPhaiThu DROP INDEX UQ_KhoanPhaiThu_kyThuId_hocSinhId;

-- Phieu xac nhan nhap hoc — lap 1 lan khi tiep nhan hoc sinh (co the lap lai
-- neu that lac ban goc, khong gioi han so lan).
CREATE TABLE PhieuNhapHoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  soPhieu VARCHAR(50) NOT NULL,
  ngayNhapHoc DATE NOT NULL,
  nguoiLapId BIGINT UNSIGNED NOT NULL,
  ghiChu VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_PhieuNhapHoc_donViId_soPhieu (donViId, soPhieu),
  KEY IX_PhieuNhapHoc_hocSinhId (hocSinhId),
  CONSTRAINT FK_PhieuNhapHoc_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_PhieuNhapHoc_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_PhieuNhapHoc_NguoiLap FOREIGN KEY (nguoiLapId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Phieu xep lop — lap moi lan xep lop/chuyen lop (gan voi 1 dong
-- HocSinhLopHoc cu the, vi 1 hoc sinh co nhieu luot qua nhieu lop).
CREATE TABLE PhieuXepLop (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  enrollmentId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  lopHocId BIGINT UNSIGNED NOT NULL,
  soPhieu VARCHAR(50) NOT NULL,
  nguoiLapId BIGINT UNSIGNED NOT NULL,
  ghiChu VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_PhieuXepLop_donViId_soPhieu (donViId, soPhieu),
  KEY IX_PhieuXepLop_enrollmentId (enrollmentId),
  KEY IX_PhieuXepLop_hocSinhId (hocSinhId),
  CONSTRAINT FK_PhieuXepLop_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_PhieuXepLop_Enrollment FOREIGN KEY (enrollmentId) REFERENCES HocSinhLopHoc(id),
  CONSTRAINT FK_PhieuXepLop_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  CONSTRAINT FK_PhieuXepLop_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  CONSTRAINT FK_PhieuXepLop_NguoiLap FOREIGN KEY (nguoiLapId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
