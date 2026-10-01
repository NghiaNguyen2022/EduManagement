-- ============================================================
-- QLTruongHoc
-- CauHinhHeThong: cấu hình toàn hệ thống (chính sách đăng nhập/mật khẩu),
-- bảng đơn dòng (luôn đúng 1 dòng id = 1), chỉnh qua trang "Cấu hình hệ thống".
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

CREATE TABLE CauHinhHeThong (
  id TINYINT UNSIGNED NOT NULL,
  soLanDangNhapSaiToiDa INT UNSIGNED NOT NULL DEFAULT 5,
  soPhutKhoaDangNhap INT UNSIGNED NOT NULL DEFAULT 15,
  doDaiMatKhauToiThieu INT UNSIGNED NOT NULL DEFAULT 8,
  capNhatBoiId BIGINT UNSIGNED NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_CauHinhHeThong_NguoiDung FOREIGN KEY (capNhatBoiId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO CauHinhHeThong (id, soLanDangNhapSaiToiDa, soPhutKhoaDangNhap, doDaiMatKhauToiThieu, updatedAt)
VALUES (1, 5, 15, 8, NOW());
