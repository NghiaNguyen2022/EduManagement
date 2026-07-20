# Cấu hình port

## App Lưu Xá

```text
API: 3000
```

## App Quản lý Trường học

```text
API development/production nội bộ: 3100
Frontend development: 5173
```

Frontend gọi API bằng đường dẫn tương đối:

```text
/api/*
```

Vite proxy:

```text
/api/* → http://127.0.0.1:3100
```

## `.env.local`

Trong thư mục gốc `QLTruongHoc`:

```env
PORT="3100"
```

Không sửa port trực tiếp trong `server/index.ts`. Backend luôn đọc từ:

```text
server/config/env.ts
→ process.env.PORT
```

## Chạy development

```powershell
pnpm dev
```

Truy cập:

```text
Frontend: http://localhost:5173
API trực tiếp: http://localhost:3100
Health qua frontend: http://localhost:5173/api/health
```

## Chạy production local

```powershell
pnpm build
$env:NODE_ENV="production"
pnpm start
```

Truy cập:

```text
Ứng dụng: http://localhost:3100
API: http://localhost:3100/api/health
```
