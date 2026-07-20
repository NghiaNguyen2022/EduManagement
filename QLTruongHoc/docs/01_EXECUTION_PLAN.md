# PHƯƠNG ÁN THỰC THI

## Mô hình triển khai
Áp dụng Agile theo vertical slice. Mỗi sprint chọn một luồng nghiệp vụ hoàn chỉnh và triển khai đồng thời:

1. Phân tích quy trình và cập nhật BPD.
2. Chốt dữ liệu và quy tắc nghiệp vụ.
3. Tạo migration/schema MySQL.
4. Viết service, API, validation và phân quyền backend.
5. Xây UI và luồng thao tác frontend.
6. Test nghiệp vụ, quyền, multi-tenant, timezone và regression.
7. Cập nhật checklist, tài liệu và PROJECT_SUMMARY.

## Các sprint đề xuất

### Sprint 0 – Foundation
- Tạo project từ kiến trúc ResidenceCore.
- Multi-tenant `DonVi` và cây đơn vị.
- Đăng nhập, chọn đơn vị, quyền theo đơn vị.
- Shared appearance, layout, message box, date/time picker.
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

## Definition of Done cho mỗi chức năng
- Có quy trình nghiệp vụ được mô tả.
- Có quy tắc dữ liệu và trạng thái.
- Có migration/schema.
- Có API và phân quyền.
- Có UI desktop responsive, dễ thao tác.
- Có kiểm tra lỗi và thông báo chuẩn.
- Có test case chính.
- Checklist và tài liệu đã cập nhật.
