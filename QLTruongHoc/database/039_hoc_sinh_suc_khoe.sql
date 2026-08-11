-- ============================================================
-- QLTruongHoc
-- Them bang HocSinhSucKhoe: so suc khoe mam non - lich su do chieu
-- cao/can nang/di ung theo moc thoi gian (tuan/thang/quy), khac voi
-- 3 cot tinh chieuCaoCm/canNangKg/diUngBenhNen tren HocSinh (chi giu
-- gia tri hien tai). Service dong bo nguoc gia tri moi nhat ve 3 cot
-- tinh do sau moi lan ghi.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;

-- Database dich duoc chon tu DATABASE_URL cua moi moi truong.
CREATE TABLE IF NOT EXISTS HocSinhSucKhoe (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donViId BIGINT UNSIGNED NOT NULL,
  hocSinhId BIGINT UNSIGNED NOT NULL,
  ngayGhiNhan DATE NOT NULL,
  loaiGhiNhan ENUM('theo_tuan','theo_thang','theo_quy','khac') NOT NULL DEFAULT 'khac',
  chieuCaoCm DECIMAL(5,1) NULL,
  canNangKg DECIMAL(5,1) NULL,
  diUngBenhNen TEXT NULL,
  ghiChu TEXT NULL,
  actorUserId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY IX_HocSinhSucKhoe_donViId (donViId),
  KEY IX_HocSinhSucKhoe_hocSinhId_ngayGhiNhan (hocSinhId, ngayGhiNhan),
  CONSTRAINT FK_HocSinhSucKhoe_DonVi FOREIGN KEY (donViId) REFERENCES DonVi(id),
  CONSTRAINT FK_HocSinhSucKhoe_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
