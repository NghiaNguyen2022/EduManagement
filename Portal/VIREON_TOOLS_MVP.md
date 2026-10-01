# VIREON TOOLS — MASTER IMPLEMENTATION PLAN / CONTEXT

**Phiên bản:** 1.0 — 29/09/2026  
**Website dự kiến:** `https://vireon.vn/tools`  
**Định hướng:** Micro-SaaS, pay-per-use, giao diện tiếng Việt, thao tác đơn giản, sản phẩm chạy được sớm.  
**Mục đích tài liệu:** Dán tài liệu này vào Codex/AI coding agent làm nguồn yêu cầu chính, sau đó cho agent khảo sát repository và triển khai theo từng mốc. Đây là đặc tả để phát triển, **không** có nghĩa sản phẩm đã được viết hoặc đưa lên môi trường thật.

---

## 0. Chỉ dẫn bắt buộc cho AI coding agent

Bạn đang phát triển Vireon Tools, một khu vực công cụ trực tuyến trên website Vireon hiện hữu. **Không viết lại website, không thay đổi tùy tiện các ứng dụng hoặc route cũ.**

1. Trước khi sửa mã, kiểm tra cấu trúc repository, framework, router, phương thức deploy, database và khả năng chạy process/worker của hosting. Không giả định stack hiện tại. Báo lại tóm tắt ngắn về những gì đã xác minh.
2. Tận dụng stack và quy ước có sẵn. Chỉ đề xuất service/worker riêng khi phần xử lý Excel/OCR thực sự cần. Không thêm Redis, microservice, Kubernetes, blockchain hoặc AI agent chỉ vì “cho hiện đại”.
3. Thêm khu vực `/tools` độc lập, không làm hỏng `/`, `/wp/` và các route đang tồn tại. Nếu site WordPress và ứng dụng khác cùng domain, phải kiểm tra quy tắc reverse proxy/rewrite trước khi cấu hình.
4. Xây **bộ khung cả bốn công cụ**, hoàn thiện **Excel Rescue trước**, sau đó mới **BillScan**. SiteReport và QuoteCompare chỉ cần màn hình giới thiệu/trạng thái “Sắp ra mắt” và module scaffold ở MVP.
5. Tạo chức năng thật, không tạo nút giả, số liệu giả, luồng thanh toán giả trong production. Chức năng chưa khả dụng phải được vô hiệu hóa, nêu rõ trạng thái.
6. Mỗi mốc phải chạy test, kiểm tra các route cũ, cung cấp hướng dẫn chạy local và một bản ghi những gì đã làm/chưa làm. Chỉ deploy production khi được phép và có cấu hình môi trường cần thiết.
7. **Không yêu cầu hoặc tự tìm cách truy cập tài khoản ngân hàng, API key, máy chủ hay DNS khi chưa được cấp quyền.** Không đưa secret vào Git hoặc log.
8. Nếu có xung đột giữa tốc độ và an toàn dữ liệu khách hàng, chọn phương án an toàn; thông báo rõ điểm chưa thể hoàn thành.

### Definition of done tổng thể

Người dùng có thể đến `/tools`, mở Excel Rescue, tải file Excel hợp lệ, xem trước kết quả, thanh toán qua phương thức **đã được xác thực tích hợp**, tải file hoàn chỉnh; hệ thống có kiểm soát lỗi và tự dọn dữ liệu. Khi chưa tích hợp thanh toán thật, chạy **beta miễn phí hoặc thanh toán sandbox**, tuyệt đối không coi ảnh chụp chuyển khoản/nút “Tôi đã trả tiền” là bằng chứng thanh toán.

---

## 1. Phạm vi và thứ tự ra mắt

| Module | Route gợi ý | Tình trạng ở mốc đầu | Giá thử nghiệm, chỉ áp dụng sau khi kiểm chứng |
|---|---|---|---|
| Excel Rescue | `/tools/excel` | **Làm hoàn chỉnh trước** | 49.000–99.000đ/job |
| BillScan | `/tools/billscan` | Bộ khung → phát triển mốc tiếp theo | 59.000–99.000đ/gói |
| SiteReport | `/tools/sitereport` | Trang giới thiệu + scaffold; chưa nhận đơn | 69.000–99.000đ/báo cáo |
| QuoteCompare | `/tools/quotecompare` | Trang giới thiệu + scaffold; chưa nhận đơn | 79.000–99.000đ/lượt |

**Ngoài phạm vi MVP:** ứng dụng điện thoại native, CRM/ERP, đăng nhập bắt buộc, quản lý subscription, trình sửa bảng Excel trực tuyến, cộng tác realtime, phân tích dữ liệu vô hạn, AI chatbot tự do, nền tảng marketplace, xử lý tất cả định dạng chứng từ trên thị trường.

**Chiến lược:** dùng chung shell và pipeline job/payment/download. Không viết logic các công cụ trộn với nhau. Khi BillScan xuất hiện, bổ sung processor mới vào cùng luồng.

---

## 2. Trải nghiệm người dùng và thiết kế UI

### 2.1. Trang `/tools`

Bám sát hình mẫu đã thống nhất:

- Header: logo/icon cờ-lê nhỏ; **Vireon Tools**; tagline **“Công cụ nhỏ. Việc xong nhanh.”**; badge **“Pay per use”**.
- Lưới bốn card: **Excel Rescue — Xử lý Excel**, **BillScan — Đọc chứng từ**, **SiteReport — Báo cáo ảnh**, **QuoteCompare — So sánh báo giá**.
- Footer/flow: **Upload → Xử lý → Thanh toán → Nhận kết quả**.
- Card Excel bật CTA **“Dùng ngay”**; BillScan bật CTA khi đã hoàn thiện; hai card còn lại hiển thị **“Sắp ra mắt”** nhưng vẫn có trang giới thiệu hữu ích.
- Responsive: hai cột desktop, một cột mobile; cảm giác nhẹ, sạch, nhanh; ưu tiên màu và typography nhất quán với Vireon đang có.
- Có thể hiển thị giá khởi điểm kèm quy tắc tính phí minh bạch, chính sách dữ liệu và trạng thái công cụ.

### 2.2. Trang mỗi công cụ

Hiển thị một wizard đơn giản trên cùng trang:

1. **Tải dữ liệu** — hỗ trợ kéo thả, chọn file; thông báo giới hạn rõ ràng.
2. **Chọn thao tác/cấu hình** — dùng control rõ ràng, có ví dụ; không bắt buộc viết prompt.
3. **Xem kết quả mẫu** — số dòng/file, lỗi, danh sách thay đổi và mẫu 10–20 dòng. Chỉ hiển thị dữ liệu của chính job đó.
4. **Thanh toán** — nếu job được báo giá và chưa thanh toán; hiển thị amount và trạng thái được trả về từ server.
5. **Tải kết quả** — cấp link tải bảo mật, có hạn; hiển thị thời hạn xóa file.

Lưu ý thứ tự thực tế: xử lý để tạo preview trước thanh toán chỉ dành cho giới hạn công việc phù hợp; không cho truy cập file đầy đủ trước khi thanh toán. Nếu job tốn tài nguyên quá mức, phải báo giới hạn từ đầu, không tạo chi phí vô hạn.

### 2.3. Nội dung và thông báo

- Dùng tiếng Việt tự nhiên; ví dụ: “Tìm thấy 37 dòng có thể trùng”, không tuyên bố “đã sửa chính xác 100%”.
- Mọi thao tác dài có `queued / processing / ready / failed` và thông báo lỗi cụ thể, có nút thử lại khi an toàn.
- Không cho người dùng tải hoặc xem job của người khác dù đoán được ID.
- Luôn cho xem dữ liệu mẫu và một bản báo cáo thay đổi trước khi trả tiền.

---

## 3. Kiến trúc triển khai tối giản

### 3.1. Quyết định kỹ thuật sau khảo sát repo

**Ưu tiên A — giữ nguyên framework/backend hiện tại** nếu xử lý file và tác vụ nền đáp ứng được. Giao diện web dùng các component, layout, routing sẵn có.

**Ưu tiên B — tách `tools-worker` nhỏ** nếu server hiện tại không nên/không thể đọc và ghi Excel, hoặc OCR nặng. Có thể dùng Python (`openpyxl`, `pandas` khi phù hợp) hoặc thư viện Node tương đương; chọn theo môi trường deploy được xác minh. Chỉ thêm queue bền vững khi thực sự cần; ban đầu có thể dùng bảng `jobs` và một worker poll có khóa nhận việc. Không xử lý job dài trong request HTTP.

**Lưu ý hosting:** xác minh quy tắc chạy Node/Python, cron, dung lượng đĩa, reverse proxy và giới hạn process trước khi chọn triển khai. Không giả định shared hosting hỗ trợ Docker hay worker luôn hoạt động. Nếu hạ tầng không phù hợp, deploy processor tại service riêng và giữ giao diện tại domain chính.

### 3.2. Sơ đồ luồng

```text
Browser /tools
    |
    v
Web app/API --------------------> Database (job, order, audit)
    |                                 |
    +---- Upload validated files ----> Private file storage
    |                                 |
    +---- Create processing job -----> Worker/processor
    |                                      |
    |<---- Preview + quote ----------------+
    |
    +---- Create payment order ------> Payment provider
    |                                      |
    |<---- Verified webhook / query -------+
    |
    +---- Authorized download -------> Private result file
```

**Nên dùng private object storage** nếu có và có thể cấu hình hợp lệ. Nếu lưu local, đặt ngoài public web root, đảm bảo quyền truy cập và cleanup; lưu ý storage local có thể mất khi deploy/container restart. Không lưu Excel, ảnh chứng từ hoặc nội dung nhạy cảm vào logs.

### 3.3. Cấu trúc dự án tham khảo — điều chỉnh theo repo thực tế

```text
/tools                      # landing + 4 module pages
/tools/excel
/tools/billscan
/tools/sitereport
/tools/quotecompare
/api/tools/*                # API dùng chung
server/tools/
  jobs/                     # state machine, quotes, ownership
  files/                    # upload validation, storage, cleanup
  payments/                 # abstraction, webhook, reconciliation
  processors/
    excel/
      deduplicate
      merge
      compare
    billscan/
      extract
  notifications/            # optional
  db/
  tests/
```

Không bắt buộc chính xác tên thư mục này. Mục tiêu là **tách common platform khỏi từng processor**.

---

## 4. Phần lõi dùng chung cho cả bốn công cụ

### 4.1. Job và trạng thái

Mỗi lượt xử lý là một `job` có ID ngẫu nhiên khó đoán, `tool_type`, `operation`, cấu hình đã được validate, input, trạng thái, thời gian hết hạn, giá cuối cùng và kết quả.

Trạng thái nên đủ rõ:

`created → uploaded → queued → processing → preview_ready → payment_pending → paid → result_ready → expired`

Nhánh lỗi: `failed`, `cancelled`. Không bắt buộc mọi job đi qua `payment_pending` nếu còn ở beta. Khi đã thanh toán, worker thất bại phải có cơ chế retry an toàn hoặc hoàn tiền/hỗ trợ, không đánh dấu `result_ready` khi file chưa tồn tại.

**Idempotency:** retry upload, worker, callback hoặc webhook không được tạo nhiều khoản thanh toán, nhiều lượt xử lý gây sai dữ liệu. Dùng transaction và unique constraint.

### 4.2. Database tối thiểu

- `tool_jobs`: id, tool_type, operation, status, configuration_json, result_summary_json, quoted_amount_vnd, owner_token_hash, created_at, expires_at, error_code.
- `tool_files`: id, job_id, role (`input|preview|output`), private_storage_key, original_filename, size_bytes, mime_detected, sha256, created_at, delete_after.
- `tool_orders`: id, job_id, provider, provider_order_id, amount_vnd, currency, status, paid_at, created_at.
- `tool_payment_events`: provider_event_id **unique**, order_id, signature_valid, received_at, processed_at; không ghi nguyên thông tin nhạy cảm.

Có thể bổ sung `tool_job_events` để trace nhưng không log nội dung file. Migration phải không ảnh hưởng bảng sẵn có.

### 4.3. Không bắt đăng ký trong MVP

- Khi tạo job, tạo **một secret token** ngẫu nhiên, lưu hash phía server, truyền về trình duyệt dưới hình thức session/cookie an toàn hoặc access token được kiểm soát; ID job không phải quyền truy cập.
- Phải kiểm tra ownership cho preview, trạng thái, thanh toán và download.
- Nếu dùng cookie: cấu hình `Secure`, `HttpOnly`, `SameSite` thích hợp và bảo vệ CSRF ở API đổi trạng thái. Nếu dùng bearer token: tránh lưu token vào URL, log hoặc analytics.
- Mất phiên có thể mất quyền tải file; thông báo trước. Email nhận link là tùy chọn về sau, không buộc thu thập email từ đầu.

### 4.4. Xử lý file và bảo mật

- Ban đầu giới hạn Excel `.xlsx`, `.csv`; **không nhận `.xlsm` và không chạy macro**. `.xls` cũ hướng dẫn lưu thành `.xlsx`.
- Không tin extension, MIME do client gửi hoặc tên file. Kiểm tra định dạng thực tế, kích thước giải nén, số file, số dòng/cột, tổng tài nguyên; chặn zip bomb và path traversal.
- Giới hạn khởi điểm có thể chỉnh bằng env: tối đa **10 MB/file; 5 file/job; 100.000 dòng tổng/job; 100 cột/sheet**. Cần benchmark rồi mới công bố giới hạn chính thức. CSV cần xác định encoding và delimiter, cảnh báo khi nhập mơ hồ.
- Giới hạn thời gian, RAM, concurrency mỗi worker. Rate limit upload, preview, tạo order, download và webhook.
- Không thực thi công thức, liên kết ngoài, DDE, nội dung nhúng hay macro. Khi xuất CSV, phòng chống formula injection cho các giá trị bắt đầu bằng `=`, `+`, `-`, `@` khi nội dung đó có thể bị Excel diễn giải như công thức.
- Giữ input bất biến, xuất output riêng. Không tự ghi đè file khách tải lên.
- Cấu hình dọn input/output, ví dụ sau **24 giờ** kể từ khi tạo job; chính sách cụ thể phải hiển thị và cleanup được kiểm chứng. `expired` phải từ chối cấp link mới. Không cache file riêng tư tại CDN công khai.
- Đối với hóa đơn/chứng từ: phải có đồng ý xử lý dữ liệu và chính sách gửi dữ liệu tới nhà cung cấp OCR/AI, khu vực xử lý và thời hạn lưu trữ trước khi bật BillScan.

---

## 5. EXCEL RESCUE — MVP hoàn chỉnh đầu tiên

### 5.1. Phạm vi 3 thao tác

#### A. Tìm dòng trùng (`deduplicate`)

**Input:** 1 file `.xlsx`/`.csv`, chọn sheet nếu có nhiều sheet, chọn 1–3 cột làm khóa so khớp, tùy chọn trim khoảng trắng và phân biệt hoa/thường.

**Quy tắc mặc định:** chỉ xác định trùng khi **các khóa chuẩn hóa giống hệt nhau**, không dùng AI suy đoán. Người dùng chọn giữ dòng đầu hoặc dòng cuối. Không âm thầm cộng gộp giá trị tiền/số lượng.

**Preview:** tổng dòng; số nhóm trùng; số dòng có thể loại; bảng ví dụ với khóa và số dòng gốc.

**Output:** `Cleaned` (giữ dòng theo quy tắc), `Duplicates` (các dòng bị loại và tham chiếu dòng giữ), `Summary` (cấu hình + số liệu). Luôn giữ header và thứ tự dữ liệu ổn định. Không xóa cột ngoài phạm vi.

**Quan trọng:** ô trống, kiểu dữ liệu khác nhau (`00123` vs `123`), ngày tháng, công thức, merged cells phải được xử lý minh bạch. Với khóa trống, mặc định **không tự coi là trùng** mà đưa vào danh sách cảnh báo; cho phép người dùng chọn chính sách khác nếu thực sự cần.

#### B. Gộp file/sheet (`merge`)

**Input:** 2–5 file, một sheet được chọn trên mỗi file (hoặc tùy chọn chọn nhiều sheet với giới hạn tổng dòng). Chọn ghép theo **tên cột**, không mặc định theo vị trí.

**Quy tắc:** chuẩn hóa tên cột vừa phải (trim, không tự thay đổi ý nghĩa). Preview mapping cột và các cột khác nhau giữa file. Nếu có xung đột kiểu dữ liệu, giữ an toàn dưới dạng text hoặc cảnh báo để người dùng quyết định. Không tự loại trùng khi ghép.

**Output:** `Merged` và `Summary`; tùy chọn cột `SourceFile`/`SourceSheet`; giữ nguyên giá trị gốc và thứ tự file được chọn. Khi tên cột lặp trong một sheet, yêu cầu người dùng sửa mapping hoặc dùng định danh cột, không tự ghi đè.

#### C. Đối chiếu hai bảng (`compare`)

**Input:** File A và B; chọn sheet, khóa khớp và các cột cần so sánh; hỗ trợ ánh xạ tên cột khác nhau. Mặc định so khớp **exact** theo khóa; trim/case folding là tùy chọn và hiển thị rõ.

**Quy tắc:** phát hiện khóa chỉ có A, chỉ có B, có ở cả hai nhưng khác giá trị, và giống nhau. **Nếu một khóa có nhiều dòng tại A hoặc B, không ghép tùy tiện:** đưa vào `DuplicateKeys` cần xử lý hoặc yêu cầu chọn khóa đầy đủ hơn.

**Output:** `OnlyA`, `OnlyB`, `Changed` (giá trị A, B theo cột và loại chênh lệch), `Matched` (nếu được bật), `DuplicateKeys`, `Summary`.

**So sánh số:** không tự làm tròn, có tùy chọn tolerance số tuyệt đối/%, mặc định tolerance = 0. Chuỗi và ngày tháng phải chuẩn hóa có kiểm soát; báo nếu không thể so sánh an toàn.

### 5.2. Giá MVP

- `deduplicate`: 49.000đ/job trong giới hạn công bố.
- `merge`: 79.000đ/job.
- `compare`: 99.000đ/job.

Các giá trên chỉ là **mức thử nghiệm dự kiến**; lưu trong config server, không mã cứng nhiều chỗ. Báo giá **trước khi thanh toán** và không thay đổi trên order đã tạo. Có chế độ `FREE_BETA` cho kiểm thử thật không thu tiền. Không được giả vờ giao dịch đã hoàn tất.

### 5.3. Preview và download

- Preview trả về **thống kê và tối đa 10–20 dòng mẫu**, dữ liệu có thể chứa thông tin nhạy cảm nên chỉ chủ job xem được.
- Trước thanh toán **không cấp output file**, không đưa toàn bộ kết quả vào payload frontend, HTML, source map, response hoặc link có thể đoán.
- Sau khi được xác thực thanh toán hoặc đang trong `FREE_BETA`, cấp URL download ngắn hạn từ server; kiểm tra session/token và trạng thái job.
- Export `.xlsx` với sheet tên cố định không vượt giới hạn Excel; tên file an toàn; bổ sung `Summary` mô tả cấu hình, số lượng và cảnh báo. Không sao chép công thức/format phức tạp rồi tuyên bố bảo toàn 100% nếu engine chỉ xử lý giá trị; thông báo upfront “Xuất dữ liệu dạng giá trị; định dạng và công thức có thể không được giữ nguyên”.

### 5.4. Chấp nhận sản phẩm Excel

- File nhỏ chạy thành công cả 3 thao tác, có output thật và preview khớp output.
- Input không bị sửa; so sánh đối chiếu không nhân bản dòng khi khóa trùng.
- File dữ liệu có tiếng Việt, ký tự đặc biệt, số 0 đầu mã hàng, số âm, ngày tháng được kiểm thử.
- Khách không thể tải file khi chưa thanh toán ở chế độ thu phí, hoặc đọc job khác qua đổi ID.
- Có thông báo dễ hiểu khi file lỗi, vượt giới hạn, thiếu khóa, cột trùng, dữ liệu không so được.

---

## 6. BILLScan — mốc thứ hai, không cản trở ra mắt Excel

### 6.1. Phạm vi cụ thể

Người dùng upload tối đa **20 ảnh/PDF**, tổng dung lượng theo cấu hình; hệ thống OCR và trích xuất chứng từ rồi xuất một Excel thống nhất. Ban đầu chỉ hỗ trợ **hóa đơn/chứng từ tiếng Việt chất lượng đọc được**, không hứa xử lý mọi mẫu và không xác thực pháp lý hóa đơn.

Các trường mục tiêu:

- Tên nhà cung cấp, mã số thuế nếu hiện diện.
- Số chứng từ/hóa đơn, ngày chứng từ.
- Tiền trước thuế, thuế GTGT, tổng thanh toán, tiền tệ.
- Tên file nguồn, trạng thái trích xuất và cảnh báo.

**Không được tự bịa giá trị thiếu.** Trường nào không rõ → `null` + cờ `needs_review` + chỉ ra trang/vùng nguồn nếu engine hỗ trợ. Các phép kiểm tra tổng tiền chỉ là kiểm tra số học, không là xác nhận tính hợp pháp.

### 6.2. Pipeline

`upload → validate → OCR/text extraction → structured extraction → numeric checks → duplicate candidates → review/edit → export`

- PDF có text: ưu tiên trích văn bản thay vì OCR tốn phí; PDF scan/ảnh mới dùng OCR.
- Có thể dùng OCR/AI bên thứ ba **chỉ sau khi cấu hình API hợp lệ và công bố chính sách dữ liệu**. Không có key hoặc chưa được duyệt thì module hiển thị “Chưa mở”, không mô phỏng kết quả.
- Duplicate detection chỉ đưa ra **nghi vấn** dựa trên mã số thuế + số hóa đơn + ngày + tổng tiền; cảnh báo khi thiếu trường. Không tự xóa chứng từ.
- Cho phép người dùng chỉnh sửa thủ công kết quả trích xuất trước khi xuất file; đánh dấu cột đã sửa, tránh diễn giải đầu ra OCR như sự thật tuyệt đối.
- Bản xuất `.xlsx`: `Documents` (mỗi chứng từ một dòng), `NeedsReview`, `Summary`; có thể thêm `DuplicateCandidates`.
- Bảo vệ dữ liệu như Excel Rescue; tránh chuyển dữ liệu chứng từ qua nhà cung cấp không được khách đồng ý.

### 6.3. Tiêu chí hoàn thành BillScan

- Ít nhất một tập kiểm thử nhiều định dạng: ảnh rõ/mờ, PDF text/PDF scan, số tiền có dấu chấm/phẩy, hóa đơn nhiều trang, chứng từ thiếu trường, hóa đơn có nhiều mức thuế.
- Kiểm tra chất lượng theo trường và ghi nhận tỷ lệ cần sửa; không công bố “độ chính xác 99%” khi chưa đo.
- Khi không đủ tin cậy, báo người dùng kiểm tra, không tự điền số.
- Hoàn tất export, thanh toán thật/sandbox theo cùng flow dùng chung và dọn file.

---

## 7. SITE REPORT và QUOTE COMPARE — scaffold, chưa bật xử lý

### SiteReport (`/tools/sitereport`)

- Trang giới thiệu: upload ảnh hiện trường, nhập vị trí/mô tả, tạo báo cáo PDF/DOCX.
- Nút “Sắp ra mắt” rõ ràng; **chưa** mở upload trả phí, **chưa** tạo kết quả AI giả.
- Interface processor dự kiến: `validateInput`, `estimate`, `process`, `preview`, `export`.
- Khi làm ở giai đoạn sau: yêu cầu AI tách **điều nhìn thấy trong ảnh** với **nhận xét/suy luận**, không khẳng định tiến độ hoặc an toàn công trình chỉ dựa vào ảnh.

### QuoteCompare (`/tools/quotecompare`)

- Trang giới thiệu: upload 2–5 báo giá, map sản phẩm, chuẩn hóa đơn vị, so sánh giá/thuế/điều kiện và xuất Excel.
- Scaffold processor tương tự; **không** có nút xử lý/thu phí khi chưa hoàn thành.
- Khi làm sau: không tự xem hai mặt hàng là cùng loại nếu khác quy cách; phải có bước người dùng xác nhận mapping.

---

## 8. Thanh toán: nhanh nhưng phải xác thực

### 8.1. Hai chế độ triển khai

**Chế độ A — `FREE_BETA=true` (phát hành sớm):** hoàn thành upload → preview → download mà không thu tiền. Giao diện ghi rõ “Beta miễn phí”. Thu thập phản hồi và đo chất lượng.

**Chế độ B — thu tiền thật:** cấu hình payment provider có **API/webhook hoặc cơ chế đối soát server-side được hỗ trợ chính thức**. Có thể hiển thị QR chuyển khoản, nhưng chỉ mở khóa output khi server xác nhận khoản tiền gắn đúng `order_id`, đúng số tiền, đúng trạng thái; xác thực webhook/chữ ký hoặc kiểm tra qua API có ủy quyền. Chọn provider sau khi biết tài khoản/khả năng tích hợp thực tế. Không ghi mặc định đã có VietQR/payment gateway.

### 8.2. Order và webhook

1. Server báo giá từ operation và giới hạn file, tạo order unique, amount bất biến, thời hạn thanh toán.
2. Frontend yêu cầu tạo payment intent/QR; không tin amount client gửi.
3. Webhook phải xác thực origin theo hướng dẫn provider (signature/secret), idempotent theo event/provider transaction ID; đối soát đúng order, amount, currency.
4. Transaction cập nhật `paid` và cấp quyền download đúng một job; callback trùng không ghi nhận hai lần.
5. Nếu chưa thanh toán/hết hạn → không mở file. Nếu tiền đã ghi nhận nhưng job lỗi → cơ chế retry hoặc trạng thái hỗ trợ/hoàn tiền.

**Cấm:** dựa vào ảnh chụp chuyển khoản, người dùng bấm “Đã thanh toán”, query `?paid=true`, hay polling client để tự chuyển trạng thái paid.

---

## 9. API contract tham khảo

Tùy stack chọn REST/tRPC sẵn có, nhưng ngữ nghĩa tương đương:

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| `GET` | `/api/tools/catalog` | Danh sách tool, trạng thái, giá tham khảo |
| `POST` | `/api/tools/jobs` | Tạo job theo tool + operation |
| `POST` | `/api/tools/jobs/:id/files` | Upload file, validate và gắn job |
| `POST` | `/api/tools/jobs/:id/process` | Validate config và khởi chạy xử lý |
| `GET` | `/api/tools/jobs/:id` | Trạng thái + thống kê an toàn |
| `GET` | `/api/tools/jobs/:id/preview` | Dữ liệu mẫu có giới hạn |
| `POST` | `/api/tools/jobs/:id/orders` | Tạo order server-side |
| `GET` | `/api/tools/jobs/:id/payment` | Trạng thái payment đã được server xác nhận |
| `GET` | `/api/tools/jobs/:id/download` | Stream hoặc ký URL ngắn hạn sau khi kiểm quyền |
| `POST` | `/api/tools/payments/webhook/:provider` | Webhook xác thực (không dùng session user) |

Với file lớn, dùng streaming hoặc upload có giới hạn; API không nhận base64 toàn bộ file vào JSON. Mọi endpoint job xác thực owner và rate limit (trừ webhook dùng auth riêng). Trạng thái xử lý phải tránh race condition và job duplicate.

**Response ví dụ (không chứa dữ liệu file đầy đủ):**

```json
{
  "jobId": "opaque-random-id",
  "tool": "excel",
  "operation": "compare",
  "status": "preview_ready",
  "summary": {"rowsA": 1200, "rowsB": 1197, "onlyA": 9, "onlyB": 6, "changed": 21, "duplicateKeys": 0},
  "quote": {"currency": "VND", "amount": 99000},
  "expiresAt": "ISO-8601 timestamp"
}
```

Số trong ví dụ chỉ minh họa schema, không được dùng làm dữ liệu production/demo báo cáo thật.

---

## 10. Quản trị và vận hành tối thiểu

Ở MVP chưa cần dashboard quản trị lớn. Cần tối thiểu:

- Log kỹ thuật theo job ID, không ghi nội dung dữ liệu/PII/secrets.
- Theo dõi số job, lỗi, thời gian xử lý, tiền đã được xác thực, download thành công.
- Có cơ chế xử lý job kẹt, retry có giới hạn, dọn file hết hạn và phát hiện giao dịch paid nhưng thiếu output.
- Có trang liên hệ/hỗ trợ; chính sách sử dụng, quyền riêng tư, xử lý/xóa file và hoàn tiền nếu triển khai thu phí.
- Backup DB theo khả năng hosting; backup **không** vô tình lưu dữ liệu khách quá chính sách retention.
- Pin phiên bản dependency và quét lỗ hổng cơ bản. Bảo vệ endpoint với TLS, auth, CSRF thích hợp, limits và storage private.

---

## 11. Lộ trình triển khai có thể bàn giao từng mốc

### Mốc 0 — Khảo sát, không sửa code trước khi hiểu repo (0,5 ngày)

- [ ] Xác minh repo, routing hiện tại, hosting, DB, môi trường staging/local.
- [ ] Xác nhận cách mount `/tools` không ảnh hưởng `/wp/` hay route khác.
- [ ] Ghi quyết định giữ stack hay tách worker, khả năng cron/queue và private storage.
- [ ] Chạy baseline build/test; lưu kết quả.

**Bàn giao:** `docs/tools/TECH_DECISIONS.md` với facts đã kiểm chứng, rủi ro, biến môi trường cần cấp.

### Mốc 1 — Shell chung 4 module (1–2 ngày)

- [ ] Landing `/tools` theo mẫu 4 cards.
- [ ] 4 route con, navigation và mobile UI.
- [ ] Registry công cụ: key, title, icon, description, status, operation, pricing.
- [ ] Trang chính sách và empty/loading/error states.
- [ ] SiteReport/QuoteCompare ở trạng thái “Sắp ra mắt”.

**Bàn giao:** 4 trang điều hướng hoạt động, chưa giả vờ có processor.

### Mốc 2 — Excel Rescue hoàn thiện chức năng xử lý (3–5 ngày)

- [ ] DB/jobs, upload có validate, quyền truy cập, lưu file private.
- [ ] Processor `deduplicate`, `merge`, `compare` đúng quy tắc mục 5.
- [ ] Preview + export Excel thật, tải file được trong `FREE_BETA`.
- [ ] Chặn lỗi/malformed files, giới hạn tài nguyên, cleanup.
- [ ] Unit/integration tests cho các ca ở mục 12.

**Bàn giao:** một người dùng thật xử lý được ba loại file từ đầu đến cuối ở beta miễn phí.

### Mốc 3 — Thanh toán thật + phát hành Excel (2–4 ngày, phụ thuộc provider)

- [ ] Xác nhận nhà cung cấp thanh toán, API credentials, phí, webhook và sandbox.
- [ ] Tạo order + QR/payment + server-side confirmation + download gate.
- [ ] Webhook idempotent, test sai số tiền, trả chậm, duplicate webhook, job lỗi.
- [ ] Hoàn thiện Terms/Privacy/Support/Refund, kiểm tra retention.
- [ ] Staging smoke test, production deploy có kiểm soát, rollback plan.

**Bàn giao:** Excel Rescue có thể nhận tiền thật **chỉ sau khi xác minh giao dịch end-to-end**.

### Mốc 4 — BillScan (4–7 ngày cho bản đầu, phụ thuộc OCR/provider và mẫu thử)

- [ ] Chốt loại chứng từ/định dạng đầu vào.
- [ ] Chọn và kiểm chứng OCR/AI provider + điều kiện xử lý dữ liệu.
- [ ] Trích xuất fields, validation, cảnh báo missing/duplicate.
- [ ] Trang xem/chỉnh sửa kết quả trước export.
- [ ] Tận dụng common jobs/orders/download + thêm test corpus.
- [ ] Mở card BillScan khi kiểm thử ổn định.

**Bàn giao:** BillScan xuất Excel từ tài liệu thực tế, có xác nhận thủ công khi AI/OCR chưa chắc chắn.

**Ước tính trên là mục tiêu kỹ thuật, không phải cam kết; phải điều chỉnh sau khi xem repository và hosting.**

---

## 12. Bộ test và checklist nghiệm thu

### Excel Rescue

- [ ] Tìm trùng: chữ hoa/thường, khoảng trắng, khóa rỗng, dòng giống hệt, khóa số chứa số 0 đầu.
- [ ] Merge: 2–5 file, thứ tự cột khác nhau, thiếu cột, tên cột trùng, file rỗng, nhiều sheet, Unicode tiếng Việt.
- [ ] Compare: chỉ A/chỉ B/khác/giống, khóa trùng ở A/B, null vs 0, ngày tháng, số âm, tolerance.
- [ ] Không thực thi macro/external links/formula; CSV formula injection được xử lý.
- [ ] File không hợp lệ, quá lớn, zip bomb, timeout, upload bị ngắt, concurrent jobs được từ chối/giới hạn an toàn.
- [ ] Preview chỉ chứa tối đa số dòng đã công bố; nội dung đầy đủ không rò vào response trước thanh toán.
- [ ] Input bất biến, file output có đúng sheet và Summary.

### Payment/security

- [ ] Không truy cập được job/file của người khác bằng đoán ID hoặc sửa URL.
- [ ] Chưa trả tiền không có quyền download ở paid mode.
- [ ] Chỉ `FREE_BETA` mới được tải miễn phí; chế độ thu phí bị khóa server-side.
- [ ] Webhook giả/chữ ký sai/sai số tiền/sai order/duplicate event đều không cấp quyền sai.
- [ ] Refresh trang, retry, browser disconnect không tạo order hoặc job trái ý muốn.
- [ ] Cleanup xóa file đúng thời hạn; download sau expired thất bại.

### Regression/deploy

- [ ] Root website và các route đang chạy không bị thay đổi ngoài phạm vi cho phép.
- [ ] Build, lint, test qua được; không có `.env`, credentials hay private file trong Git.
- [ ] Test màn hình mobile, keyboard navigation, lỗi mạng và đường truyền chậm.
- [ ] Có `README` chạy local, env template không chứa secret, migration và script deploy/rollback.

---

## 13. Bộ biến môi trường tham khảo

Tên cụ thể tùy framework. Chỉ thêm biến thực sự sử dụng:

```dotenv
TOOLS_ENABLED=true
TOOLS_FREE_BETA=true
TOOLS_MAX_FILE_MB=10
TOOLS_MAX_FILES_PER_JOB=5
TOOLS_MAX_TOTAL_ROWS=100000
TOOLS_FILE_RETENTION_HOURS=24
TOOLS_STORAGE_BACKEND=private_local_or_object_storage
TOOLS_STORAGE_PATH=/private/path/outside/public/root
TOOLS_PUBLIC_ORIGIN=https://vireon.vn
# DATABASE_URL=...
# PAYMENT_PROVIDER=...
# PAYMENT_API_KEY=...
# PAYMENT_WEBHOOK_SECRET=...
# OCR_PROVIDER=...
# OCR_API_KEY=...
```

**Quan trọng:** `TOOLS_FREE_BETA` là flag server-side; không có chuyện đổi JS ở client để tự mở khóa tải file. Production secret chỉ nhập qua secret manager/env của môi trường deploy; `.env.example` chỉ ghi placeholder.

---

## 14. Những câu hỏi chỉ cần trả lời khi đến đúng mốc

1. **Ngay bây giờ:** repository nào đang phục vụ `vireon.vn` và `/tools` sẽ dùng chung deployment hay reverse proxy? Agent phải tự khảo sát repo/host được cấp quyền, không tự phỏng đoán.
2. **Trước mốc thanh toán:** muốn dùng provider nào, có tài khoản/merchant/API/webhook hợp lệ chưa? Nếu chưa, giữ `FREE_BETA` để ra mắt, không ngăn việc làm Excel.
3. **Trước BillScan:** tài liệu được phép gửi sang OCR/AI bên thứ ba không, loại hóa đơn nào là ưu tiên, giới hạn chi phí OCR mỗi job bao nhiêu?
4. **Trước public launch:** email hỗ trợ, chính sách riêng tư, thời hạn lưu file, hoàn tiền, quy trình xử lý khi báo cáo sai.

Không biến bốn câu hỏi trên thành lý do trì hoãn mốc 1 và mốc 2.

---

## 15. PROMPT GIAO VIỆC CHO CODEX — DÁN NGUYÊN VĂN

> Hãy đọc toàn bộ `VIREON_TOOLS_MVP.md` như đặc tả sản phẩm. Trước hết khảo sát repository và phương thức triển khai thực tế của `vireon.vn`; báo ngắn gọn stack, router, hosting constraints, các route cần bảo vệ và lựa chọn kiến trúc tối giản. Sau đó triển khai **Mốc 1 và Mốc 2**: tạo `/tools` với bốn card/route; SiteReport, QuoteCompare và BillScan chỉ là scaffold đúng trạng thái; hoàn thiện Excel Rescue gồm deduplicate, merge, compare, upload, preview, export, quyền truy cập, cleanup, kiểm thử. Mặc định chạy `TOOLS_FREE_BETA=true`, **chưa thu tiền thật** khi chưa có payment provider đã cấu hình và kiểm thử. Không sửa không cần thiết những phần đang chạy; không tự tạo secret, không ghi dữ liệu khách vào log. Sau mỗi mốc báo danh sách file sửa, lệnh test, kết quả test, URL local, các việc còn tồn và cách chạy/deploy. Nếu thiếu quyền hoặc cấu hình, triển khai những phần độc lập trước và nêu blocker chính xác. Chỉ triển khai BillScan sau khi Excel Rescue đạt checklist nghiệm thu và được yêu cầu chuyển mốc.

### Prompt chuyển sang mốc 3

> Excel Rescue đã vượt nghiệm thu. Đọc lại mục 8 và 12 của `VIREON_TOOLS_MVP.md`, kiểm tra provider/credentials được cấp phép và thực hiện thanh toán server-side có webhook xác thực, idempotency và download gate. Không bật thu phí production nếu chưa test giao dịch thành công, sai số tiền, webhook giả và webhook trùng. Giữ chế độ beta khi thiếu tích hợp thật.

### Prompt chuyển sang mốc 4

> Hoàn thiện BillScan theo mục 6 của `VIREON_TOOLS_MVP.md` trên nền jobs, files, orders, permission và retention sẵn có. Chỉ bật nhận file khi đã có OCR/AI provider hợp lệ, chính sách dữ liệu và test corpus; không tạo dữ liệu OCR giả hoặc tự suy đoán giá trị thiếu. Chưa phát triển SiteReport/QuoteCompare beyond scaffold.

---

## 16. Nguyên tắc quản trị phạm vi

**Luôn có một thứ chạy được ở cuối mỗi mốc.** Ra mắt sớm bằng Excel beta đáng tin cậy tốt hơn ra mắt bốn công cụ demo chưa tạo giá trị. Nếu phát sinh yêu cầu mới, ghi backlog riêng và không phá vỡ deadline của luồng đầu tiên.

**Kết quả mong đợi:** Vireon Tools có bộ khung thống nhất 4 công cụ, Excel Rescue xử lý hoàn chỉnh, BillScan là module hoàn thiện kế tiếp; các công cụ còn lại có thể phát triển dần mà không phải xây lại nền tảng.
