# Gói triển khai QLTruongHoc

Gói này chỉ chứa thành phần cần thiết để chạy production. Không chứa source
TypeScript/React, test, tài liệu nội bộ, `.git` hoặc mật khẩu.

## Nội dung

- `dist-client/`: frontend đã build cho `/app-portal/edu-management/`.
- `dist-server/`: backend Node.js đã biên dịch.
- `deploy/ecosystem.config.cjs`: cấu hình PM2.
- `deploy/nginx/`: cấu hình reverse proxy mẫu.
- `deploy/env.production.example`: mẫu biến môi trường.
- `package.json`, `pnpm-lock.yaml`: cài dependency production.
- `uploads/README.txt`: giữ thư mục upload; có thể xóa file này sau khi giải nén.

## Khởi động nhanh

```bash
cp deploy/env.production.example .env.local
nano .env.local
corepack enable
pnpm install --prod --frozen-lockfile
pm2 start deploy/ecosystem.config.cjs
```

Ứng dụng phải chạy nội bộ tại `http://127.0.0.1:3100`. Sau đó mới cấu hình
Nginx cho URL công khai.

