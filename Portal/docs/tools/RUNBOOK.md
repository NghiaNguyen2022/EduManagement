# Vireon Tools — vận hành beta

Hướng dẫn từng bước cho Windows và cPanel: [Build, backup, deploy, rollback và đọc log](./HUONG_DAN_BUILD_DEPLOY.md).

**Bản source mới 30/09/2026:** [Drive cá nhân, MoMo thủ công, QR và kích hoạt giao dịch trong admin](./DRIVE_MOMO_ADMIN.md). Tài liệu dưới mô tả beta đã triển khai trước đó; thời hạn 24 giờ và `FREE_BETA` không còn áp dụng cho lượt mới sau khi deploy bản commerce.

## Cấu hình

Giữ nguyên MYSQL_HOST/PORT/DATABASE/USER/PASSWORD của portal. Migrate cộng thêm bảng bằng `npm run tools:migrate`; không thay bảng cũ.

```
TOOLS_ENABLED=true
FREE_BETA=true
TOOLS_ORIGIN=https://vireon.vn
TOOLS_STORAGE_ROOT=/home/pauldigi/vireon-tools-data
TOOLS_MAX_ROWS=10000
TOOLS_MAX_CELLS=100000
```

`TOOLS_ENABLED` mặc định false. Chỉ bật sau khi worker/cron và storage đã kiểm chứng. `FREE_BETA=false` đóng công cụ/khóa download, không bật chế độ thu phí giả. Không được đặt storage trong public hoặc thư mục release. Folder 0700, file 0600. Không đưa file khách vào bản backup dài hạn.

Production beta hạ xuống 10.000 dòng / 100.000 ô sau benchmark Linux: loại trùng ở 200.000 ô mất khoảng 54 giây, sát timeout 60 giây. Giao diện đọc giới hạn từ env. Giới hạn đếm cả các sheet trong file và hàng tiêu đề. Giữ một worker và tối đa 6 lượt đang tải/chờ/xử lý; tổng tối đa 40 lượt chưa hết hạn và 100 lượt mới/ngày toàn hệ thống.

## Worker

Chạy từ thư mục ứng dụng với env production đã nạp:

```
node --env-file=.env server/tools/worker.cjs
```

Mỗi lần chạy dọn file hết hạn và xử lý tối đa một pha inspect/process. Cron mỗi phút gọi command với đường dẫn tuyệt đối đến binary Node của hosting và env/script. MySQL advisory lock ngăn chồng worker. API từ chối nhận job mới khi heartbeat cũ hơn 3 phút. Development dùng `--loop`, không giả định cPanel giữ process lâu dài. Worker con có 256 MiB V8 heap, 60 giây; tổng RSS có thể cao hơn heap và phải đo thực tế.

Sau khi process chết, lần worker kế tiếp đánh dấu job đang xử lý là gián đoạn; người dùng có thể retry tối đa 3 attempts/pha. Lỗi dữ liệu cần sửa file. Cleanup xóa file và metadata/preview sau 24 giờ; giới hạn truy cập áp dụng ngay khi hết hạn, việc xóa vật lý ở lần cron kế tiếp. Bản ghi job không chứa nội dung còn giữ tối đa 7 ngày để vận hành.

## Kiểm thử

`npm test`: golden fixtures Excel và API pilot. `TOOLS_TEST_MYSQL_PORT=3319 npm run test:tools:integration` (cú pháp đặt env theo shell): integration tạo database `tools_test_<pid>` trên **127.0.0.1**, mặc định root không mật khẩu dành riêng instance test; dùng TOOLS_TEST_MYSQL_USER/PASSWORD khi cấu hình khác. Không đọc .env production, tự xóa database kiểm thử.

`npm run build:cpanel`: build Next standalone. Copy `.next/static`, `public`, `server/tools`, migration và runtime dependencies đúng nền tảng. Không copy Windows native modules lên Linux.

## Phát hành / khôi phục

1. Backup app, `.env`, DB trước migration; xác minh archive đọc được. Giữ snapshot cũ và cấu hình cron cũ.
2. Đưa release vào thư mục private; cài dependencies Linux riêng; migrate cộng thêm bảng.
3. Chạy staging Linux bằng port loopback; smoke các route Tools và route cũ; chạy fixtures thực không có dữ liệu khách.
4. Đo RAM/thời gian trên host, cấu hình cron, xác minh heartbeat/cleanup. Kiểm tra `/sitemap.xml`, `/wp/` và rewrite.
5. Áp dụng runtime, bật Tools, restart app; kiểm thử production. Rollback bằng runtime và `.env` cũ; tắt cron Tools khi rollback. Không xóa các bảng có dữ liệu người dùng.

Release đang dùng: `/home/pauldigi/vireon-releases/tools-20260929-beta1`. `app.cjs` ở app root nạp `.env` cũ rồi khởi động server trong release riêng, để giữ nguyên runtime trước đó cho rollback. Npm lockfile là nguồn cài dependencies Linux; `npm ci --omit=dev --ignore-scripts`. Bản vá lockfile/helper được ghi SHA-256 trong `overlay-manifest.json` của release.

Helper `deploy/tools-release.cjs`: `checkpoint` tạo backup mới trước `apply`; `apply` yêu cầu smoke/E2E và checkpoint mới dưới 15 phút, khởi động với Tools tắt; `cron` thêm đúng worker; `enable` kiểm tra heartbeat mới sau khi cài cron và chuyển sitemap tĩnh cũ vào backup; `rollback` khôi phục entry, env, cron và sitemap. Đường dẫn release được kiểm tra trước mọi thao tác. Khi chạy helper bằng Terminal, dùng lệnh cố định tương ứng bước được duyệt; không cung cấp chức năng thực thi lệnh tùy ý qua website.

## Giới hạn hiện tại

- Chưa có payment provider; BillScan/SiteReport/QuoteCompare chỉ giới thiệu.
- CSV UTF-8, dấu phẩy/chấm phẩy/tab khi nhận diện rõ; dữ liệu CSV giữ dạng chuỗi.
- Dòng 1 là tiêu đề; không hỗ trợ merged cells, macros, external workbook links hoặc công thức thiếu cache.
- Không hứa giữ định dạng, formula hoặc tính lại công thức; ngày xuất ISO.
- Phiên không được khôi phục qua email; mất cookie mất quyền truy cập.
- Nhật ký chỉ ghi ID tác vụ, phase, thời gian và mã lỗi; không log tên/nội dung file, token.
