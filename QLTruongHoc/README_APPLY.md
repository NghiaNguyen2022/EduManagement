# Fix Audit Date Field Vietnamese v0.1

## Nguyên nhân

Trang Nhật ký hệ thống vẫn dùng:

```html
<input type="date">
```

Trình duyệt tự hiển thị:

```text
mm/dd/yyyy
July
Clear
Today
```

nên không thể đảm bảo chuẩn tiếng Việt.

## Sửa

Chuyển `Từ ngày` và `Đến ngày` sang shared `DateField`.

Người dùng nhìn thấy:

```text
20/07/2026
```

API vẫn nhận:

```text
2026-07-20
```

## Áp dụng

Chép đè:

```text
client/src/pages/SystemAuditLogPage.tsx
```

Thêm vào `client/src/main.tsx`:

```ts
import "./styles/audit-date-field.css";
```

Sau đó:

```powershell
pnpm typecheck
pnpm dev
```

Refresh mạnh:

```text
Ctrl + F5
```
