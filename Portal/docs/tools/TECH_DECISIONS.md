# Vireon Tools — quyết định kỹ thuật

Ngày: 2026-09-29. Phạm vi M0–M2: Excel Rescue beta miễn phí; các công cụ còn lại chưa nhận file.

Thay đổi source ngày 30/09/2026: [Drive cá nhân, Zalo và kích hoạt giao dịch](./DRIVE_MOMO_ADMIN.md). Bản mới chuyển lượt mới sang thời hạn 30 ngày, thêm recovery QR và quyền tải theo kích hoạt của admin. Nội dung phía dưới ghi nhận quyết định beta trước thay đổi này.

## Nền tảng đã khảo sát

- Repository thực tế: `D:\SOURCE-CODE\Git\EduManagement\Portal`.
- Next.js 16 App Router, React 19, MySQL/mysql2; production dùng Next standalone trên cPanel/Node 22.
- Giữ Vireon Labs và các route hiện tại. Không dùng session admin làm quyền truy cập của khách.
- Storage hiện tại là filesystem dù module mang tên r2. API documents/images hiện phục vụ công khai; không tái sử dụng cho Tools.
- Lần triển khai trước gặp EAGAIN khi build trên hosting. Build trên máy phát triển; runtime và worker phải được kiểm tra riêng trên Linux.
- Chưa xác minh cron thực chạy, sức tải Excel hay rewrite `/wp/`. Sitemap production từng không khớp ứng dụng; phải kiểm tra trước phát hành.

## Kiến trúc

Next API nhận luồng binary vào vùng riêng tư. MySQL lưu phiên khách dạng hash, job và file. Worker độc lập nhận việc bằng khóa MySQL trên connection riêng; chỉ một worker hoạt động. Mỗi tác vụ Excel chạy trong child process với timeout và giới hạn V8 heap. Cron gọi worker theo đợt, không giữ HTTP chờ xử lý. Không thêm Redis.

Inspect cũng là tác vụ nền. Khách chọn sheet, cột khóa/mapping sau khi inspect hoàn tất. Inputs bất biến. Worker ghi output theo attempt riêng, chỉ công bố sau khi ghi xong. Trạng thái xử lý độc lập entitlement. `FREE_BETA=false` đóng chức năng mới và tải xuống đến khi có provider thật; không có thanh toán giả.

## Giới hạn beta

5 MiB/file, tối đa 5 file, 20.000 dòng và 200.000 ô tổng toàn bộ workbook trong lượt; 100 cột, 10 sheet/file; 40 MiB giải nén/file; 12 MiB nội dung text/job; 60 giây/tác vụ; một worker. Các env chỉ được hạ giới hạn, tăng phải benchmark lại. Không quảng cáo sức tải trước khi đo trên hosting.

XLSX được kiểm tra ZIP thực tế trước khi parser đọc: giới hạn entries, byte giải nén, đường dẫn, nội dung macro/nhúng/external links và DTD. Parser không tính công thức, chỉ đọc cached value và từ chối khi cache thiếu. Merged cells cần tách trước; không đoán giá trị. CSV UTF-8, tự nhận delimiter thông thường khi rõ ràng, không tự chuyển chuỗi sang số để giữ mã có số 0 đầu. Đầu ra XLSX chỉ chứa giá trị.

## Quyền truy cập và lưu giữ

Cookie riêng Secure/HttpOnly/SameSite, CSRF same-origin cho mutation, job ID không phải quyền. API private đặt no-store. Không ghi dữ liệu file/token vào log. File ở `TOOLS_STORAGE_ROOT` ngoài public và ngoài thư mục release. Giữ tối đa 24 giờ, worker dọn file và dữ liệu preview/metadata; backup triển khai phải loại vùng Tools khỏi bản sao lưu dài hạn. Hạn mức job toàn hệ thống bảo vệ đĩa kể cả khi khách xóa cookie. Không dựa hoàn toàn IP do reverse proxy chưa được xác minh.

## Điều kiện phát hành

Kiểm thử golden fixtures cả ba thao tác, isolation/CSRF/expiry/paid-mode lock, upload vượt mức, ZIP lỗi, worker timeout/recovery và cleanup. Build production; smoke UI/mobile và các route cũ. Benchmark cùng website trên Linux, kiểm tra cron không chồng, sao lưu ứng dụng/DB trước migration cộng thêm. BillScan chỉ mở khi có bộ OCR và chính sách dữ liệu riêng được kiểm chứng.

Tham khảo: https://github.com/exceljs/exceljs ; https://docs.cpanel.net/cpanel/advanced/cron-jobs/

## Cập nhật sau triển khai — 2026-09-30

Đã xác minh staging/cron/E2E trên Linux và bật beta tại https://vireon.vn/tools. Sau đo tải, production dùng 10.000 dòng / 100.000 ô, một worker. `/wp/` giữ hoạt động; sitemap tĩnh cũ được lưu vào backup để sitemap Next nhận route mới. Phiên bản runtime và bằng chứng kiểm thử cuối nằm ở `VALIDATION.md`, cách vận hành/rollback ở `RUNBOOK.md`.
