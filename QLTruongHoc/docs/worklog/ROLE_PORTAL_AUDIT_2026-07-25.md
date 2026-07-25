# Rà soát vai trò và Portal — 2026-07-25

## Ma trận quyền thực tế

| Vai trò | Quyền nghiệp vụ chính | Portal |
|---|---|---|
| `ke_toan` | `hoc_sinh.xem`, `tai_chinh.xem`, `tai_chinh.quan_ly` | `/portal/ke-toan` |
| `tu_van` | `hoc_sinh.xem`, `tuyen_sinh.xem`, `tuyen_sinh.quan_ly` | `/portal/tuyen-sinh` |
| `tuyen_sinh` | giống `tu_van` | `/portal/tuyen-sinh` |
| `hoc_vu` | học sinh, lớp, lịch, xem điểm danh/học tập | `/portal/hoc-vu` |
| `giao_vien` | xem học sinh/lớp, điểm danh, báo giảng | `/portal/giao-vien` |
| `phu_huynh` | không dùng quyền quản lý; xác thực theo liên kết con | `/portal/parent` |

## Sửa trong đợt rà soát

- Bổ sung mapping còn thiếu cho `tu_van`.
- Chuyển các vai trò nghiệp vụ tới Portal tương ứng sau đăng nhập.
- Thêm mục Portal riêng trong sidebar theo đúng mã vai trò.
- Chặn mở trực tiếp Portal của vai trò khác.
- `quan_ly_don_vi` chưa có Portal riêng nên tiếp tục dùng dashboard vận hành.
- Dashboard summary chỉ truy vấn nhóm số liệu người dùng thực sự có quyền xem.
- Portal kế toán hiển thị công nợ thật; Portal tư vấn/tuyển sinh hiển thị lead
  mới và học sinh thật; Portal học vụ hiển thị lớp, học sinh và lịch hôm nay.
- Portal giáo viên nối hồ sơ theo tài khoản, lớp được phân công và lịch dạy
  7 ngày tới; không dùng tổng số lớp toàn đơn vị làm số lớp phụ trách.

## Việc nối sâu tiếp theo

1. Kế toán: số kỳ thu mở, phiếu thu gần nhất, yêu cầu điều chỉnh.
2. Tư vấn/tuyển sinh: lead cần chăm sóc và tỷ lệ chuyển đổi.
3. Học vụ: lịch cần xử lý và đơn xin phép.
4. Giáo viên: số buổi chưa điểm danh/báo giảng.

Portal không được cấp thêm quyền. Mọi API vẫn phải kiểm tra quyền ở server.
