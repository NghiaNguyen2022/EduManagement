# QLTruongHoc

Bộ khung chạy ban đầu cho ứng dụng Quản lý Trường học/Trung tâm, kế thừa pattern kết nối MySQL + Drizzle của App Lưu Xá.

## 1. Yêu cầu môi trường

- Node.js 20+
- npm 10+
- MySQL 8+
- Database `SchoolCenter`
- MySQL user `schoolcenter_app@localhost`

## 2. Cấu hình

Tại thư mục gốc:

```bat
copy .env.example .env.local
```

Sửa `.env.local`:

```env
DATABASE_HOST="localhost"
DATABASE_PORT="3306"
DATABASE_USER="schoolcenter_app"
DATABASE_PASSWORD="MAT_KHAU_THAT"
DATABASE_NAME="SchoolCenter"

DATABASE_URL="mysql://schoolcenter_app:MAT_KHAU_DA_URL_ENCODE@localhost:3306/SchoolCenter"
```

`DATABASE_PASSWORD` giữ mật khẩu thật. Trong `DATABASE_URL`, ký tự đặc biệt phải URL encode, ví dụ `@` thành `%40`.

## 3. Cài và chạy

```bat
cd \QLTruongHoc
npm install
npm run db:check
npm run dev
```

- API: http://localhost:3000
- Health API: http://localhost:3000/api/health
- Frontend: http://localhost:5173

## 3.1 Dữ liệu mẫu

Sau khi `npm run db:seed:auth` (tài khoản `admin` + đơn vị gốc), chạy thêm:

```bat
npm run db:seed:sample
```

Tạo dữ liệu mẫu cơ bản cho Trung tâm Ngoại ngữ Quận 8 và Trường Mầm non Hoa Nắng: chương
trình, giáo viên, lớp học, học sinh + phụ huynh đã xếp lớp, lead chưa chuyển đổi, và 4 tài
khoản demo theo vai trò (mật khẩu tạm `Edu@123Qaz`). An toàn chạy lại nhiều lần — tự bỏ qua
nếu dữ liệu mẫu đã tồn tại.

## 4. Luồng kết nối

```text
.env.local
  → server/config/env.ts
  → server/db/connection.ts
  → getDb()
  → repository
  → service
  → router
  → frontend
```

Chỉ `server/db/connection.ts` được phép gọi `mysql.createPool()`.

## 5. File cũ phải xoá nếu đã chép các patch trước

Xem `docs/CLEANUP_OLD_FILES.md`.
