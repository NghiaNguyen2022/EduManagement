# Chạy và triển khai hệ thống

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [Môi trường phát triển](#môi-trường-phát-triển)
- [Kiểm tra bản production](#kiểm-tra-bản-production)
- [Triển khai máy chủ](#triển-khai-máy-chủ)
- [Nguyên tắc an toàn](#nguyên-tắc-an-toàn)

## Môi trường phát triển

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

## Kiểm tra bản production

```powershell
pnpm build
$env:NODE_ENV="production"
pnpm start
```

Truy cập:

```text
http://localhost:3100
http://localhost:3100/api/health
```

## Triển khai máy chủ

Luồng đề xuất:

```text
Internet
  → Nginx 80/443
  → Node.js 127.0.0.1:3100
  → MySQL 127.0.0.1:3306
```

Không mở công khai các port:

```text
3100
3306
5173
```

Ở production chỉ Nginx mở 80/443.

## Nguyên tắc an toàn

- Không commit `.env.local` hoặc mật khẩu thật.
- Không dùng tài khoản và mật khẩu demo ở production.
- Chỉ Nginx được mở công khai; MySQL và Node.js chỉ lắng nghe ở mạng nội bộ.
- Chạy `pnpm typecheck`, `pnpm test` và `pnpm build` trước khi triển khai.
