# TEST STRATEGY

## Bắt buộc cho mọi sprint
- Kiểm tra dữ liệu không lọt giữa hai đơn vị.
- Kiểm tra quyền theo vai trò và đơn vị.
- Kiểm tra trạng thái không hợp lệ.
- Kiểm tra ngày giờ theo Asia/Ho_Chi_Minh.
- Kiểm tra dữ liệu lịch sử không bị ghi đè.
- Kiểm tra luồng portal chỉ thấy học sinh được liên kết.
- Kiểm tra regression các chức năng sprint trước.

## Test ưu tiên cao
1. Người dùng có quyền ở nhiều đơn vị và chuyển đúng context.
2. Phụ huynh có nhiều con ở cùng hoặc khác đơn vị.
3. Học sinh chuyển lớp nhưng giữ lịch sử.
4. Lịch học không trùng giáo viên/phòng.
5. Điểm danh chỉ dành cho học sinh đang thuộc lớp tại ngày học.
6. Kỳ thu không áp dụng sai học sinh đã nghỉ hoặc chưa nhập học.
7. Phiếu thu từng phần cập nhật đúng công nợ.
