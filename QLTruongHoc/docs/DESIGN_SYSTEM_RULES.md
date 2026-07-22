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

## Link liên kết giữa các trang

Không dùng thẳng `<Link>`/`<a>` của react-router cho link tới một thực thể khác (học sinh,
lớp, chương trình, kỳ thu...). Dùng đúng 3 primitive dùng chung trong
`client/src/components/shared/`:

**`GuardedLink`** — điều hướng cùng tab tới trang trong **cùng đơn vị** đang đứng. Tự hỏi xác
nhận nếu trang hiện tại đang có thay đổi chưa lưu (`useUnsavedChangesGuard`).

```tsx
<GuardedLink to={`/classes/${item.id}`} className="text-button">
  <strong>{item.tenLop}</strong>
</GuardedLink>
```

**`EntityLink`** — dùng cho dòng dữ liệu trong bảng "xem gộp" ở đơn vị hệ thống (có kèm
`donVi`). Tự chọn: không có `donVi` (cùng đơn vị) → cùng tab như `GuardedLink`; có `donVi`
(đơn vị khác) → mở **tab mới**, tự chuyển sang đúng đơn vị đó rồi mới vào trang, vì trang chi
tiết luôn khoá theo đơn vị đang chọn.

```tsx
<EntityLink to={`/students/${student.id}`} donVi={student.donVi}>
  <strong>{student.hoTen}</strong>
</EntityLink>
```

**`OrgLink`** — ô cột "Đơn vị" trong bảng xem gộp. Luôn mở tab mới, chuyển hẳn sang đơn vị đó
(mặc định vào `/dashboard`, có thể chỉ định `to` sang đúng danh sách đang xem).

```tsx
<OrgLink donVi={item.donVi} to="/classes" />
```

**Vì sao mở tab mới khi khác đơn vị:** phiên đăng nhập dùng chung 1 cookie cho mọi tab, đổi
đơn vị ở tab hiện tại sẽ làm mất màn xem gộp đang xem. Mở tab mới giữ nguyên tab gốc; tab gốc
tự đồng bộ lại đúng đơn vị khi được focus lại (`AuthContext`), không cần thao tác gì thêm.
Không tự tạo cơ chế `window.open` tay trong page — luôn qua 2 component trên.

**Guard chưa lưu:** trang nào có form tạo/sửa gọi `useUnsavedChangesGuard(isDirty)` (từ
`client/src/features/navigation/UnsavedChangesContext`) với điều kiện dirty phù hợp (thường
so sánh `JSON.stringify(form) !== JSON.stringify(giá trị gốc)`). Không tự viết `beforeunload`
hay `confirm()` riêng trong page.

**Không phải chỗ nào cũng cần link** — chỉ link tên thực thể có trang chi tiết thật sự hữu ích
khi bấm vào (học sinh, lớp, chương trình, giáo viên, kỳ thu...). Các trường chỉ hiển thị dữ
liệu (số điện thoại, ghi chú, số tiền...) không cần link.

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
