-- ============================================================
-- QLTruongHoc
-- Sprint 3 - G01/G02/G03: Bao giang theo buoi, nhan xet hoc sinh
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE DiemDanh
  ADD COLUMN nhanXet VARCHAR(500) NULL AFTER ghiChu;

CREATE TABLE BaoGiang (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  buoiHocId BIGINT UNSIGNED NOT NULL,
  noiDungBaiHoc VARCHAR(2000) NULL,
  baiTap VARCHAR(2000) NULL,
  ghiChu VARCHAR(500) NULL,
  actorUserId BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_BaoGiang_buoiHocId (buoiHocId),
  CONSTRAINT FK_BaoGiang_BuoiHoc FOREIGN KEY (buoiHocId) REFERENCES BuoiHoc(id),
  CONSTRAINT FK_BaoGiang_NguoiDung FOREIGN KEY (actorUserId) REFERENCES NguoiDung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quyen moi cho module Hoc tap (G) - chua co san, khac diem_danh.* da seed tu Sprint 0.
INSERT INTO Quyen (maQuyen, tenQuyen, nhomQuyen, dangHoatDong, createdAt, updatedAt)
VALUES
  ('hoc_tap.xem', 'Xem báo giảng', 'Học tập', 1, NOW(), NOW()),
  ('hoc_tap.ghi_nhan', 'Ghi nhận báo giảng', 'Học tập', 1, NOW(), NOW());

-- Gan quyen: giao_vien va quan_ly_don_vi co ca hai; hoc_vu chi xem.
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q ON q.maQuyen IN ('hoc_tap.xem', 'hoc_tap.ghi_nhan')
WHERE vt.maVaiTro IN ('giao_vien', 'quan_ly_don_vi')
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q ON q.maQuyen = 'hoc_tap.xem'
WHERE vt.maVaiTro = 'hoc_vu'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;
