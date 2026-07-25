# Thông báo theo đúng lớp/học sinh — 2026-07-25

## Thay đổi

- Migration `027_add_thong_bao_structured_scope.sql` thêm `lopHocId` và
  `hocSinhId` vào `ThongBao`.
- Server xác thực lớp/học sinh thuộc đúng đơn vị khi tạo.
- Phạm vi phụ huynh được suy ra từ liên kết con và lớp đang học/bảo lưu.
- Truy vấn danh sách và xác nhận đã đọc cùng dùng một quy tắc kiểm soát.
- Form tạo thông báo dùng dropdown lớp/học sinh; server tự tạo nhãn hiển thị.
- Thông báo lớp/cá nhân cũ chỉ có `doiTuong` tự do không được mở cho phụ huynh.

## Migration

```powershell
pnpm db:migrate:sql 027_add_thong_bao_structured_scope.sql
```

Migration đã được áp dụng trên database dev ngày 2026-07-25.
