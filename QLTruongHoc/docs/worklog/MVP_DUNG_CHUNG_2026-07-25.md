# MVP dùng chung — nền tảng an toàn dữ liệu (2026-07-25)

## Phạm vi

Ưu tiên nền tảng dùng chung cho cả trung tâm ngoại ngữ và trường mầm non trước
khi mở rộng nghiệp vụ chuyên ngành.

## Đã thực hiện

- Thêm test runner bằng Node.js (`pnpm test`), không phụ thuộc database.
- Tách logic cấp quyền thành hàm thuần và kiểm thử:
  - quyền chỉ lấy từ context đơn vị hiện tại;
  - `he_thong.quan_tri` được phép qua yêu cầu quyền;
  - vai trò `phu_huynh` chỉ được bypass tại endpoint khai báo rõ.
- Khóa phạm vi thông báo phụ huynh ở server:
  - chỉ trả thông báo `toan_truong` thuộc đơn vị có con đang học;
  - không cho xác nhận đã đọc thông báo của đơn vị khác;
  - không trả hoặc xác nhận thông báo `theo_lop`/`ca_nhan` khi `doiTuong`
    còn là văn bản tự do.
- Thêm bộ chuyển đổi thời gian cố định `Asia/Ho_Chi_Minh`, không phụ thuộc
  timezone máy chạy.
- Áp dụng thời gian nghiệp vụ cho xác thực/phiên, audit, điểm danh, xin phép,
  tài chính và thông báo.

## Xác minh

- `pnpm test`: PASS (7 test).
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS.

## Việc tiếp theo

1. Migration thông báo: thay `doiTuong` tự do bằng `lopHocId`/`hocSinhId`, sau
   đó mở lại thông báo lớp/cá nhân cho đúng phụ huynh.
2. Mở rộng helper timezone sang các repository còn lại.
3. Bổ sung integration test có database cho cách ly multi-tenant.
4. Triển khai Portal giáo viên và hai báo cáo dùng chung.
