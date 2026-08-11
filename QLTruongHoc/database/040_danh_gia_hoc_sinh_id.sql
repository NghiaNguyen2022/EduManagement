-- ============================================================
-- QLTruongHoc
-- HocSinhLopHocDanhGia: gan thang theo hocSinhId thay vi chi qua
-- enrollmentId, de lich su danh gia phat trien lien mach qua cac lan
-- chuyen lop. enrollmentId giu lai lam ngu canh tuy chon (khong con
-- bat buoc).
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;

-- Database dich duoc chon tu DATABASE_URL cua moi moi truong.

ALTER TABLE HocSinhLopHocDanhGia
  ADD COLUMN hocSinhId BIGINT UNSIGNED NULL AFTER id;

UPDATE HocSinhLopHocDanhGia dg
  JOIN HocSinhLopHoc e ON dg.enrollmentId = e.id
  SET dg.hocSinhId = e.hocSinhId;

ALTER TABLE HocSinhLopHocDanhGia
  MODIFY COLUMN hocSinhId BIGINT UNSIGNED NOT NULL;

ALTER TABLE HocSinhLopHocDanhGia
  DROP FOREIGN KEY FK_HocSinhLopHocDanhGia_Enrollment;

ALTER TABLE HocSinhLopHocDanhGia
  MODIFY COLUMN enrollmentId BIGINT UNSIGNED NULL;

ALTER TABLE HocSinhLopHocDanhGia
  ADD CONSTRAINT FK_HocSinhLopHocDanhGia_HocSinh FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id),
  ADD CONSTRAINT FK_HocSinhLopHocDanhGia_Enrollment FOREIGN KEY (enrollmentId) REFERENCES HocSinhLopHoc(id),
  ADD KEY IX_HocSinhLopHocDanhGia_hocSinhId (hocSinhId);
