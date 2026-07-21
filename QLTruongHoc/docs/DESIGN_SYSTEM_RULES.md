# Design System Rules

## Nguồn cấu hình

Mọi module phải bám:

```text
client/src/config/educationAppearance.ts
client/src/styles/theme.css
client/src/components/shared/
```

## Header

Dùng:

```tsx
<PageHeader
  title="Học sinh"
  subtitle="Quản lý hồ sơ và quá trình học tập"
/>
```

Không tự tạo `h1` và subtitle riêng trong page.

## Card thống kê

Dùng:

```tsx
<StatCard
  title="Học sinh đang học"
  value={486}
  note="Tăng 18 trong tháng"
  tone="primary"
/>
```

Không tự tạo card KPI bằng div riêng.

## Card nội dung

Dùng:

```tsx
<SectionCard
  title="Danh sách học sinh"
  subtitle="Dữ liệu theo đơn vị đang làm việc"
>
  ...
</SectionCard>
```

## Popup / Modal

Chỉ dùng đúng hai loại popup dùng chung, không tự viết modal riêng trong page:

**Thông báo** — đúng một hành động (đóng), dùng khi chỉ cần người dùng xác nhận đã đọc:

```tsx
<NotificationDialog
  open={showResult}
  title="Đã tạo tài khoản"
  message="Tên đăng nhập: 0912345678 · Mật khẩu tạm: Edu@123Qaz"
  tone="success"
  onClose={() => setShowResult(false)}
/>
```

**Xác nhận** — đúng hai hành động (chấp nhận / từ chối), mặc định focus vào nút **Từ chối**
để tránh bấm nhầm hành động khi nhấn Enter:

```tsx
<ConfirmDialog
  open={Boolean(pendingRemove)}
  title="Gỡ liên kết phụ huynh"
  message="Gỡ liên kết giữa học sinh và Nguyễn Văn A?"
  confirmLabel="Gỡ liên kết"
  danger
  busy={busy}
  onConfirm={() => void executeRemove()}
  onCancel={() => setPendingRemove(null)}
/>
```

`danger` đổi nút chấp nhận sang màu cảnh báo (`danger-button`) cho thao tác không thể hoàn
tác (khoá, xoá, gỡ liên kết...). Không dùng `alert()`/`confirm()` của trình duyệt.

## Phân trang

Dùng mặc định từ config:

```tsx
<Pagination
  page={page}
  totalItems={totalItems}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

Không ghi cứng `10`, `20`, `50` trong page.

## Màu sắc

Không ghi trực tiếp:

```css
color: #2f9ed8;
```

Phải dùng:

```css
color: var(--edu-color-primary);
```

## Shadow

Không ghi trực tiếp `box-shadow`.

Dùng class/template hoặc token:

```css
box-shadow: var(--edu-shadow-soft);
```

## Quy tắc mở rộng

Khi cần thêm theme mới:
1. Bổ sung token vào `educationAppearance.ts`.
2. Đồng bộ token CSS trong `theme.css`.
3. Component/page chỉ sử dụng token.
4. Không sửa từng page riêng lẻ.
