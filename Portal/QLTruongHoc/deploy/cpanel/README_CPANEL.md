# Triển khai bằng CloudLinux Setup Node.js App

## Thông số tạo ứng dụng

- Node.js version: `22.23.0`
- Application mode: `Production`
- Application root: `apps/edu-management`
- Application URL/domain: `vireon.vn`
- Application URI: `app-portal/edu-management`
- Application startup file: `app_wrapper.cjs`

CloudLinux Passenger chỉ nạp trực tiếp CommonJS. `app_wrapper.cjs` là wrapper
CommonJS dùng để nạp backend ESM đã biên dịch.

## Thành phần

- `app_wrapper.cjs`: startup file của Passenger.
- `package.json`: chỉ chứa dependency production.
- `dist-client/`: frontend đã build đúng subpath.
- `dist-server/`: backend đã biên dịch.
- `deploy/env.production.example`: mẫu `.env.local`.
- `uploads/`: dữ liệu upload cần giữ nguyên qua các lần cập nhật.

Không chép `.env.local` vào deploy package và không dùng PM2 trên hosting này.

