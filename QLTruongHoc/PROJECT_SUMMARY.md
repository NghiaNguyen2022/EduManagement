# PROJECT SUMMARY — QLTruongHoc / SchoolCenter

> Tài liệu này là **append-only**: ghi thêm theo thời gian, không xóa lịch sử cũ (quy tắc
> tại `docs/TRACKING_RULE.md`). Ngày 2026-07-20 phát hiện file này đã bị các patch UI gần
> nhất (Date Picker Premium v0.2, Audit Filter Layout) ghi đè mất toàn bộ nội dung Sprint 0
> (nền tảng đa đơn vị, auth, RBAC, audit log) — vi phạm đúng quy tắc "không ghi đè bằng bản
> cũ". Đã khôi phục lại nội dung Sprint 0 bên dưới dựa trên review code thật, giữ nguyên hai
> mục patch UI đã có, và thêm mục Việc 009 cho lần sửa này.

---

## Sprint 0 — Nền tảng đa đơn vị (khôi phục 2026-07-20)

**Trạng thái:** Auth + RBAC + audit log backend/frontend đã chạy được. Còn thiếu: UI quản lý
cây đơn vị (CRUD `DonVi`), migration chính thức, test tự động.

### Database
- `DonVi` (cây đơn vị: `donViChaId`, `loaiDonVi`, `loaiHinhDaoTao`, `trangThai`).
- `NguoiDung`, `VaiTro`, `Quyen`, `VaiTroQuyen`, `NguoiDungVaiTroDonVi` — RBAC tách bảng
  quyền riêng thay vì nhồi vào enum vai trò như bản nháp SQL ban đầu.
- `PhienDangNhap` — session lưu DB (token hash SHA-256, không lưu token thô), có
  `donViHienTaiId` để nhớ đơn vị đang chọn.
- `NhatKyHeThong` — audit log, có `donViId` để cách ly theo đơn vị.
- Việc 009 (2026-07-20): thêm `NguoiDung.soLanDangNhapSaiLienTiep` và
  `NguoiDung.khoaDangNhapDenLuc` cho khóa tạm đăng nhập sai nhiều lần.
- Nguồn sự thật schema: `drizzle/schema.ts` — xem `docs/SCHEMA_SOURCE_OF_TRUTH.md`.

### Backend (`server/`)
- Đăng nhập/đăng xuất/đổi mật khẩu (`auth.service.ts`, `auth.router.ts`), cookie
  `httpOnly` + `sameSite=lax` + `secure` khi production.
- Middleware `requireAuth`, `requireCurrentOrganization`, `requirePermission` — chặn đúng
  theo đơn vị đang chọn và mã quyền (`quyen.maQuyen`), có bypass cho `he_thong.quan_tri`.
- Quản lý người dùng: tạo tài khoản, khóa/mở, reset mật khẩu, thu hồi toàn bộ phiên khi
  khóa/reset (`user.service.ts`, `user.router.ts`).
- Quản lý vai trò/quyền: `role.service.ts`, `role.router.ts` — sửa quyền của vai trò
  phạm vi hệ thống (`phamVi = "he_thong"`) bị chặn nếu người thao tác không có
  `he_thong.quan_tri`.
- Gán vai trò theo đơn vị cho người dùng (`user-assignment.service.ts`), có chặn tự xóa
  vai trò cuối cùng của chính tài khoản đang đăng nhập tại đơn vị hiện tại.
- Audit log cách ly theo đơn vị: quản trị hệ thống xem toàn bộ, người khác chỉ xem log
  của đơn vị mình (`audit-log.service.ts`).
- Việc 009 (2026-07-20): khóa tạm tài khoản 15 phút sau 5 lần đăng nhập sai liên tiếp,
  tự reset khi lock hết hạn hoặc đăng nhập đúng.

### Frontend (`client/`)
- `AuthContext`/`authApi` quản lý phiên qua cookie, tự gọi `/api/auth/me` khi mở app.
- `LoginPage`, `SelectOrganizationPage`, `ChangePasswordPage`.
- `AppShell`/`Sidebar`/`Topbar`/`OrganizationSelector` — layout dùng chung, đổi đơn vị
  ngay trên topbar không cần đăng xuất.
- `appRoutes.tsx` định nghĩa menu kèm `permissions`, lọc hiển thị theo quyền của đơn vị
  hiện tại (chỉ là lọc UX; chặn thật vẫn ở backend).
- `UserManagementPage`, `RolePermissionPage`, `SystemAuditLogPage`.

### Đã sửa ngày 2026-07-20 (rà soát bảo mật + dọn nợ kỹ thuật)
- Gỡ tài khoản/mật khẩu mặc định điền sẵn trong `LoginPage.tsx`.
- `getOrganizationsForUser` lọc thêm `donVi.trangThai = 'hoat_dong'` — đơn vị bị tạm
  ngưng/ngừng hoạt động không còn hiện ra để chọn.
- `role.service.ts` chặn sửa quyền vai trò hệ thống theo `phamVi` thay vì so khớp cứng
  một mã vai trò — tránh sót vai trò hệ thống khác thêm sau này.
- Thêm khóa tạm đăng nhập sai nhiều lần (xem Database/Backend ở trên).
- Sửa lỗi `pnpm typecheck`/`pnpm build` từng fail sẵn trước đó (không liên quan các mục
  trên, phát hiện khi verify): thiếu `createdAt`/`updatedAt` khi insert ở
  `audit.repository.ts`, `role.repository.ts`, `user-assignment.repository.ts`; sai kiểu
  `Pool` giữa `mysql2` và `mysql2/promise` trong `connection.ts`; thiếu
  `DATABASE_CONNECTION_LIMIT` trong `env.ts`; prop `action`/`actions` không khớp giữa
  `PageHeader` và `SectionCard` ở `DashboardPage.tsx`.
- Test tay: `pnpm typecheck` và `pnpm build` pass; chạy server thật, xác nhận khóa tài
  khoản đúng sau 5 lần đăng nhập sai, mở khóa lại đúng.

---

## Date Picker Premium v0.2

### DateField
- Hỗ trợ nhập tay dd/mm/yyyy.
- Hỗ trợ chọn từ calendar popup.
- Icon lịch nằm trong input.
- Popup premium giống mẫu tham chiếu.
- Điều hướng tháng trước/sau.
- Điều hướng năm trước/sau.
- Tuần hiển thị CN → T7.
- Ngày ngoài tháng hiển thị mờ.
- Ngày hiện tại có chỉ báo.
- Ngày đang chọn nền primary.
- Có Hôm nay và Xóa.
- Hỗ trợ min/max.
- Giá trị gửi API vẫn yyyy-mm-dd.

### Audit Log
- Từ ngày và Đến ngày dùng DateField mới.
- Bỏ help text thừa.
- Bộ lọc gọn hơn.

---

## Audit Filter Layout Fix

- Tách bộ lọc thành hai hàng rõ ràng.
- Hàng 1: Tìm kiếm, Hành động, Mức độ.
- Hàng 2: Từ ngày, Đến ngày, Xóa lọc, Áp dụng.
- Không còn chồng lấn control.
- Responsive tablet/mobile.
