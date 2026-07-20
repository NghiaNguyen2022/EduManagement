# PROJECT SUMMARY — QLTruongHoc

## Sprint 0A — PASS
- Database, API health, Vite, same-host production.
- API port 3100.
- UI shell và design system.

## Sprint 0B.1 — PASS
- Auth database foundation.
- UTF-8 database baseline.

## Sprint 0B.2 — Runtime
- Login/logout/me.
- Session database.
- Cookie httpOnly.
- Chọn đơn vị.

## Sprint 0B.3 — Runtime
- Đổi mật khẩu bắt buộc.
- Audit auth.
- Permission middleware.

## Sprint 0C.1 — Đã triển khai
- Quản lý người dùng.

## Sprint 0C.2 — Đã triển khai
- Sidebar theo quyền.
- User/session hardening.

## Sprint 0C.3 — Đã triển khai
- Vai trò và phân quyền.
- Bộ quyền mặc định theo vai trò.
- Điều chỉnh quyền nâng cao.

## Sprint 0C.4 — Đang triển khai
- Nhật ký hệ thống.
- Lọc theo hành động, mức độ, ngày và từ khóa.
- Phân trang.
- Chi tiết audit log.
- System admin xem toàn hệ thống.
- User quản lý đơn vị chỉ xem nhật ký đơn vị hiện tại.

## Quy tắc được bảo vệ
- Nhật ký không chứa mật khẩu hoặc token thô.
- User thường không được xem nhật ký đơn vị khác.
- System admin được xem nhật ký toàn hệ thống.
- Nhật ký chỉ đọc, không sửa hoặc xóa trên UI.
- Thời gian hiển thị theo Asia/Ho_Chi_Minh.

## Tiếp theo
- Runtime test Sprint 0C.4.
- Quản lý nhiều vai trò cho một user.
- Quản lý user đa đơn vị.
- Bắt đầu Sprint 1 — Hồ sơ tuyển sinh.
