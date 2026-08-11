-- ============================================================
-- QLTruongHoc
-- Album anh hoat dong lop hoc: giao vien dang nhieu anh/1 hoat dong,
-- tuy chon gan the hoc sinh cu the. Thay the viec gui anh qua Zalo.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;

-- Database dich duoc chon tu DATABASE_URL cua moi moi truong.
-- IF NOT EXISTS giup migration co the chay lai an toan khi release/redeploy.
CREATE TABLE IF NOT EXISTS HoatDongLopHoc (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  lopHocId BIGINT UNSIGNED NOT NULL,
  ngayHoatDong DATE NOT NULL,
  tieuDe VARCHAR(255) NOT NULL,
  moTa TEXT NULL,
  actorUserId BIGINT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HoatDongLopHoc_donViId_lopHocId_ngayHoatDong (donViId, lopHocId, ngayHoatDong),
  CONSTRAINT FK_HoatDongLopHoc_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_HoatDongLopHoc_LopHoc FOREIGN KEY (lopHocId) REFERENCES LopHoc(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS HoatDongAnh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hoatDongId BIGINT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  thuTu INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY IX_HoatDongAnh_hoatDongId (hoatDongId),
  CONSTRAINT FK_HoatDongAnh_HoatDong FOREIGN KEY (hoatDongId) REFERENCES HoatDongLopHoc(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS HoatDongHocSinh (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hoatDongId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HoatDongHocSinh_hoatDongId (hoatDongId),
  KEY IX_HoatDongHocSinh_hocSinhId (hocSinhId),
  CONSTRAINT FK_HoatDongHocSinh_HoatDong FOREIGN KEY (hoatDongId) REFERENCES HoatDongLopHoc(id),
  CONSTRAINT FK_HoatDongHocSinh_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
