# Fix Drizzle không đọc `.env.local`

## Nguyên nhân

`drizzle.config.ts` trước đó dùng:

```ts
import "dotenv/config";
```

Cách này mặc định chỉ đọc `.env`, không chắc chắn đọc `.env.local`.

Do đó:

```powershell
pnpm db:push
```

báo:

```text
Thiếu DATABASE_URL trong .env.local hoặc biến môi trường hệ thống.
```

Schema chưa được cập nhật nên lệnh seed tiếp theo báo thiếu cột:

```text
Unknown column 'laVaiTroHeThong' in 'field list'
```

## Cách chạy lại

```powershell
pnpm db:push
pnpm db:seed:auth
```

Phải chạy đúng thứ tự.

## Kiểm tra `.env.local`

```env
DATABASE_URL="mysql://schoolcenter_app:MAT_KHAU_DA_ENCODE@localhost:3306/SchoolCenter"
```

Ký tự `@` trong mật khẩu phải đổi thành `%40` trong `DATABASE_URL`.

`DATABASE_PASSWORD` vẫn dùng mật khẩu thật, không encode.
