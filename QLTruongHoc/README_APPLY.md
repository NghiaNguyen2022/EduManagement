# Sprint 0C.4 — Nhật ký hệ thống

## Phạm vi

- Danh sách nhật ký hệ thống theo đơn vị hiện tại.
- Quản trị hệ thống xem được nhật ký toàn hệ thống.
- Lọc theo:
  - Từ khóa.
  - Nhóm hành động.
  - Mức độ.
  - Khoảng ngày.
- Phân trang.
- Xem chi tiết nội dung và dữ liệu JSON.
- API được bảo vệ bằng quyền.
- Menu `Nhật ký hệ thống`.
- Cập nhật PROJECT_SUMMARY và MASTER_CHECKLIST.

## API

```text
GET /api/audit-logs
GET /api/audit-logs/actions
GET /api/audit-logs/:id
```

## Áp dụng

Chép toàn bộ patch vào:

```text
D:\Source\Git\QLTruongHoc
```

Sau đó chạy:

```powershell
pnpm install
pnpm dev
```

Không thay đổi database.
