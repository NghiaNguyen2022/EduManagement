# Hệ thống Quản lý Trường học

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 0.4.0
**Cập nhật:** 28/07/2026

Hệ thống quản lý dùng chung cho trường mầm non và trung tâm đào tạo. Ứng dụng hỗ trợ nhiều
đơn vị, phân quyền theo vai trò, tuyển sinh, học sinh, lớp học, lịch học, điểm danh, tài chính,
thông báo và các portal theo người dùng.

## Mục lục

- [Chức năng chính](#chức-năng-chính)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt](#cài-đặt)
- [Khởi tạo cơ sở dữ liệu](#khởi-tạo-cơ-sở-dữ-liệu)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Kiểm tra chất lượng](#kiểm-tra-chất-lượng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tài liệu](#tài-liệu)

## Chức năng chính

- Quản lý nhiều trường, trung tâm và cơ sở trong cùng hệ thống.
- Gán vai trò và quyền theo từng đơn vị.
- Quản lý tuyển sinh, học sinh, phụ huynh, giáo viên, chương trình và lớp học.
- Lập lịch học, điểm danh, xin phép nghỉ và báo giảng.
- Quản lý khoản thu, kỳ thu, công nợ, phiếu thu, hoàn phí và báo cáo tài chính.
- Thông báo theo toàn đơn vị, lớp hoặc học sinh.
- Portal dành cho phụ huynh, giáo viên, học vụ, kế toán và các vai trò vận hành.

## Yêu cầu môi trường

- Node.js 20 trở lên.
- pnpm 10 trở lên.
- MySQL 8 trở lên.
- Cơ sở dữ liệu `SchoolCenter`.

## Cài đặt

```powershell
pnpm install
Copy-Item .env.example .env.local
```

Cập nhật thông tin MySQL trong `.env.local`. Nếu mật khẩu có ký tự đặc biệt, giá trị trong
`DATABASE_URL` phải được URL encode; `DATABASE_PASSWORD` vẫn giữ mật khẩu gốc.

## Khởi tạo cơ sở dữ liệu

```powershell
pnpm db:check
pnpm db:push
pnpm db:seed:auth
pnpm db:seed:sample
```

`db:push` cần được chạy trong terminal tương tác. Dữ liệu demo dùng mật khẩu tạm
`Edu@123Qaz`; không sử dụng mật khẩu này ở môi trường thật.

## Chạy ứng dụng

```powershell
pnpm dev
```

- Giao diện phát triển: `http://localhost:5173`
- API nội bộ: `http://localhost:3100`
- Kiểm tra API qua giao diện: `http://localhost:5173/api/health`

## Kiểm tra chất lượng

```powershell
pnpm typecheck
pnpm test
pnpm build
```

## Cấu trúc dự án

```text
client/          Giao diện React
server/          API, nghiệp vụ và truy cập dữ liệu
drizzle/         Định nghĩa schema
database/        Các script SQL triển khai
tests/           Kiểm thử tự động
docs/            Tài liệu dự án
```

Schema trong `drizzle/schema.ts` và `drizzle/schemas/` là nguồn cấu trúc dữ liệu chính thức.

## Tài liệu

Xem [Danh mục tài liệu](docs/README.md) để chọn đúng tài liệu cho người sử dụng, triển khai
hoặc phát triển hệ thống.
