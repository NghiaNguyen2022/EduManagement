-- ============================================================
-- QLTruongHoc
-- I05: đối tượng thông báo có cấu trúc, dùng để kiểm soát đúng phạm vi
-- lớp/học sinh cho Portal phụ huynh.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE ThongBao
  ADD COLUMN lopHocId BIGINT UNSIGNED NULL AFTER phamVi,
  ADD COLUMN hocSinhId BIGINT UNSIGNED NULL AFTER lopHocId,
  ADD KEY IX_ThongBao_lopHocId (lopHocId),
  ADD KEY IX_ThongBao_hocSinhId (hocSinhId),
  ADD CONSTRAINT FK_ThongBao_LopHoc
    FOREIGN KEY (lopHocId) REFERENCES LopHoc(id),
  ADD CONSTRAINT FK_ThongBao_HocSinh
    FOREIGN KEY (hocSinhId) REFERENCES HocSinh(id);

