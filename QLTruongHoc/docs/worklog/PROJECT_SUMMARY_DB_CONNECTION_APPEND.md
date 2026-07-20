## Sprint 0.1 — Chuẩn hóa kết nối MySQL theo ResidenceCore

- Dùng một biến môi trường `DATABASE_URL` tại root.
- Dùng một điểm truy cập duy nhất `server/db/connection.ts`.
- Repository gọi `await getDb()` hoặc `await getDbOrThrow()`.
- Không tạo pool trong từng module.
- Drizzle CLI và runtime dùng cùng `DATABASE_URL`.
- User database mặc định: `schoolcenter_app@localhost`.
- Database: `SchoolCenter`.
- Charset: `utf8mb4`.
- Timezone session: `+07:00`.
- Có script `db:check` để kiểm tra runtime.

Trạng thái: prepared; chờ chép vào code thực tế, npm install và runtime test.
