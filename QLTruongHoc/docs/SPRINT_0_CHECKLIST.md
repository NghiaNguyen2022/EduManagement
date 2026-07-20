# Sprint 0 — Nền tảng đa đơn vị

## Database
- [x] Cấu hình MySQL user `schoolcenter_app`.
- [x] Một pool kết nối duy nhất.
- [x] Schema `DonVi`.
- [x] Schema `NguoiDung`.
- [x] Schema `VaiTro`.
- [x] Schema phân quyền người dùng theo đơn vị.
- [x] Schema mẫu `HocSinh`.
- [ ] Migration chính thức.
- [ ] Seed đơn vị gốc và quản trị viên đầu tiên.

## Backend
- [x] `server/config/env.ts`.
- [x] `server/db/connection.ts`.
- [x] `getDb()`.
- [x] Script `db:check`.
- [x] API `/api/health`.
- [ ] Đăng nhập.
- [ ] JWT/session.
- [ ] Chọn đơn vị làm việc.
- [ ] Middleware xác thực.
- [ ] Middleware `donViId`.
- [ ] Phân quyền theo đơn vị.

## Frontend
- [x] Vite React tối thiểu.
- [x] Trang kiểm tra API/database.
- [ ] Trang đăng nhập.
- [ ] Trang chọn trường/trung tâm.
- [ ] Layout dùng chung.
- [ ] Sidebar theo quyền.

## Tài liệu và kiểm thử
- [x] README chạy dự án.
- [x] Cleanup file cũ.
- [x] Project summary.
- [ ] Test cách ly dữ liệu theo `donViId`.
- [ ] Test đăng nhập và chuyển đơn vị.
