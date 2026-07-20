INSERT INTO VaiTro (maVaiTro, tenVaiTro, moTa, phamVi) VALUES
('platform_admin', 'Quản trị nền tảng', 'Quản trị toàn hệ thống và cây đơn vị', 'he_thong'),
('unit_admin', 'Quản lý đơn vị', 'Quản lý toàn bộ nghiệp vụ trong đơn vị', 'don_vi'),
('admissions', 'Tuyển sinh', 'Tiếp nhận, tư vấn và ghi danh', 'don_vi'),
('academic_officer', 'Học vụ', 'Quản lý lớp, lịch học và học sinh', 'don_vi'),
('accountant', 'Kế toán', 'Quản lý kỳ thu, học phí và công nợ', 'don_vi'),
('teacher', 'Giáo viên', 'Giảng dạy, điểm danh, báo giảng và đánh giá', 'don_vi'),
('parent', 'Phụ huynh', 'Theo dõi thông tin của học sinh được liên kết', 'don_vi');

-- Dữ liệu mẫu chỉ để phát triển local; không dùng cho production.
INSERT INTO DonVi (maDonVi, tenDonVi, loaiDonVi, loaiHinhDaoTao, capDo, duongDanCay)
VALUES ('SYSTEM', 'Hệ thống quản lý giáo dục', 'he_thong', 'khac', 0, '/SYSTEM');
