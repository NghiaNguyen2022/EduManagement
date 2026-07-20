# Cleanup cấu hình API URL cũ

Sau khi áp dụng patch này:

## Xóa khỏi `.env.local`

```env
VITE_API_BASE_URL="http://localhost:3000"
```

## Tìm toàn project

```text
VITE_API_BASE_URL
http://localhost:3000
http://127.0.0.1:3000
```

Quy tắc:

- Trong code frontend, mọi API phải gọi bằng `/api/...`.
- Không ghi cứng IP hoặc port backend trong React.
- `http://127.0.0.1:3000` chỉ được giữ trong `vite.config.ts` làm proxy development.
- Backend vẫn chạy port nội bộ `3000`.
- Production không chạy Vite port `5173`.

Ví dụ đúng:

```ts
fetch("/api/health");
fetch("/api/students");
```

Ví dụ sai:

```ts
fetch("http://localhost:3000/api/health");
fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`);
```
