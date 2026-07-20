# Nguồn sự thật của Schema

## Quyết định

- `drizzle/schema.ts` và các file trong `drizzle/schemas/*.ts` là **nguồn sự thật duy nhất** cho cấu trúc bảng.
- Các file `database/001_*.sql` → `database/009_*.sql` là **lịch sử thao tác/triển khai thủ công** (reset, seed, patch một lần), không phải nguồn để đối chiếu cấu trúc bảng hiện tại. Không suy ngược cấu trúc bảng từ các file này — có thể đã lệch so với DB thật.
- Dự án hiện **chưa có baseline migration chính thức** (`drizzle/migrations/`) — toàn bộ trước giờ dùng `pnpm db:push` để đồng bộ trực tiếp từ `schema.ts` sang DB. Không chạy `pnpm db:generate` / `pnpm db:migrate` cho tới khi có quyết định thiết lập baseline, vì `db:generate` hiện sẽ tạo lại `CREATE TABLE` cho toàn bộ bảng (coi như chưa có migration nào từng chạy) thay vì chỉ phần thay đổi.

## Vì sao

- Đã từng lệch thật giữa hai nguồn: `docs/FIX_DRIZZLE_ENV.md` ghi nhận lỗi `Unknown column 'laVaiTroHeThong'` vì SQL viết tay không khớp `drizzle/schema.ts` tại thời điểm đó.
- `pnpm db:push` yêu cầu terminal tương tác thật (TTY) để xác nhận diff — không chạy được qua script nền/CI không tương tác. Khi thêm cột/bảng mới:
  1. Sửa `drizzle/schemas/*.ts` trước.
  2. Chạy `pnpm db:push` từ terminal cá nhân (không phải qua tiến trình chạy ngầm).
  3. Nếu không có terminal tương tác sẵn, viết ALTER TABLE tay thành file `database/0NN_*.sql` đánh số tiếp theo, áp dụng trực tiếp bằng `mysql` client, đảm bảo khớp đúng với `drizzle/schemas/*.ts` đã sửa.
- Cột `createdAt`/`updatedAt` trên DB thật đang có `DEFAULT CURRENT_TIMESTAMP` (từ SQL tay ban đầu), nhưng `drizzle/schema.ts` khai báo các cột này là `.notNull()` không kèm `.default(...)`. Việc này an toàn ở runtime vì DB tự điền, nhưng khiến TypeScript bắt buộc phải truyền giá trị khi insert. Toàn bộ repository hiện tại (`server/db/*.repository.ts`) đã truyền `createdAt`/`updatedAt` tường minh bằng helper `now()` — giữ nguyên cách này, không dựa vào `DEFAULT` của DB, để tránh lệch thêm lần nữa nếu sau này chạy `db:push` và Drizzle đồng bộ bỏ `DEFAULT` đó.

## Việc 009 — Khóa tạm đăng nhập sai nhiều lần (2026-07-20)

- Thêm `NguoiDung.soLanDangNhapSaiLienTiep` (int unsigned, mặc định 0) và `NguoiDung.khoaDangNhapDenLuc` (datetime, có thể null).
- Áp dụng bằng `database/009_add_login_lockout_fields.sql` (ALTER TABLE trực tiếp, không qua `db:generate` vì lý do nêu trên).
- Đã đồng bộ `drizzle/schemas/core.ts` khớp đúng hai cột trên.
