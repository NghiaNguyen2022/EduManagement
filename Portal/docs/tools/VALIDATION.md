# Nhật ký kiểm chứng Vireon Tools

2026-09-29 — local Windows, Node 22.20.0. Không coi kết quả local là chứng nhận sức tải hosting.

## Đã kiểm chứng local

- 9 golden tests Excel + 5 tests pilot đạt (bổ sung chặn khuếch đại kích thước kết quả).
- 4 integration tests trên MySQL 8.0.42 riêng đạt: ba thao tác, XLSX thật, ownership, khóa tải khi FREE_BETA=false, idempotency, CSRF, vượt dung lượng, khôi phục worker, timeout worker con và xóa vật lý file hết hạn.
- Browser desktop/mobile đạt: upload/inspect/configure/download cả ba thao tác, quay lại bằng cùng phiên, routes giới thiệu/portal/Labs/contact không lỗi JS, không tràn ngang mobile.
- TypeScript và lint phần UI/API Tools đạt. Build Next 16.3.3 standalone cuối cùng đạt. Bản standalone qua kiểm thử browser Tools, hai route/sitemap tests và toàn bộ workflow Labs cũ.

## Cập nhật dependency

Next 16.3.3, csv-parse 7.0.3, yauzl 3.4.0. Override exceljs>uuid 11.1.1 (ExcelJS chỉ dùng uuid.v4), postcss>nanoid 3.3.18. `pnpm audit --prod` sau cập nhật không còn cảnh báo đã biết. Dev dependencies chưa được nâng toàn bộ; không dùng kết quả audit production để khẳng định dev graph sạch.

Npm lockfile cũ vẫn giữ baseline-browser-mapping và brace-expansion lỗi dù pnpm graph đã vá. Đã tạo npm lockfile sạch trong thư mục tạm, giữ nguyên phiên bản trực tiếp được pin; mysql2 trong range cho phép nâng 3.23.2 → 3.24.5 và đã qua E2E trên Linux. Override brace-expansion nhánh 1 lên 1.1.18. `npm audit --omit=dev` local và cài runtime Linux cuối cùng đều báo 0 lỗ hổng đã biết. Không chạy `npm audit fix --force` trên production.

## Benchmark local

Dữ liệu tổng hợp ở mức 200.000 ô kể cả header; 10 cột; mỗi tiến trình riêng với V8 heap 256 MiB. Tác vụ đọc và xuất XLSX; không chạy qua HTTP. Các số đo chịu ảnh hưởng tác vụ khác trên máy.

| Thao tác | Dòng dữ liệu | Thời gian | RSS đỉnh | File đầu ra |
|---|---:|---:|---:|---:|
| Loại trùng | 19.999 | 25,117 s | 211.096 KiB | 910.035 byte |
| Ghép | 19.998 | 9,917 s | 204.988 KiB | 1.092.917 byte |
| Đối chiếu | 19.998 | 10,312 s | 228.540 KiB | 3.555.201 byte |

RSS gồm native memory; giới hạn V8 heap không phải hard RSS limit. Chỉ chạy một worker, giữ timeout và giới hạn input/output. Chưa đo sức tải đồng thời trên production.

## Đã kiểm chứng trên hosting Linux

- Node 22.23.2, Next standalone staging loopback. Smoke các route và JS/CSS assets đạt.
- Ba luồng API thật upload → inspect → cấu hình → worker → tải XLSX đều đạt; kiểm tra phiên khác bị 404 và chưa xử lý xong bị khóa download. Dữ liệu tổng hợp, phiên và jobs của verifier đã được dọn.
- Benchmark 200.000 ô: loại trùng 54,329 s / 227.932 KiB RSS; ghép 26,284 s / 208.544 KiB; đối chiếu 26,106 s / 237.572 KiB. Website được lấy mẫu đồng thời trả thành công, 27–497 ms mỗi request từ hosting. Đây là số đo tại một thời điểm, không phải SLA.
- Bật production ở 10.000 dòng / 100.000 ô. Cron mỗi phút; helper enable đã xác nhận heartbeat mới sau lúc cài cron.
- Backup gần nhất trước activate: `/home/pauldigi/vireon-backups/tools-20260929-beta1-1790722375554`; giữ backup trước đó `...-1790676366865`.
- Document root `/home/pauldigi/vireon.vn`; Passenger app root giữ nguyên. `/wp/` trả 200 trước và sau chuyển runtime.
- Sitemap cũ là file tĩnh `/home/pauldigi/vireon.vn/sitemap.xml`. Đã chuyển vào backup để Next phục vụ sitemap mới chứa `/tools/excel`. Không sửa `.htaccess` hoặc WordPress.
- API/file Tools dùng storage private `/home/pauldigi/vireon-tools-data`. Backup do helper tạo loại Tools khỏi database dump và không đưa vùng file Tools vào archive lâu dài. Chưa xác minh chính sách backup tự động toàn tài khoản của nhà cung cấp.

## Production — 2026-09-30

- Browser qua `https://vireon.vn` đạt đủ deduplicate, merge, compare; không gọi worker thủ công, chờ cron thật. File XLSX tải được, tải lại trang và mở kết quả bằng cùng phiên thành công.
- Mobile 390 px không tràn ngang; desktop/mobile có ảnh trong `outputs/tools-desktop.png` và `outputs/tools-mobile.png`. Không có lỗi JavaScript trong browser test.
- Routes portal/Tools và sitemap tests đều đạt trên domain thật. Có một lần Node test runner lỗi socket tái sử dụng; từng route đều trả 200 khi chẩn đoán, test được chạy lại với connection riêng và timeout, cả hai test đạt.
- Origin ngoài website nhận 403 từ API session. Phiên test đã yêu cầu xóa toàn bộ 3 jobs do chính nó tạo; không xóa dữ liệu người dùng khác.
- Đã xác minh qua cPanel Fileman: cả 3 thư mục file tổng hợp không còn tồn tại sau chu kỳ cron. Cleanup production đã được kiểm chứng vật lý.
- Cron log ghi đủ inspect/process thành công của 3 jobs; file nhỏ xử lý khoảng 0,48–0,65 giây mỗi pha (thời gian chờ cron riêng).
- `npm audit --omit=dev` cuối báo 0 lỗ hổng đã biết; MySQL test local và worker local đã dừng.

Chưa có payment/OCR; BillScan, SiteReport và QuoteCompare vẫn chỉ có trang giới thiệu, chưa nhận file.

## Bản commerce r2 — kiểm thử local 2026-09-30

Đây là thay đổi sau bản beta production phía trên. Kịch bản cuối: thanh toán/liên hệ qua Zalo, admin tìm mã giao dịch và kích hoạt, khách reload/quét QR để tải; không dùng mã tải riêng.

- Build Next cPanel và kiểm tra TypeScript đạt.
- 14 test Excel/pilot và 3 test helper backup đạt; 7 test tích hợp MySQL local đạt, gồm kích hoạt đúng job, QR khác phiên, không vượt quyền trước duyệt, hết hạn, Drive giả lập và OAuth state gắn admin/chống dùng lại.
- Test trình duyệt `tests/tools-commerce-browser.cjs` đạt: admin authentication/CSRF, lưu cấu hình phí/Zalo, preview, tìm đúng mã giao dịch, kích hoạt, mở QR trước/sau duyệt trên các context riêng, reload giữ đúng job, tải XLSX thật, không có ô nhập mã tải, không tràn ngang ở 390 px và không lỗi JavaScript.
- Hai test route/sitemap đạt trên preview local. Synthetic job của browser test đã được hết hạn và dọn; cấu hình demo được trả về giá trị trước test.
- `npm audit --omit=dev`: 0 lỗ hổng đã biết trong dependency production. Cập nhật override brace-expansion 1.1.21 và QR 1.5.4; dev dependencies vẫn có cảnh báo audit.
- Gói: `outputs/tools-20260930-commerce-r2.tar.gz`, 2.081.800 byte. SHA256 `e9e01e1d1890b6f663dfa8aef4ed2d798319a7b31a858ac85389e4cd1e1e3708`.
- Ảnh kiểm tra: `outputs/tools-admin-commerce.png`, `outputs/tools-payment-mobile.png`. Dữ liệu/QR trong ảnh là test local đã hết hạn, không phải giao dịch thực.
- Chưa deploy r2 lên hosting. Cửa sổ cPanel đang yêu cầu người dùng xử lý lỗi xác thực `ERR_INVALID_AUTH_CREDENTIALS`; chưa có backup hoặc mutation production cho r2.
- Google Drive/OAuth được kiểm thử giao thức bằng mock, chưa dùng Gmail thật; cần chủ tài khoản cấu hình và cấp quyền trong admin. Không gửi tin nhắn Zalo, không chuyển tiền MoMo trong kiểm thử.

## Bản commerce r3 — kiểm thử cuối 2026-09-30

- Gói `outputs/tools-20260930-commerce-r3.tar.gz`, 2.083.660 byte; SHA256 `722c0da7dec80b2378cb460ff13fb7f3fd0055708ce564216aa2257d356ed8f4`.
- Build/TypeScript và ESLint các route/component commerce đạt. Browser acceptance chạy lại trên runtime r3 đạt toàn bộ admin auth/CSRF, cấu hình, tìm/kích hoạt giao dịch, QR khác thiết bị, reload/rescan tải XLSX và mobile layout.
- Phiên cPanel đăng nhập được, Terminal mở được. Upload API timeout; đang xác minh phương thức upload qua browser. Chưa backup hoặc chuyển production sang r3.

## Commerce r3 — đã triển khai production 2026-09-30

- Upload qua fetch trong phiên Chrome cPanel thành công; hai lần API request trước đó timeout, chưa tạo file. SHA256 remote được xác minh trước giải nén.
- Backup đầu: `/home/pauldigi/vireon-backups/tools-20260930-commerce-r3-1790770229361`; checkpoint trước activate: `/home/pauldigi/vireon-backups/tools-20260930-commerce-r3-1790770483413`. Gồm app, runtime đang hoạt động, cấu hình, database Portal, uploads Portal, crontab và khóa mã hóa ở checkpoint; dữ liệu job/file Tools không nằm trong backup dài hạn.
- npm ci production Linux: 0 vulnerabilities. Migration, smoke route/assets, ba luồng deduplicate/merge/compare và benchmark đều đạt.
- Benchmark 200.000 ô: deduplicate 58,934 s / 228.168 KiB RSS; merge 25,410 s / 212.416 KiB; compare 25,608 s / 235.448 KiB. Website phản hồi thành công 25–824 ms từ hosting. Giữ production 100.000 ô, một worker.
- Release state xác nhận prepared/applied/enabled/smokePassed/e2ePassed/linuxBenchmarkPassed/cronInstalled đều true. Helper enable xác nhận heartbeat mới từ cron.
- Hai test public routes/sitemap đạt trên domain sau chuyển runtime. Thu phí và Drive mặc định tắt; chưa có OAuth Gmail thật hoặc giao dịch MoMo thật.
- Browser production r3 đạt: upload CSV giả lập → cron inspect/process thật → QR mở context mới → tải XLSX → reload vẫn tải được; mobile 390 px không tràn; API admin trả 401 khi chưa đăng nhập, download không session bị chặn; `/wp/` trả 200. Script ban đầu kỳ vọng 404 thay vì 401 cho phiên chưa tạo session, đã chỉnh kỳ vọng và chạy lại đạt.
- Chỉ các jobs của phiên test riêng được yêu cầu xóa qua API; không xóa job khách. Preview và MySQL test local đã dừng.
- Danh sách checkpoint xác nhận active-runtime.tar.gz 139.864.222 byte, application.tar.gz 1.522.603 byte, database.sql 595.582 byte, uploads.tar.gz 15.946.362 byte và tools-secrets.key 32 byte; file hiển thị mode 0600.
