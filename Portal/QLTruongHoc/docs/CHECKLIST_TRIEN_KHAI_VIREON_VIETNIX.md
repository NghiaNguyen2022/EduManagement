# Checklist triển khai QLTruongHoc trên VPS Vietnix

**Địa chỉ ứng dụng:** `https://vireon.vn/app-portal/edu-management/`  
**Mô hình:** website `vireon.vn` và ứng dụng QLTruongHoc dùng chung một VPS  
**Phiên bản tài liệu:** 1.0  
**Cập nhật:** 30/07/2026

## 1. Kiến trúc triển khai

```text
Internet
  -> Nginx của vireon.vn (HTTPS 443)
     -> /                                  : website hiện tại
     -> /app-portal/edu-management/        : Node.js 127.0.0.1:3100
                                               -> MySQL 127.0.0.1:3306
```

Node.js và MySQL chỉ nghe trên `127.0.0.1`. Không mở công khai các cổng
`3100`, `3306` hoặc `5173`.

## 2. Sao lưu trước khi triển khai

- [ ] Sao lưu cấu hình Nginx đang hoạt động.
- [ ] Sao lưu website `vireon.vn`.
- [ ] Sao lưu tất cả cơ sở dữ liệu liên quan.
- [ ] Ghi nhận phiên bản Node.js, pnpm, Nginx và MySQL.
- [ ] Chuẩn bị phương án quay lại bản ứng dụng trước đó.

### Kiểm tra

```bash
sudo nginx -T
node --version
pnpm --version
mysql --version
```

**Kết quả mong đợi:** lệnh Nginx không báo lỗi; có thể khôi phục các bản sao lưu
trên một thư mục thử nghiệm.

## 3. Chuẩn bị mã nguồn và biến môi trường

Đặt mã nguồn tại một thư mục riêng, ví dụ:

```bash
/var/www/app-portal/edu-management
```

Trong thư mục dự án:

```bash
cp deploy/env.production.example .env.local
nano .env.local
```

Thay toàn bộ giá trị `CHANGE_ME`. Giữ nguyên:

```dotenv
NODE_ENV="production"
HOST="127.0.0.1"
PORT="3100"
AUTH_COOKIE_NAME="edu_management_session"
COOKIE_PATH="/app-portal/edu-management"
VITE_APP_BASE_PATH="/app-portal/edu-management/"
```

Phân quyền để chỉ tài khoản vận hành đọc được `.env.local`.

### Kiểm tra

```bash
grep -E '^(NODE_ENV|HOST|PORT|COOKIE_PATH|VITE_APP_BASE_PATH)=' .env.local
```

**Kết quả mong đợi:** đường dẫn cookie không có dấu `/` cuối; đường dẫn Vite có
dấu `/` ở cả đầu và cuối. Không đưa nội dung mật khẩu vào ảnh chụp hoặc log.

## 4. Chuẩn bị MySQL

Tạo database và tài khoản riêng cho ứng dụng. Không dùng tài khoản `root` trong
file cấu hình ứng dụng.

```sql
CREATE DATABASE edu_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'edu_management_app'@'127.0.0.1'
  IDENTIFIED BY 'MAT_KHAU_MANH_THAY_TAI_DAY';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON edu_management.* TO 'edu_management_app'@'127.0.0.1';

FLUSH PRIVILEGES;
```

Nhập schema/data từ bản sao đã được xác nhận hoặc chạy migration đã được kiểm
thử trên bản sao staging trước. **Không chạy các file reset/xóa dữ liệu trên
production**, đặc biệt các script có tên `reset` hoặc `full_reset`.

### Kiểm tra

```bash
pnpm db:check
```

**Kết quả mong đợi:** kết nối thành công bằng tài khoản ứng dụng; MySQL không
lắng nghe trên IP công khai.

## 5. Cài phụ thuộc, kiểm thử và build

Khuyến nghị dùng đúng phiên bản Node.js đã kiểm thử (Node.js 22 LTS) và bật
Corepack trước khi cài pnpm.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
NODE_ENV=production VITE_APP_BASE_PATH=/app-portal/edu-management/ pnpm build
```

### Kiểm tra

```bash
grep -F '/app-portal/edu-management/assets/' dist-client/index.html
test -f dist-server/server/index.js
```

**Kết quả mong đợi:** typecheck thành công; 23 test đạt; `index.html` tham chiếu
asset bằng đúng tiền tố; có file khởi động backend.

## 6. Chạy ứng dụng bằng PM2

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Chạy tiếp lệnh `sudo ...` do `pm2 startup` in ra. Không chạy ứng dụng trực tiếp
bằng tài khoản `root`.

### Kiểm tra

```bash
pm2 status vireon-edu-management
pm2 logs vireon-edu-management --lines 100
curl -i http://127.0.0.1:3100/api/health
curl -I http://127.0.0.1:3100/login
```

**Kết quả mong đợi:** PM2 ở trạng thái `online`; health API trả HTTP 200; route
frontend trả `index.html`; log không có lỗi kết nối MySQL.

## 7. Ghép ứng dụng vào Nginx của vireon.vn

Mở đúng file `server` HTTPS đang phục vụ `vireon.vn`, rồi chèn hai khối
`location` trong:

```text
deploy/nginx/vireon-edu-management.conf.example
```

Không thay `location /` của website hiện tại. Dấu `/` cuối trong `proxy_pass
http://127.0.0.1:3100/;` là bắt buộc để backend nhận `/api/...` thay vì nhận cả
tiền tố công khai.

### Kiểm tra

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://vireon.vn/
curl -I https://vireon.vn/app-portal/edu-management
curl -i https://vireon.vn/app-portal/edu-management/api/health
```

**Kết quả mong đợi:**

- Website chính `https://vireon.vn/` vẫn hoạt động.
- URL thiếu dấu `/` cuối chuyển hướng 301 tới URL chuẩn.
- Health API dưới đường dẫn mới trả HTTP 200.

Nếu `nginx -t` lỗi, không reload Nginx; khôi phục file cấu hình vừa sao lưu.

## 8. Kiểm thử nghiệm thu trên trình duyệt

Mở cửa sổ ẩn danh tại:

```text
https://vireon.vn/app-portal/edu-management/
```

- [ ] Trang đăng nhập hiển thị và toàn bộ CSS/icon tải thành công.
- [ ] Đăng nhập đúng tài khoản; tải lại trang vẫn còn phiên.
- [ ] Đăng xuất; cookie `edu_management_session` được xóa.
- [ ] Dán trực tiếp URL của một trang con rồi tải lại; không bị 404.
- [ ] Mở trang con trong tab mới; URL vẫn có `/app-portal/edu-management/`.
- [ ] Tải ảnh/tệp lên, xem lại và tải xuống thành công.
- [ ] In phiếu nhập học và phiếu thu; logo hiển thị đúng.
- [ ] Website chính tại `/` không đổi giao diện và chức năng.
- [ ] Đăng nhập quản trị hệ thống, mầm non và trung tâm ngoại ngữ.
- [ ] Kiểm tra các portal: quản lý đơn vị, tuyển sinh, học vụ, kế toán, giáo viên,
  phụ huynh.
- [ ] Phụ huynh có hai con ở hai đơn vị nhận được thông báo toàn trường của cả
  hai đơn vị.

### Kiểm tra kỹ thuật trên DevTools

- Tab **Network** không có request 404/500.
- Request API có dạng
  `/app-portal/edu-management/api/...`.
- Request asset/upload có tiền tố
  `/app-portal/edu-management/...`.
- Cookie đăng nhập có `Secure`, `HttpOnly`, `SameSite=Lax` và
  `Path=/app-portal/edu-management`.

## 9. Kiểm tra khởi động lại và giám sát

```bash
sudo reboot
```

Sau khi VPS hoạt động trở lại:

```bash
pm2 status
curl -i https://vireon.vn/app-portal/edu-management/api/health
```

**Kết quả mong đợi:** Nginx, MySQL và PM2 tự khởi động; ứng dụng hoạt động mà
không cần chạy lệnh thủ công.

Thiết lập thêm:

- [ ] Backup MySQL tự động và thử phục hồi định kỳ.
- [ ] Theo dõi dung lượng đĩa, RAM, CPU và thư mục upload.
- [ ] Log rotation cho PM2/Nginx.
- [ ] Cảnh báo khi health API lỗi.
- [ ] Lịch cập nhật bản vá bảo mật cho VPS.

## 10. Quy trình cập nhật phiên bản sau này

```bash
git pull
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
NODE_ENV=production VITE_APP_BASE_PATH=/app-portal/edu-management/ pnpm build
pm2 reload vireon-edu-management
curl -i https://vireon.vn/app-portal/edu-management/api/health
```

Không chạy migration hoặc seed dữ liệu mẫu tự động trong cùng lệnh deploy.
Migration phải được sao lưu, kiểm thử staging và phê duyệt riêng.
