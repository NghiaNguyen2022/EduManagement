# Xoá file kết nối cũ

Sau khi dùng bộ code này, chỉ giữ:

```text
server/config/env.ts
server/db/connection.ts
server/scripts/checkDbConnection.ts
```

Xoá các file cũ nếu tồn tại:

```text
server/src/config/env.ts
server/src/db/index.ts
server/src/db/connection.ts
server/src/scripts/check-db.ts
server/db/index.ts
```

Không được tồn tại hai file `connection.ts` ở hai vị trí khác nhau.

Tìm toàn dự án các từ khoá:

```text
mysql.createPool(
createPool(
mysqlPool
getDbOrThrow
DATABASE_URL
```

Quy tắc:

- Chỉ `server/db/connection.ts` được gọi `mysql.createPool()`.
- Xoá helper `getDbOrThrow()` nếu nó chỉ trả về cùng một `db`.
- Không export `mysqlPool` cho repository/service/router.
- Không để repository tự tạo pool.
- Không để frontend kết nối trực tiếp MySQL.
- `DATABASE_URL` chỉ dùng cho Drizzle CLI trong `drizzle.config.ts`.
