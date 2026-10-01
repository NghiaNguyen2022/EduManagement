-- ============================================================
-- QLTruongHoc
-- Mo rong HocSinhLopHocDanhGia:
-- - loaiDanhGia: them theo_thang/theo_quy/theo_nam (giu nguyen
--   giua_ky/cuoi_ky/khac) - danh gia dinh ky theo qua trinh, chu
--   yeu dung cho mam non thay vi chi 2 moc giua/cuoi ky.
-- - linhVucPhatTrien: 5 linh vuc phat trien theo Thong tu
--   17/2009/TT-BGDDT (sua doi boi TT 51/2020) - chi ap dung mam
--   non, de trong voi cac cap hoc khac.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE HocSinhLopHocDanhGia
  MODIFY COLUMN loaiDanhGia ENUM(
    'giua_ky',
    'cuoi_ky',
    'khac',
    'theo_thang',
    'theo_quy',
    'theo_nam'
  ) NOT NULL DEFAULT 'khac';

ALTER TABLE HocSinhLopHocDanhGia
  ADD COLUMN linhVucPhatTrien ENUM(
    'the_chat',
    'nhan_thuc',
    'ngon_ngu',
    'tinh_cam_ky_nang_xa_hoi',
    'tham_my'
  ) NULL AFTER loaiDanhGia;
