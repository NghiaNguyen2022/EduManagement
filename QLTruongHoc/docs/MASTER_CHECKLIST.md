# MASTER CHECKLIST — Patch theo tính năng

> File này track checklist theo từng patch UI riêng lẻ. Checklist tổng toàn dự án nằm ở
> `docs/00_MASTER_CHECKLIST.md` — tham khảo file đó cho tiến độ Sprint 0-7. File này đã bị
> ghi đè mất các mục trước Date Picker Premium; xem `PROJECT_SUMMARY.md` để biết lịch sử
> đầy đủ.

## Date Picker Premium

- [x] Text input dd/mm/yyyy.
- [x] Calendar trigger inside input.
- [x] Premium popup.
- [x] Vietnamese month label.
- [x] Vietnamese weekday label.
- [x] Previous/next month.
- [x] Previous/next year.
- [x] Current day indicator.
- [x] Selected day state.
- [x] Outside-month state.
- [x] Today action.
- [x] Clear action.
- [x] Min/max validation.
- [x] Click outside closes.
- [x] Audit Log integrated.
- [ ] Runtime test desktop.
- [ ] Runtime test mobile.
- [ ] User confirms PASS.

## Việc 009 — Hardening bảo mật Sprint 0 (2026-07-20)

- [x] Gỡ tài khoản/mật khẩu mặc định điền sẵn ở `LoginPage.tsx`.
- [x] `getOrganizationsForUser` lọc `donVi.trangThai = 'hoat_dong'`.
- [x] `role.service.ts` chặn sửa quyền vai trò hệ thống theo `phamVi` thay vì mã vai trò cứng.
- [x] Khóa tạm tài khoản sau 5 lần đăng nhập sai liên tiếp, tự mở sau 15 phút.
- [x] Migration `database/009_add_login_lockout_fields.sql` áp dụng vào DB dev, đối chiếu
      khớp với `drizzle/schemas/core.ts`.
- [x] Sửa lỗi `pnpm typecheck`/`pnpm build` fail sẵn trước đó (thiếu `createdAt`/`updatedAt`
      khi insert, sai kiểu `Pool`, thiếu `DATABASE_CONNECTION_LIMIT`, prop `action` sai ở
      `DashboardPage.tsx`).
- [x] `pnpm typecheck` pass.
- [x] `pnpm build` pass.
- [x] Test tay runtime: 5 lần đăng nhập sai → khóa tạm đúng thông báo; đăng nhập đúng khi
      đang khóa vẫn bị chặn; reset lại trạng thái test trên tài khoản `admin` thật sau khi
      test xong.
- [ ] User xác nhận PASS.
