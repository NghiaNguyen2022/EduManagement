# 16L8.12 — Fix đọc giờ TIMESTAMP Cửa hàng

## Dữ liệu thực tế
Ca sáng đang lưu:

- accessValidFrom = 2026-07-21 00:00:00 UTC
- accessValidUntil = 2026-07-21 07:00:00 UTC

Tương ứng giờ Việt Nam:

- 07:00
- 14:00

## Nguyên nhân
Code trước đó lại trừ thêm 7 giờ khi đọc TIMESTAMP, làm ca sáng bị hiểu thành:

- 17:00 ngày hôm trước
- 00:00 cùng ngày

nên 11:32 vẫn bị báo ngoài giờ.

## Sửa
- Đọc TIMESTAMP trực tiếp bằng `new Date(...)`.
- Không trừ thêm 7 giờ.
- Áp dụng cho:
  - kiểm tra đang trong ca;
  - thời điểm hết phiên;
  - timeout 30 phút.

## Áp dụng
Replace:

`server/services/storeDutyAccessService.ts`

Sau đó:

```bash
pnpm check
pnpm dev
```

Không sửa dữ liệu DB. Không chạy thêm UPDATE giờ.
