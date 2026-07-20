# PROJECT SUMMARY — QLTruongHoc

## Sprint 0D.1 — Architecture Foundation

### Shared UI Components
- Chuẩn hóa FormField.
- Chuẩn hóa TextField.
- Chuẩn hóa SelectField.
- Chuẩn hóa DateField.
- Chuẩn hóa DateTimeField.
- Chuẩn hóa CurrencyInput.
- Các component dùng token từ `formAppearance.ts`.
- Mục tiêu: tái sử dụng và cấu hình template toàn hệ thống.

### User Aggregation
- API user trả mỗi người đúng một record.
- Nhiều vai trò được gom vào `roles[]`.
- UI hiển thị nhiều role badge trong một dòng.
- Không còn lặp người dùng theo assignment.

### Routing
- React Router.
- Mỗi menu có URL riêng.
- Reload giữ nguyên trang.
- Browser Back/Forward hoạt động.
- Menu dùng NavLink.
- Route guard vẫn giữ login/change-password/select-organization.

## Quyết định được bảo vệ
- Không tạo control riêng lẻ trong từng page nếu đã có shared component.
- Mọi input ngày giờ phải dùng shared date/time component.
- Input tiền phải dùng CurrencyInput.
- Confirm phải dùng ConfirmDialog.
- Mỗi page có route riêng.
- Sidebar không lưu trạng thái trang bằng local state.
- User list luôn aggregate theo user ID.

## Tiếp theo
- Runtime test Sprint 0D.1.
- Chuyển các page cũ sang shared form components.
- Thêm RoutePermissionGuard.
- Bắt đầu Sprint 1 — Tuyển sinh.
