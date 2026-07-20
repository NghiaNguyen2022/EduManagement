# Chạy và triển khai

## Development

```powershell
pnpm install
pnpm dev
```

Truy cập:

```text
http://localhost:5173
```

Máy khác trong LAN:

```text
http://IP_MAY_CHAY:5173
```

API qua cùng địa chỉ:

```text
http://IP_MAY_CHAY:5173/api/health
```

## Test production trên Windows

```powershell
pnpm build
$env:NODE_ENV="production"
pnpm start
```

Truy cập:

```text
http://localhost:3000
http://localhost:3000/api/health
```

## VPS

Luồng đề xuất:

```text
Internet
  → Nginx 80/443
  → Node.js 127.0.0.1:3000
  → MySQL 127.0.0.1:3306
```

Không mở công khai các port:

```text
3000
3306
5173
```

Ở production chỉ Nginx mở 80/443.
