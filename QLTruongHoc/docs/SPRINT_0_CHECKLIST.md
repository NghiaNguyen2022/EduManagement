# Sprint 0 — Nền tảng đa đơn vị

> Đối chiếu lại với code thật ngày 2026-07-20. Các mục `[ ]` bên dưới còn dở dang thật,
> không phải chưa được rà soát.

## Database
- [x] Cấu hình MySQL user `schoolcenter_app`.
- [x] Một pool kết nối duy nhất.
- [x] Schema `DonVi`.
- [x] Schema `NguoiDung` (đã bổ sung khóa tạm đăng nhập sai — Việc 009).
- [x] Schema `VaiTro` + `Quyen` + `VaiTroQuyen` (RBAC tách bảng quyền riêng, không chỉ enum vai trò).
- [x] Schema phân quyền người dùng theo đơn vị (`NguoiDungVaiTroDonVi`).
- [x] Schema mẫu `HocSinh`.
- [ ] Migration chính thức (`drizzle-kit generate`/`migrate`) — hiện chưa có baseline, xem `docs/SCHEMA_SOURCE_OF_TRUTH.md`.
- [x] Seed đơn vị gốc và quản trị viên đầu tiên (`pnpm db:seed:auth`).

## Backend
- [x] `server/config/env.ts`.
- [x] `server/db/connection.ts`.
- [x] `getDb()`.
- [x] Script `db:check`.
- [x] API `/api/health`.
- [x] Đăng nhập (`POST /api/auth/login`, có khóa tạm sau 5 lần sai liên tiếp).
- [x] Session lưu DB (`PhienDangNhap`, token hash, cookie httpOnly) thay JWT — quyết định ghi trong `docs/AUTH_DATABASE_NOTE.md`.
- [x] Chọn đơn vị làm việc (`POST /api/organizations/select`).
- [x] Middleware xác thực (`requireAuth`).
- [x] Middleware bắt buộc chọn đơn vị (`requireCurrentOrganization`) tương đương middleware `donViId`.
- [x] Phân quyền theo đơn vị (`requirePermission`).

## Frontend
- [x] Vite React tối thiểu.
- [x] Trang kiểm tra API/database.
- [x] Trang đăng nhập (`LoginPage.tsx`).
- [x] Trang chọn trường/trung tâm (`SelectOrganizationPage.tsx`).
- [x] Layout dùng chung (`AppShell`, `Sidebar`, `Topbar`).
- [x] Sidebar theo quyền (`appRoutes` lọc theo `permissions`).

## Tài liệu và kiểm thử
- [x] README chạy dự án.
- [x] Cleanup file cũ.
- [x] Project summary (khôi phục nội dung Sprint 0 sau khi bị ghi đè — 2026-07-20).
- [ ] Test cách ly dữ liệu theo `donViId` (chưa có test tự động; đã review code thủ công).
- [x] Test đăng nhập và chuyển đơn vị (test tay: đăng nhập, sai mật khẩu 5 lần → khóa tạm, chọn đơn vị — 2026-07-20).
