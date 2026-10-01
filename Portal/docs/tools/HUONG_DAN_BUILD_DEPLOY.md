# Hướng dẫn tự build, backup, deploy và đọc log Vireon Portal

Cập nhật: 30/09/2026. Áp dụng cho repository Portal và hosting cPanel hiện tại của vireon.vn. Các đường dẫn dưới đây gắn với tài khoản `pauldigi`; khi chuyển hosting phải sửa cấu hình/script trước khi dùng.

**Bổ sung bản commerce:** xem [cấu hình Google Drive/MoMo, QR và kích hoạt giao dịch](./DRIVE_MOMO_ADMIN.md). Helper backup mới lưu thêm khóa mã hóa; không rollback về beta cũ khi còn job thu phí/Drive. Các kiểm tra free beta phía dưới chỉ áp dụng khi admin đang tắt thu phí. Sau khi bật cần kiểm tra cả luồng gửi mã giao dịch qua Zalo → admin kích hoạt → reload/quét QR tải file.

## 1. Phân biệt hai nơi chạy lệnh

| Nơi | Dùng để | Cách mở |
|---|---|---|
| **Máy Windows — PowerShell** | Cài thư viện, kiểm thử, build, tạo gói upload | Mở thư mục dự án trong Explorer, gõ `powershell` vào thanh địa chỉ, Enter |
| **Hosting — cPanel Terminal (Linux/Bash)** | Backup, cài thư viện Linux, deploy, cron, xem log | Đăng nhập cPanel, tìm `Terminal` |

Không dán lệnh PowerShell vào Terminal Linux hoặc ngược lại. Trong PowerShell, dùng `npm.cmd` để tránh lỗi chính sách chạy `npm.ps1`. Nếu mở CMD, gõ `powershell` trước rồi làm theo hướng dẫn này.

| Thành phần | Đường dẫn |
|---|---|
| Source trên Windows | `D:\SOURCE-CODE\Git\EduManagement\Portal` |
| Thư mục gói build trên Windows | `D:\SOURCE-CODE\Git\EduManagement\Portal\outputs` |
| App root Passenger | `/home/pauldigi/apps/vireon-portal` |
| File cấu hình thật | `/home/pauldigi/apps/vireon-portal/.env` |
| Các bản phát hành | `/home/pauldigi/vireon-releases` |
| Backup | `/home/pauldigi/vireon-backups` |
| Document root tên miền | `/home/pauldigi/vireon.vn` |
| Dữ liệu upload Portal | `/home/pauldigi/vireon-data` |
| File Excel Tools riêng tư | `/home/pauldigi/vireon-tools-data` |

Website chạy qua `app.cjs` trong app root. File này nạp `.env`, sau đó trỏ đến `runtime/server.js` của release đang dùng. Vì vậy **upload gói vào document root không phải là deploy**.

Bản live cập nhật ngày 30/09/2026 là `tools-20260930-commerce-r3`. Checkpoint trước triển khai: `/home/pauldigi/vireon-backups/tools-20260930-commerce-r3-1790770483413`. Các helper mới bổ sung trong source cùng tài liệu này chỉ có hiệu lực khi được đóng gói/upload; không mặc định rằng helper trong release cũ trên hosting đã được cập nhật.

## 2. Build trên Windows

### 2.1. Mở đúng thư mục và kiểm tra công cụ

```powershell
Set-Location 'D:\SOURCE-CODE\Git\EduManagement\Portal'
node --version
npm.cmd --version
tar --version
git status --short
```

Dùng Node.js 22, tối thiểu 22.13.0 theo `package.json`. Hosting hiện dùng Node 22. Nếu chưa có Node, cài bản Node 22 từ [nodejs.org](https://nodejs.org/), mở lại PowerShell rồi kiểm tra. `git status` giúp biết bản đang build có thay đổi chưa commit; không tự chạy `git reset` để làm sạch.

Tắt cửa sổ đang chạy preview/standalone của chính dự án bằng `Ctrl+C` trước khi build. Không tắt toàn bộ tiến trình Node trên máy.

### 2.2. Cài đúng thư viện đã khóa phiên bản

```powershell
npm.cmd ci
```

Chờ lệnh kết thúc và kiểm tra:

```powershell
$LASTEXITCODE
```

`0` là thành công. Khác `0`: dừng, xử lý lỗi rồi mới tiếp tục. Tài liệu này dùng npm và `package-lock.json`; không luân phiên npm/pnpm trong cùng quy trình. `npm ci` có thể thay thế `node_modules` hiện tại và cần mạng để tải thư viện.

### 2.3. Kiểm thử và build đúng chế độ cPanel

Chạy từng dòng, chỉ sang dòng sau khi dòng trước thành công:

```powershell
npm.cmd test
node --test tests/tools-release.test.cjs
npx.cmd --no-install tsc --noEmit
npm.cmd audit --omit=dev
New-Item -ItemType Directory -Force outputs | Out-Null
npm.cmd run build:cpanel 2>&1 | Tee-Object -FilePath outputs\build-cpanel.log
$LASTEXITCODE
```

**Lệnh cần dùng là `npm.cmd run build:cpanel`.** `npm run build` của dự án là nhánh build Vinext, không phải gói Passenger trong hướng dẫn này.

Kết quả cần có:

```powershell
Test-Path .next\standalone\server.js
Test-Path .next\standalone\.next\BUILD_ID
Test-Path .next\static
```

Cả ba phải trả `True`. Build thành công chưa chứng minh MySQL/cron trên hosting hoạt động; phần kiểm thử Linux phía dưới vẫn bắt buộc.

`npm test` kiểm tra logic Excel và API pilot. Integration MySQL là bước riêng, chỉ dùng database test trên máy; nếu không cấu hình instance test thì test có thể báo skip. Không lấy thông tin database production để chạy thử trên máy cá nhân. Nếu audit phát hiện vấn đề mới, đọc và xử lý có kiểm thử; không chạy `npm audit fix --force` cho qua bước.

### 2.4. Tạo gói phát hành mới

Mỗi lần phát hành dùng tên mới theo mẫu `tools-YYYYMMDD-ten`. Ví dụ dưới dùng `tools-20261001-r1`; thay bằng ngày/tên của lần thực tế và dùng nhất quán ở cả Windows lẫn Linux.

```powershell
$releaseId = 'tools-20261001-r1'
node deploy\tools-package.cjs $releaseId
$LASTEXITCODE
Get-FileHash "outputs\$releaseId.tar.gz" -Algorithm SHA256
Get-Content "outputs\$releaseId.tar.gz.sha256"
tar -tzf "outputs\$releaseId.tar.gz" | Select-String 'deploy/tools-|runtime/server.js|manifest.json'
```

Hai mã SHA256 phải giống nhau, không phân biệt chữ hoa/thường. Upload hai file:

- `outputs\tools-20261001-r1.tar.gz`
- `outputs\tools-20261001-r1.tar.gz.sha256`

Gói chứa Next build, static/public, server Tools, migration, lockfile, source và ba helper release/smoke/verify. Nó không mang `node_modules` Windows hoặc file `.env` lên hosting. Không upload toàn bộ thư mục dự án. Nếu báo `Release already exists`, chọn ID mới; không ghi đè gói đã từng deploy.

## 3. Đăng nhập cPanel và upload

1. Mở [cPanel Vietnix](https://host126.vietnix.vn:2083/).
2. Đăng nhập bằng tài khoản hosting và mật khẩu của bạn; nhập mã xác thực nếu hosting yêu cầu. Không dùng lại link chứa `cpsess...` từ phiên trước.
3. Mở **File Manager**, vào `/home/pauldigi/vireon-releases`. Nếu chưa có, tạo thư mục này trong home của tài khoản.
4. Bấm **Upload**, chọn hai file gói và SHA256 ở bước trên, chờ upload hoàn tất.
5. Quay về cPanel, tìm **Terminal**, mở và chấp nhận thông báo mở Terminal nếu có. Nếu hosting không cung cấp Terminal, cần nhà cung cấp bật quyền Terminal/SSH để chạy quy trình này.

Không upload `.env`, database backup hoặc file khách vào `public_html` hay `/home/pauldigi/vireon.vn`.

## 4. Chuẩn bị release trên hosting

Từ đây các khối `bash` chạy trong **cPanel Terminal**, không phải PowerShell.

```bash
source /home/pauldigi/nodevenv/apps/vireon-portal/22/bin/activate
node --version
npm --version
RELEASE=tools-20261001-r1
cd /home/pauldigi/vireon-releases
sha256sum "$RELEASE.tar.gz"
cat "$RELEASE.tar.gz.sha256"
```

So sánh mã với Windows. File `.sha256` của helper chỉ chứa mã hash, không phải định dạng có tên file cho `sha256sum -c`. Nếu khác nhau, dừng và upload lại.

```bash
tar -tzf "$RELEASE.tar.gz" | head -n 20
test ! -e "$RELEASE"
echo $?
```

Lệnh `test` phải trả `0`: thư mục release chưa tồn tại. Nếu trả `1`, dừng để tránh trộn file với release cũ. Sau đó:

```bash
tar -xzf "$RELEASE.tar.gz"
cd "/home/pauldigi/vireon-releases/$RELEASE"
pwd
ls deploy
set -o pipefail
```

`pwd` phải đúng release mới, `ls deploy` phải có `tools-release.cjs`, `tools-smoke.cjs`, `tools-verify.cjs`. `pipefail` giúp mã lỗi vẫn đúng khi ghi log qua `tee`; phải đặt lại khi mở Terminal mới.

Không `source .env`. Helper tự nạp cấu hình khi cần; nạp toàn bộ biến Tools vào shell có thể làm sai môi trường benchmark.

## 5. Backup: chạy thế nào, chứa gì?

### 5.1. Backup trước khi deploy

Đang đứng trong **release mới**, chạy:

```bash
node deploy/tools-release.cjs backup 2>&1 | tee backup.log
echo $?
```

Chỉ tiếp tục khi mã thoát `0` và thấy `TOOLS_BACKUP_OK /home/pauldigi/vireon-backups/...`.

Helper mới tạo các thành phần:

| File | Nội dung |
|---|---|
| `application.tar.gz` | Các file ứng dụng/cấu hình trong app root ban đầu |
| `app.cjs`, `.env` | Entry và cấu hình trước khi thay đổi |
| `active-runtime.tar.gz`, `active-runtime.json` | Runtime release đang được entry trỏ tới, gồm thư viện Linux, cùng đường dẫn phục hồi; có khi app dùng release riêng |
| `database.sql` | Database Portal, **loại trừ cả schema và dữ liệu của 5 bảng `tool_*`** |
| `uploads.tar.gz` | Upload Portal theo `STORAGE_ROOT`, nếu thư mục có tồn tại |
| `crontab.txt` | Lịch cron trước deploy |
| `sitemap.xml` | Sitemap tĩnh nếu còn tồn tại |

File Excel/preview/session của Tools không nằm trong backup dài hạn. Đây là backup phục hồi Portal/code, **không phải bản sao đầy đủ mọi dữ liệu Tools hoặc toàn tài khoản cPanel**; không chứa toàn bộ WordPress `/wp/`, email hay cấu hình DNS. Nếu cần backup các phần đó, dùng quy trình backup hosting riêng và xác định chính sách giữ dữ liệu khách trước.

Xác nhận backup tồn tại và archive đọc được:

```bash
BACKUP=$(node -p "require('./release-state.json').backup")
ls -lh "$BACKUP"
tar -tzf "$BACKUP/application.tar.gz" > /dev/null
echo $?
```

Nếu có archive runtime:

```bash
tar -tzf "$BACKUP/active-runtime.tar.gz" > /dev/null
echo $?
cat "$BACKUP/active-runtime.json"
```

Không `cat .env` hoặc `cat database.sql` để kiểm tra. Chúng có thông tin bí mật. Có thể tải backup về nơi lưu riêng có kiểm soát truy cập. Các kiểm tra trên chứng minh file/archive đọc được; muốn chứng minh khôi phục toàn bộ cần diễn tập restore trên môi trường riêng.

**Giữ nguyên release đang live và release trước đó.** Rollback nhanh đổi entry/env/cron, không tự giải nén `active-runtime.tar.gz`. Các backup tạo bằng helper cũ trước tài liệu này chưa có archive runtime riêng, nên càng cần giữ thư mục release cũ.

### 5.2. Backup thêm mà không deploy

Với **helper mới đã được upload** vào một release hợp lệ, có thể chạy:

```bash
node deploy/tools-release.cjs snapshot 2>&1 | tee snapshot.log
echo $?
```

`snapshot` tạo backup mới của app đang live, in đường dẫn `TOOLS_BACKUP_OK`, không đổi con trỏ rollback trong `release-state.json` và không restart website. Nó có cùng phạm vi dữ liệu như bảng trên. Ghi lại đường dẫn được in ra; không lấy trường `backup` trong state để tìm snapshot này.

Helper của `tools-20260929-beta1` đang trên hosting chưa mặc định có lệnh `snapshot`. Muốn dùng ngay, upload gói mới theo mục 2–4 rồi chạy helper trong gói mới; chưa cần `apply` gói đó. Không thay `snapshot` bằng `checkpoint` trên release đã live: checkpoint chỉ dành cho release chuẩn bị kích hoạt.

Kiểm tra dung lượng trước khi backup nhiều lần:

```bash
df -h /home/pauldigi
du -sh /home/pauldigi/vireon-backups /home/pauldigi/vireon-releases
```

Backup nằm cùng hosting không bảo vệ khỏi mất cả tài khoản/ổ đĩa. Lưu thêm bản bên ngoài và chỉ dọn bản cũ sau khi xác định rõ bản cần giữ để rollback.

## 6. Cài và kiểm tra bản mới trước khi chuyển website

Chạy **từng bước**, sau mỗi bước gõ `echo $?`. Khác `0` thì dừng, đọc log; không chạy tiếp `apply` hoặc tự sửa cờ trong state thành `true`.

```bash
node deploy/tools-release.cjs prepare 2>&1 | tee prepare.log
echo $?
```

Thành công: `TOOLS_PREPARED`. Bước này cài thư viện Linux bằng npm lockfile và chạy migration Tools. Migration hiện tại bổ sung bảng bằng `CREATE TABLE IF NOT EXISTS`; những thay đổi schema phá tương thích về sau cần quy trình riêng.

```bash
node deploy/tools-smoke.cjs 2>&1 | tee staging.log
echo $?
```

Thành công: các dòng `PASS` và `TOOLS_STAGING_SMOKE_OK`. Staging dùng `127.0.0.1:3219`, tự đóng khi kiểm tra xong. Nó dùng database hosting; kiểm tra tạo một phiên Tools thử nghiệm, không upload dữ liệu khách.

```bash
node deploy/tools-verify.cjs 2>&1 | tee verify.log
echo $?
```

Thành công: đủ ba dòng `TOOLS_LINUX_E2E_PASS deduplicate`, `merge`, `compare`. Helper mới tạo CSV mẫu, xử lý/download thật, kiểm tra phân quyền rồi xóa dữ liệu thử của chính nó. Nó giữ khóa chung với cron trong lúc xử lý mẫu và chỉ xử lý ID của mẫu; không lấy ngẫu nhiên job khách trong hàng đợi. Nếu worker đang giữ khóa hoặc hệ thống đã đầy lượt, chờ lúc ít tải rồi chạy lại; không xóa job khách để vượt giới hạn.

```bash
node deploy/tools-release.cjs benchmark 2>&1 | tee benchmark.log
echo $?
```

Thành công: `TOOLS_LINUX_BENCHMARK_OK`. Bài đo hiện thử 200.000 ô, lớn hơn giới hạn live 100.000 ô, và kiểm tra website vẫn phản hồi. Chạy lúc ít tải; không mở nhiều benchmark cùng lúc. Nếu thất bại, đọc log và kiểm tra tài nguyên, không bật cờ bằng tay. Không chạy helper benchmark với `--env-file` chứa giới hạn 100.000 ô vì fixture sẽ bị giới hạn từ chối.

```bash
cat release-state.json
```

Cần có `prepared`, `smokePassed`, `e2ePassed`, `linuxBenchmarkPassed` là `true` trước khi chuyển website.

## 7. Chuyển website sang release mới

Chọn thời điểm ít người dùng. Tools sẽ tạm tắt giữa bước `apply` và `enable`.

### 7.1. Chốt backup gần thời điểm chuyển

```bash
node deploy/tools-release.cjs checkpoint 2>&1 | tee checkpoint.log
echo $?
```

Checkpoint tạo backup mới. Sau khi hoàn tất, phải chạy `apply` trong vòng 15 phút; quá thời gian thì chạy lại checkpoint. Backup ban đầu vẫn còn, state chuyển sang dùng backup mới nhất.

### 7.2. Áp dụng và cài cron

```bash
node deploy/tools-release.cjs apply 2>&1 | tee activate.log
echo $?
```

Thành công: `TOOLS_APPLIED_DISABLED`. Helper đổi `app.cjs`, cập nhật env và tạo tín hiệu restart Passenger. Tiếp theo:

```bash
node deploy/tools-release.cjs cron 2>&1 | tee cron.log
echo $?
crontab -l
```

Thành công: `TOOLS_CRON_INSTALLED`. Chỉ có một dòng mang nhãn `# vireon-tools-worker`, trỏ tới worker của release mới. Helper giữ các cron khác, thay dòng worker Tools cũ. Không thêm một cron Tools thứ hai qua giao diện cPanel.

### 7.3. Chờ cron thật chạy rồi bật Tools

Chờ khoảng 1–2 phút, sau đó:

```bash
node deploy/tools-release.cjs enable 2>&1 | tee enable.log
echo $?
```

Thành công: `TOOLS_ENABLED`. Helper yêu cầu heartbeat sau thời điểm cài cron và mới trong 2 phút. Nếu báo `Scheduled worker heartbeat missing`, xem mục lỗi bên dưới; không cập nhật heartbeat bằng SQL để vượt kiểm tra.

### 7.4. Kiểm tra bằng trình duyệt

Mở [trang chủ](https://vireon.vn/), [Tools](https://vireon.vn/tools), [Excel Tools](https://vireon.vn/tools/excel), [sitemap](https://vireon.vn/sitemap.xml) và [WordPress cũ](https://vireon.vn/wp/).

Tạo file `mau.csv` bằng Notepad, lưu UTF-8:

```csv
ID,Value
001,A
001,B
002,C
```

Upload vào Excel Tools, chờ đọc file, chọn loại trùng theo cột ID. Kỳ vọng còn hai dòng dữ liệu và bỏ một dòng; tải XLSX, mở được bằng Excel. Mỗi pha đọc/xử lý có thể đợi lượt cron tiếp theo, khoảng một phút. Tải lại trang và kiểm tra lịch sử khi vẫn dùng cùng trình duyệt/cookie. Dùng chức năng xóa lượt thử sau khi kiểm tra.

Kiểm tra thêm merge/compare nếu thay đổi bộ xử lý Excel. Trên điện thoại kiểm tra nút tải file và bảng không làm vỡ bố cục. Ghi lại release ID, đường dẫn backup, thời điểm deploy và kết quả.

## 8. Rollback khi bản mới có lỗi

Chạy từ **thư mục release mới vừa gây lỗi**. Không chạy rollback trong release cũ vì sẽ lùi sang backup khác.

```bash
source /home/pauldigi/nodevenv/apps/vireon-portal/22/bin/activate
cd /home/pauldigi/vireon-releases/tools-20261001-r1
set -o pipefail
node deploy/tools-release.cjs rollback 2>&1 | tee rollback.log
echo $?
```

Thành công: `TOOLS_ROLLBACK_OK`. Helper phục hồi entry, `.env`, cron nếu đã thay và sitemap tĩnh nếu đã chuyển. Mở lại trang chủ/Tools, kiểm tra cron và log.

Rollback **không import lại database**, không xóa bảng Tools, không khôi phục upload từ tar. Điều này tránh ghi đè dữ liệu mới phát sinh sau deploy. Nếu lỗi do migration phá dữ liệu/schema, cần đánh giá và phục hồi database riêng sau khi sao lưu trạng thái hiện tại; không chạy import SQL theo thói quen khi chỉ lỗi giao diện/code.

Nếu release cũ đã bị xóa, rollback entry sẽ không đủ: đọc `active-runtime.json` trong backup và phục hồi `active-runtime.tar.gz` vào đúng thư mục cha được ghi nhận, gồm thư viện Linux. Chỉ làm sau khi xác nhận đường dẫn và không ghi đè runtime đang phục vụ. Nếu rollback về bản trước khi có Tools, cron Tools cũ có thể không tồn tại; cần xử lý các file Tools còn lại theo chính sách hết hạn, không bỏ quên chúng.

## 9. Đọc log và kiểm tra hoạt động

### 9.1. Log của lần deploy

```bash
cd /home/pauldigi/vireon-releases/tools-20261001-r1
tail -n 80 prepare.log
tail -n 80 staging.log
tail -n 80 verify.log
tail -n 80 benchmark.log
tail -n 80 activate.log
tail -n 80 enable.log
cat release-state.json
```

Chỉ đọc file của bước đã chạy. `tail -n 80` in 80 dòng cuối; tìm lỗi đầu tiên của lần chạy, không chỉ dòng cuối `Command failed`.

### 9.2. Log worker và website

```bash
tail -n 100 /home/pauldigi/vireon-tools-worker.log
tail -f /home/pauldigi/vireon-tools-worker.log
```

`tail -f` theo dõi liên tục. `Ctrl+C` chỉ dừng việc xem log, không dừng worker.

Một dòng worker có dạng:

```json
{"event":"tools_task","job":"UUID","phase":"process","durationMs":1200,"maxRssKb":90000,"outcome":"ok"}
```

`durationMs` là mili giây; `maxRssKb / 1024` xấp xỉ MiB RAM. `outcome: ok` nghĩa là pha thành công. `tools_task_error` hoặc `tools_worker_unavailable` cần đối chiếu job/DB/config. Cron không có job có thể không ghi dòng nào: **log trống không chứng minh cron bị chết**.

Log Passenger/Node hiện có thể đọc ở:

```bash
ls -lh /home/pauldigi/apps/vireon-portal/*log
tail -n 100 /home/pauldigi/apps/vireon-portal/stderr.log
```

Nếu không có file hoặc không có dòng mới, xem mục **Errors** trong cPanel và cấu hình log của Node.js App trên hosting. `startup.log`/`startup-error.log` từ entry cũ có thể còn tồn tại nhưng không phản ánh lần chạy mới; luôn xem thời gian cập nhật. Không xem việc restart hết lỗi ngay là bằng chứng đã sửa nguyên nhân.

### 9.3. Xem heartbeat và trạng thái qua phpMyAdmin

Trong cPanel mở **phpMyAdmin**, chọn đúng database Portal, tab **SQL**, chạy các câu chỉ đọc sau:

```sql
SELECT id, heartbeat_at,
       TIMESTAMPDIFF(SECOND, heartbeat_at, UTC_TIMESTAMP()) AS seconds_ago
FROM tool_runtime;

SELECT status, COUNT(*) AS total
FROM tool_jobs
GROUP BY status;

SELECT id, status, phase, attempts, error_code, created_at, expires_at
FROM tool_jobs
ORDER BY created_at DESC
LIMIT 20;
```

Heartbeat bình thường mới trong khoảng một phút; trên ba phút API sẽ từ chối job mới. Dùng UTC để tính tuổi heartbeat, không so trực tiếp với đồng hồ giờ Việt Nam. Chỉ lấy metadata vận hành, không xuất preview/file/token của khách để gửi hỗ trợ.

Luồng bình thường: `uploading → queued → processing → configured` (đọc xong), rồi `queued → processing → ready` (xử lý xong). `failed` cần xem mã lỗi; `expired` hết thời hạn.

### 9.4. Chạy worker thủ công để chẩn đoán

Xác nhận chính xác release đang live trước khi thay ID trong lệnh:

```bash
source /home/pauldigi/nodevenv/apps/vireon-portal/22/bin/activate
NODE_ENV=production node --env-file=/home/pauldigi/apps/vireon-portal/.env /home/pauldigi/vireon-releases/tools-20261001-r1/runtime/server/tools/worker.cjs
echo $?
```

Đây là thao tác thật: dọn file hết hạn và xử lý tối đa một pha của job đang chờ, không phải lệnh chỉ xem trạng thái. Khóa MySQL ngăn chồng worker. Không dùng `--loop` làm giải pháp thường trực trên cPanel; cron mới là cơ chế vận hành. Sau khi chạy tay, vẫn phải xác nhận cron tự tạo heartbeat ở những phút tiếp theo.

## 10. Lỗi thường gặp và cách xử lý

| Hiện tượng | Kiểm tra và xử lý |
|---|---|
| `node`/`npm` không tìm thấy trên Windows | Cài Node 22, mở lại PowerShell, kiểm tra phiên bản. |
| PowerShell chặn `npm.ps1` | Dùng `npm.cmd`, không cần hạ execution policy toàn máy. |
| `npm ci` báo lockfile không khớp | `package.json` và `package-lock.json` phải được cập nhật cùng nhau ở bước phát triển, kiểm thử rồi build lại. Không sửa lock trên hosting. |
| `EBUSY` ở `.next/standalone` | Dừng preview của dự án bằng Ctrl+C, chuyển Terminal khác ra khỏi thư mục standalone, build lại. |
| Build không tải được tài nguyên/font | Kiểm tra lỗi mạng cụ thể trong `outputs/build-cpanel.log`, kết nối lại rồi build. Không deploy gói thiếu build. |
| `Backup already exists` | Backup khởi tạo chỉ chạy một lần/release; dùng ID mới cho lần phát hành mới, `checkpoint` trước apply hoặc `snapshot` để backup độc lập. |
| `No space left on device` | Xem `df -h`, `du -sh`; dọn bản đã xác định không cần sau khi lưu ngoài hosting. Không xóa release đang live/đích rollback. |
| `Cannot find module` trên Linux | Đọc `prepare.log`, chạy lại `prepare` khi release chưa applied. Phải có dependencies trong `runtime/node_modules`; không copy node_modules Windows. |
| `Access denied`, `ECONNREFUSED`, database thiếu | Kiểm tra MySQL host/port/user/quyền database bằng cPanel và `.env` riêng tư; đọc prepare/migration log. Không đổi mật khẩu ngẫu nhiên. |
| `Staging unavailable`, port 3219 bận | Kiểm tra `ss -ltnp` nếu hosting hỗ trợ, xác định tiến trình staging cũ của mình và dừng đúng PID. Không `killall node`. Helper hiện ẩn stderr của child; muốn xem chi tiết dùng cách debug bên dưới. |
| E2E báo `BUSY` hoặc HTTP 429 | Worker đang chạy hoặc chạm quota/capacity. Chờ ít tải rồi chạy lại; không xóa bảng/job của khách. |
| `Fresh checkpoint required` | Chạy checkpoint mới, kiểm tra thành công rồi apply trong 15 phút. |
| `Scheduled worker heartbeat missing` | Đợi qua lượt cron tiếp theo; xem `crontab -l`, đường dẫn Node/env/worker, worker log và SQL heartbeat. |
| Tools trả 503 | Kiểm tra đã enable chưa; nếu mã `WORKER_OFFLINE`, kiểm tra cron/heartbeat. Đừng tăng giới hạn để chữa cron. |
| POST trả 403 | Kiểm tra origin phải `https://vireon.vn`, cookie phiên và URL truy cập. Không tắt kiểm tra origin. |
| Job 404 sau đổi trình duyệt | Quyền tải gắn cookie của phiên tạo job. Mất cookie/phiên ẩn danh thì tạo lượt mới; không có khôi phục qua email. |
| Upload 413 hoặc file bị từ chối | Mỗi file tối đa 5 MiB, tối đa 5 file; live 10.000 dòng/100.000 ô tổng ngân sách. Giảm dữ liệu; dùng XLSX/CSV phù hợp. |
| `WORKER_TIMEOUT`/`WORKER_ERROR` | Giảm số dòng/cột, kiểm tra worker log/RAM; tiến trình con có heap 256 MiB và timeout 60 giây. Không tăng timeout/worker đồng thời để thử vận may. |
| `WORKER_STOPPED` | Worker trước bị gián đoạn; xác minh cron/DB ổn rồi retry qua UI trong giới hạn. |
| Thiếu CSS/JS, `_next/static` 404 | Kiểm tra archive có `runtime/.next/static`; package script phải lấy static từ build cùng lần. Không ghép static của build cũ. |
| Site vẫn bản cũ / sitemap cũ | Kiểm tra entry `app.cjs`, Passenger app root, restart; file tĩnh trong document root có thể che route Next. Không ghi đè `.htaccess` tùy ý. |
| cPanel báo phiên hết hạn/security token invalid | Vào lại URL đăng nhập gốc, không dùng link `cpsess` đã lưu. |

Để xem lỗi khởi động staging trực tiếp, chỉ khi chắc port 3219 trống, chạy từ release mới:

```bash
NODE_ENV=production HOSTNAME=127.0.0.1 PORT=3219 TOOLS_ORIGIN=http://127.0.0.1:3219 node --env-file=/home/pauldigi/apps/vireon-portal/.env runtime/server.js
```

Đọc lỗi được in ra; Ctrl+C để dừng staging trước khi chạy lại smoke/verify. Đây là chạy server standalone, không phải `next dev`. Không chỉnh cờ state để bỏ kiểm tra.

Restart website sau khi sửa cấu hình đúng:

```bash
mkdir -p /home/pauldigi/apps/vireon-portal/tmp
touch /home/pauldigi/apps/vireon-portal/tmp/restart.txt
```

Hoặc dùng **Restart** trong Node.js App nếu giao diện hosting có mục đó. Restart website không thay thế việc sửa cron worker.

## 11. Khi cần gửi lỗi để nhờ hỗ trợ

Gửi release ID, bước/lệnh bị lỗi, thời điểm, mã HTTP/mã lỗi và khoảng 30–80 dòng log liên quan. Che mật khẩu, cookie, token, đường dẫn session cPanel. Với lỗi Tools, gửi job ID và mã lỗi; không gửi file khách nếu chưa có quyền.

## 12. Thứ tự cần nhớ

**Windows:** `npm ci` → test/typecheck → `build:cpanel` → package ID mới → so SHA256 → upload.

**cPanel:** đăng nhập → activate Node → kiểm tra hash/giải nén → `backup` → `prepare` → smoke → verify → benchmark → `checkpoint` → `apply` → `cron` → đợi heartbeat → `enable` → thử website/tải XLSX.

**Có lỗi sau chuyển:** đọc log → nếu ảnh hưởng người dùng thì `rollback` từ release mới → kiểm tra lại website/cron → sửa source và tạo release ID mới.

Mỗi bước phải thành công trước khi sang bước sau. Không cần build trên hosting, không thay `.env` bằng file từ máy Windows, và giữ release cũ cho đến khi bản mới vận hành ổn.

### Ghi nhận kiểm tra tài liệu/helper ngày 30/09/2026

Đã chạy 14 test logic hiện có, 3 test mô phỏng backup/snapshot (gồm lỗi archive và giữ nguyên con trỏ rollback), kiểm tra cú pháp ba helper và đóng gói thử. Gói thử dùng build có sẵn chỉ để kiểm tra cấu trúc archive; không phải release mới đã kiểm thử production. Chưa chạy helper E2E đã sửa hoặc snapshot mới trên hosting. Những bước Linux trong quy trình vẫn phải chạy và thành công ở lần deploy thực tế.
