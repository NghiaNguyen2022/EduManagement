-- ============================================================
-- QLTruongHoc - Repair Vietnamese UTF-8 seed data
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

USE SchoolCenter;

ALTER DATABASE SchoolCenter
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE DonVi
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE VaiTro
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE Quyen
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE NguoiDung
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

UPDATE DonVi
SET tenDonVi = 'Hệ thống quản lý giáo dục'
WHERE maDonVi = 'SYSTEM';

UPDATE DonVi
SET tenDonVi = 'Trung tâm Ngoại ngữ Quận 8'
WHERE maDonVi = 'TTNN-Q8';

UPDATE DonVi
SET tenDonVi = 'Trường Mầm non Hoa Nắng'
WHERE maDonVi = 'MN-HOA-NANG';

UPDATE VaiTro
SET
  tenVaiTro = 'Quản trị hệ thống',
  moTa = 'Quản trị toàn bộ nền tảng'
WHERE maVaiTro = 'quan_tri_he_thong';

UPDATE VaiTro
SET
  tenVaiTro = 'Quản lý đơn vị',
  moTa = 'Quản lý một trường hoặc trung tâm'
WHERE maVaiTro = 'quan_ly_don_vi';

UPDATE VaiTro
SET
  tenVaiTro = 'Nhân viên tuyển sinh',
  moTa = 'Tiếp nhận và quản lý hồ sơ tuyển sinh'
WHERE maVaiTro = 'tuyen_sinh';

UPDATE VaiTro
SET
  tenVaiTro = 'Nhân viên tư vấn',
  moTa = 'Tư vấn chương trình và khóa học'
WHERE maVaiTro = 'tu_van';

UPDATE VaiTro
SET
  tenVaiTro = 'Nhân viên học vụ',
  moTa = 'Quản lý lớp học, lịch học và tiến độ đào tạo'
WHERE maVaiTro = 'hoc_vu';

UPDATE VaiTro
SET
  tenVaiTro = 'Kế toán',
  moTa = 'Quản lý học phí, công nợ và phiếu thu'
WHERE maVaiTro = 'ke_toan';

UPDATE VaiTro
SET
  tenVaiTro = 'Giáo viên',
  moTa = 'Giảng dạy, điểm danh và đánh giá học tập'
WHERE maVaiTro = 'giao_vien';

UPDATE VaiTro
SET
  tenVaiTro = 'Phụ huynh',
  moTa = 'Truy cập cổng thông tin phụ huynh'
WHERE maVaiTro = 'phu_huynh';

UPDATE Quyen SET tenQuyen = 'Quản trị hệ thống', nhomQuyen = 'Hệ thống'
WHERE maQuyen = 'he_thong.quan_tri';

UPDATE Quyen SET tenQuyen = 'Xem đơn vị', nhomQuyen = 'Đơn vị'
WHERE maQuyen = 'don_vi.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý đơn vị', nhomQuyen = 'Đơn vị'
WHERE maQuyen = 'don_vi.quan_ly';

UPDATE Quyen SET tenQuyen = 'Xem người dùng', nhomQuyen = 'Người dùng'
WHERE maQuyen = 'nguoi_dung.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý người dùng', nhomQuyen = 'Người dùng'
WHERE maQuyen = 'nguoi_dung.quan_ly';

UPDATE Quyen SET tenQuyen = 'Xem phân quyền', nhomQuyen = 'Phân quyền'
WHERE maQuyen = 'phan_quyen.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý phân quyền', nhomQuyen = 'Phân quyền'
WHERE maQuyen = 'phan_quyen.quan_ly';

UPDATE Quyen SET tenQuyen = 'Xem tuyển sinh', nhomQuyen = 'Tuyển sinh'
WHERE maQuyen = 'tuyen_sinh.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý tuyển sinh', nhomQuyen = 'Tuyển sinh'
WHERE maQuyen = 'tuyen_sinh.quan_ly';

UPDATE Quyen SET tenQuyen = 'Xem học sinh', nhomQuyen = 'Học sinh'
WHERE maQuyen = 'hoc_sinh.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý học sinh', nhomQuyen = 'Học sinh'
WHERE maQuyen = 'hoc_sinh.quan_ly';

UPDATE Quyen SET tenQuyen = 'Xem lớp học', nhomQuyen = 'Lớp học'
WHERE maQuyen = 'lop_hoc.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý lớp học', nhomQuyen = 'Lớp học'
WHERE maQuyen = 'lop_hoc.quan_ly';

UPDATE Quyen SET tenQuyen = 'Xem điểm danh', nhomQuyen = 'Điểm danh'
WHERE maQuyen = 'diem_danh.xem';

UPDATE Quyen SET tenQuyen = 'Thực hiện điểm danh', nhomQuyen = 'Điểm danh'
WHERE maQuyen = 'diem_danh.thuc_hien';

UPDATE Quyen SET tenQuyen = 'Xem tài chính', nhomQuyen = 'Tài chính'
WHERE maQuyen = 'tai_chinh.xem';

UPDATE Quyen SET tenQuyen = 'Quản lý tài chính', nhomQuyen = 'Tài chính'
WHERE maQuyen = 'tai_chinh.quan_ly';

UPDATE NguoiDung
SET hoTen = 'Quản trị hệ thống'
WHERE tenDangNhap = 'admin';

SELECT
    maDonVi,
    tenDonVi
FROM DonVi
ORDER BY id;

SELECT
    maVaiTro,
    tenVaiTro
FROM VaiTro
ORDER BY id;
