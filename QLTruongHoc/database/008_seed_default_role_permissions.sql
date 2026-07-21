-- ============================================================
-- QLTruongHoc
-- Default role permission matrix
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE SchoolCenter;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM VaiTroQuyen;

-- 1. Quản trị hệ thống: toàn bộ quyền
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
CROSS JOIN Quyen q
WHERE vt.maVaiTro = 'quan_tri_he_thong'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 2. Quản lý đơn vị
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q
  ON q.maQuyen IN (
    'don_vi.xem',
    'don_vi.quan_ly',
    'nguoi_dung.xem',
    'nguoi_dung.quan_ly',
    'phan_quyen.xem',
    'tuyen_sinh.xem',
    'tuyen_sinh.quan_ly',
    'hoc_sinh.xem',
    'hoc_sinh.quan_ly',
    'lop_hoc.xem',
    'lop_hoc.quan_ly',
    'diem_danh.xem',
    'diem_danh.thuc_hien',
    'hoc_tap.xem',
    'hoc_tap.ghi_nhan',
    'tai_chinh.xem',
    'tai_chinh.quan_ly'
  )
WHERE vt.maVaiTro = 'quan_ly_don_vi'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 3. Tuyển sinh
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q
  ON q.maQuyen IN (
    'tuyen_sinh.xem',
    'tuyen_sinh.quan_ly',
    'hoc_sinh.xem'
  )
WHERE vt.maVaiTro = 'tuyen_sinh'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 4. Tư vấn
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q
  ON q.maQuyen IN (
    'tuyen_sinh.xem',
    'hoc_sinh.xem'
  )
WHERE vt.maVaiTro = 'tu_van'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 5. Học vụ
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q
  ON q.maQuyen IN (
    'hoc_sinh.xem',
    'hoc_sinh.quan_ly',
    'lop_hoc.xem',
    'lop_hoc.quan_ly',
    'diem_danh.xem',
    'hoc_tap.xem'
  )
WHERE vt.maVaiTro = 'hoc_vu'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 6. Kế toán
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q
  ON q.maQuyen IN (
    'hoc_sinh.xem',
    'tai_chinh.xem',
    'tai_chinh.quan_ly'
  )
WHERE vt.maVaiTro = 'ke_toan'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 7. Giáo viên
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT vt.id, q.id
FROM VaiTro vt
JOIN Quyen q
  ON q.maQuyen IN (
    'hoc_sinh.xem',
    'lop_hoc.xem',
    'diem_danh.xem',
    'diem_danh.thuc_hien',
    'hoc_tap.xem',
    'hoc_tap.ghi_nhan'
  )
WHERE vt.maVaiTro = 'giao_vien'
  AND vt.dangHoatDong = 1
  AND q.dangHoatDong = 1;

-- 8. Phụ huynh
-- Hiện chưa có quyền portal riêng trong baseline.
-- Tạm thời không gán quyền quản trị nội bộ.

SET FOREIGN_KEY_CHECKS = 1;

SELECT
  vt.maVaiTro,
  vt.tenVaiTro,
  COUNT(vtq.quyenId) AS soQuyen
FROM VaiTro vt
LEFT JOIN VaiTroQuyen vtq
  ON vtq.vaiTroId = vt.id
GROUP BY
  vt.id,
  vt.maVaiTro,
  vt.tenVaiTro
ORDER BY vt.id;
