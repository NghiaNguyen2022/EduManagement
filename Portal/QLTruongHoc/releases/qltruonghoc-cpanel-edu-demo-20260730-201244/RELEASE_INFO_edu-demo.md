# Bảng thông tin Release — QLTruongHoc bản DEMO (edu-demo)

Theo tài liệu `docs/HUONG_DAN_TRIEN_KHAI_VA_PHAT_HANH_QLTRUONGHOC_CPANEL.docx` (bám sát mục 3–7),
áp dụng cho bản demo tại URI riêng `app-portal/edu-demo` (khác với bản chính `edu-management`
đang chạy song song trên cùng VPS/cPanel).

- **Package đã tạo:** `releases/qltruonghoc-cpanel-edu-demo-20260730-201244.zip`
- **Build:** typecheck ✅ · test 23/23 ✅ · `VITE_APP_BASE_PATH=/app-portal/edu-demo/` ✅
- **Baseline data có sẵn:** `releases/qltruonghoc-demo-database-20260730.sql` (dùng để import vào DB demo)

## 1. Application Root & Node.js App (cPanel → Setup Node.js App)

| Hạng mục | Giá trị |
|---|---|
| Node.js version | 22.23.0 (hoặc bản 22.x hosting hỗ trợ) |
| Application mode | Production |
| Application root | `apps/edu-demo` |
| Domain | `vireon.vn` |
| Application URI | `app-portal/edu-demo` |
| Startup file | `app_wrapper.cjs` |
| URL công khai | https://vireon.vn/app-portal/edu-demo |

Tạo thư mục trước khi giải nén (qua SSH `pauldigi@103.200.23.126`):

```bash
mkdir -p /home/pauldigi/apps/edu-demo
```

## 2. Database (cPanel → Database Wizard)

| Hạng mục | Giá trị |
|---|---|
| Database | `pauldigi_edu_man_demo` |
| Database user | `pauldigi_edu_demo` |
| Password | `Abcd@1234!@#` |
| Host | `localhost` |
| Quyền | ALL PRIVILEGES trên đúng database |

Verify sau khi tạo:

```bash
mysql -h localhost -u pauldigi_edu_demo -p pauldigi_edu_man_demo
SELECT DATABASE(), VERSION();
exit
```

Import baseline (phpMyAdmin → chọn `pauldigi_edu_man_demo` → Import → chọn
`qltruonghoc-demo-database-20260730.sql` → charset utf-8):

```sql
SELECT COUNT(*) AS soBang
FROM information_schema.tables
WHERE table_schema = 'pauldigi_edu_man_demo'
  AND table_type = 'BASE TABLE';
```

Nếu tên bảng bị chuyển thành chữ thường (dump từ MySQL Windows sang Linux), import tiếp
`deploy/cpanel/fix-linux-table-case.sql` rồi kiểm tra lại tên bảng CamelCase
(`NguoiDung`, `DonVi`, `VaiTro`, `HocSinh`, `GiaoVien`, `LopHoc`).

## 3. Environment Variables (Node.js App → Environment Variables)

| Biến | Giá trị |
|---|---|
| `DATABASE_HOST` | `localhost` |
| `DATABASE_PORT` | `3306` |
| `DATABASE_USER` | `pauldigi_edu_demo` |
| `DATABASE_PASSWORD` | `Abcd@1234!@#` |
| `DATABASE_NAME` | `pauldigi_edu_man_demo` |
| `DATABASE_CONNECTION_LIMIT` | `10` |
| `AUTH_COOKIE_NAME` | `edu_demo_session` (khuyến nghị đặt riêng, khác bản chính) |
| `COOKIE_PATH` | `/app-portal/edu-demo` |
| `APP_BASE_PATH` | `/app-portal/edu-demo` |

**Không đặt `PORT`/`HOST` thủ công** — Passenger tự quản lý tiến trình HTTP. Application Mode tự
đặt `NODE_ENV=production`.

## 4. Upload & cài dependency (SSH)

```bash
scp -i "D:\Working\Hosting\SSH-key\ed25519" \
  releases/qltruonghoc-cpanel-edu-demo-20260730-201244.zip \
  pauldigi@103.200.23.126:/home/pauldigi/apps/edu-demo/

ssh -i "D:\Working\Hosting\SSH-key\ed25519" pauldigi@103.200.23.126
cd /home/pauldigi/apps/edu-demo
unzip -o qltruonghoc-cpanel-edu-demo-20260730-201244.zip

source /home/pauldigi/nodevenv/apps/edu-demo/22/bin/activate
npm install --omit=dev
npm list express mysql2 drizzle-orm --depth=0
npm audit --omit=dev
```

Verify sau giải nén:

```bash
test -f app_wrapper.cjs
test -f package.json
test -f dist-client/index.html
test -f dist-server/server/index.js
grep -F '/app-portal/edu-demo/assets/' dist-client/index.html
```

### ⚠️ CloudLinux Node.js Selector — ràng buộc `node_modules`

CloudLinux Node.js Selector quản lý dependency trong một virtual environment riêng
(`/home/pauldigi/nodevenv/apps/edu-demo/22/...`) và tự tạo trong Application root một
**symlink tên `node_modules`** trỏ tới thư mục đó. Vì vậy:

- Package build (`qltruonghoc-cpanel-edu-demo-*.zip`) **không được** chứa file/thư mục
  `node_modules` thật ở bất kỳ cấp nào — đã kiểm tra: package hiện tại (130 file) không có
  entry `node_modules` nào, hợp lệ.
- Không tự tay tạo/copy một thư mục `node_modules` thật vào Application root — sẽ đè lên
  hoặc xung đột với symlink do CloudLinux quản lý.
- **Cẩn thận khi xóa:** `node_modules` trong Application root là symlink. Lệnh
  `rm -rf node_modules` (không có `/` cuối) chỉ xóa symlink — an toàn. Nhưng
  `rm -rf node_modules/` hoặc `rm -rf node_modules/*` sẽ xóa **nội dung bên trong** thư
  mục venv thật (dùng chung, có thể ảnh hưởng cách CloudLinux quản lý app) — tuyệt đối
  không chạy dạng có `/` cuối hoặc wildcard trên `node_modules`.
- Sau khi Setup Node.js App tạo xong và sau mỗi lần `npm install`, verify lại:

```bash
ls -la /home/pauldigi/apps/edu-demo/node_modules
```

Kết quả mong đợi: dòng hiển thị có `->` trỏ tới thư mục trong
`/home/pauldigi/nodevenv/apps/edu-demo/22/...` (là symlink), không phải một thư mục thật.

## 5. Khởi động & nghiệm thu

Trong Setup Node.js App: **START APP** → chờ 10–20 giây → **RESTART**.

```bash
curl -i https://vireon.vn/app-portal/edu-demo/api/health
curl -I https://vireon.vn/app-portal/edu-demo/assets/TEN_FILE_JS.js
```

Kết quả mong đợi: health API HTTP 200 với `databaseName = pauldigi_edu_man_demo`; asset JS HTTP 200,
content-type `text/javascript`/`application/javascript`.

## 6. Checklist nhanh

- [ ] Đã backup DB/uploads nếu ghi đè bản demo cũ.
- [ ] Application root `apps/edu-demo` tách biệt, không nằm trong `vireon.vn/` (document root).
- [ ] Environment Variables đầy đủ, gồm `APP_BASE_PATH`, không có `PORT`/`HOST`.
- [ ] Database `pauldigi_edu_man_demo` đã tạo, user `pauldigi_edu_demo` có ALL PRIVILEGES.
- [ ] Import baseline `qltruonghoc-demo-database-20260730.sql` thành công (đếm đủ số bảng).
- [ ] `npm install --omit=dev` thành công; audit đạt.
- [ ] START APP/RESTART thành công; health API 200.
- [ ] Đăng nhập, cookie `Path=/app-portal/edu-demo`, refresh route, upload hoạt động.
- [ ] Website chính `vireon.vn/` và bản `edu-management` không bị ảnh hưởng.
- [ ] Đổi mật khẩu demo trước khi chia sẻ link công khai rộng rãi.
