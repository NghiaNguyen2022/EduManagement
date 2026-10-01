# Phương án triển khai

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [Mô hình triển khai](#mô-hình-triển-khai)
- [Các sprint đề xuất](#các-sprint-đề-xuất)
- [Tiêu chí hoàn thành chức năng](#tiêu-chí-hoàn-thành-chức-năng)

## Mô hình triển khai
Áp dụng Agile theo từng luồng nghiệp vụ hoàn chỉnh. Mỗi sprint triển khai đồng thời:

1. Phân tích quy trình và cập nhật BPD.
2. Chốt dữ liệu và quy tắc nghiệp vụ.
3. Tạo migration/schema MySQL.
4. Viết lớp nghiệp vụ, API, kiểm tra dữ liệu và phân quyền phía máy chủ.
5. Xây giao diện và luồng thao tác phía người dùng.
6. Kiểm thử nghiệp vụ, quyền, cách ly đơn vị, múi giờ và các chức năng liên quan.
7. Cập nhật checklist, tài liệu và PROJECT_SUMMARY.

## Các sprint đề xuất

### Sprint 0 – Foundation
- Tạo project từ kiến trúc ResidenceCore.
- Multi-tenant `DonVi` và Danh mục đơn vị.
- Đăng nhập, chọn đơn vị, quyền theo đơn vị.
- Giao diện dùng chung, bố cục, hộp thoại và bộ chọn ngày giờ.
- Audit log và các danh mục lõi.

### Sprint 1 – Tuyển sinh và ghi danh
- Khách hàng tiềm năng.
- Hồ sơ tư vấn.
- Đăng ký nhập học.
- Tạo học sinh và liên kết phụ huynh.
- Sinh tài khoản phụ huynh.

### Sprint 2 – Chương trình, lớp và xếp lớp
- Chương trình đào tạo, khóa học.
- Lớp học, giáo viên, phòng học.
- Xếp lớp và lịch sử chuyển lớp.

### Sprint 3 – Lịch học và điểm danh
- Lịch học lặp lại.
- Buổi học thực tế.
- Điểm danh, xin phép, nghỉ học, học bù.
- Portal lịch học cho giáo viên và phụ huynh.

### Sprint 4 – Báo giảng và tiến độ học tập
- Báo giảng.
- Nội dung bài học.
- Đánh giá/kết quả.
- Tiến độ theo loại hình đào tạo.

### Sprint 5 – Kỳ thu và học phí
- Danh mục khoản thu.
- Kỳ thu và áp dụng cho học sinh/lớp.
- Thu tiền, công nợ, miễn giảm, biên nhận.

### Sprint 6 – Thông báo và trao đổi
- Thông báo theo phạm vi.
- Xác nhận đã đọc.
- Trao đổi phụ huynh – giáo viên.

### Sprint 7 – Nghiệp vụ chuyên biệt
- Mầm non: đón/trả trẻ, sức khỏe, ăn ngủ, theo dõi phát triển.
- Ngoại ngữ: kiểm tra đầu vào, cấp độ, kỹ năng, kết quả khóa học.

## Tiêu chí hoàn thành chức năng
- Có quy trình nghiệp vụ được mô tả.
- Có quy tắc dữ liệu và trạng thái.
- Có migration/schema.
- Có API và phân quyền.
- Có UI desktop responsive, dễ thao tác.
- Có kiểm tra lỗi và thông báo chuẩn.
- Có test case chính.
- Checklist và tài liệu đã cập nhật.
