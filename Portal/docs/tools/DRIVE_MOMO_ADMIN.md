# Google Drive cá nhân, Zalo và kích hoạt giao dịch

Trạng thái: bản `tools-20260930-commerce-r3` đã deploy lên https://vireon.vn ngày 30/09/2026. Thu phí và Drive mặc định tắt; cần cấu hình và kết nối Gmail thật trong https://vireon.vn/admin/tools. Luồng chốt theo yêu cầu mới: **không cấp hay nhập mã tải riêng**. Kết quả kiểm thử được ghi tại [VALIDATION.md](./VALIDATION.md).

## Luồng sử dụng

1. Khách upload file, chọn quy tắc và xử lý.
2. Xử lý xong: hiện bản xem trước (tối đa 3 sheet, mỗi sheet 10 dòng), số tiền, thông tin MoMo, mã giao dịch gắn với file, nút **Liên hệ Zalo** và QR mở lại giao dịch. Với lượt có phí, tự chuyển sang trang kết quả/giao dịch.
3. Khách bấm **Sao chép thông tin giao dịch**, mở Zalo và dán nội dung gửi admin. Có thể liên hệ trước hoặc chuyển tiền rồi gửi ảnh/mã chuyển tiền qua Zalo. Portal không tự gửi tin nhắn và không tự xác nhận MoMo.
4. Admin vào **/admin/tools**, dán mã giao dịch khách gửi, bấm **Tìm giao dịch**, kiểm tra đúng file/số tiền rồi **Kích hoạt tải file**. Nội dung thông báo có thể sao chép để admin tự nhắn lại bên ngoài.
5. Khách tải lại trang, bấm kiểm tra kích hoạt hoặc quét lại QR trên thiết bị khác: nếu đã kích hoạt, hiện nút tải file. Không nhập thêm mã.

QR chứa liên kết riêng tư đến một công việc; mã giao dịch VR… dùng để đối soát/tìm kiếm, không tự cấp quyền truy cập. Trước kích hoạt, QR cho xem trước và trạng thái; sau kích hoạt, người giữ QR có thể tải file. Giữ QR và liên kết như thông tin riêng tư. File trên Drive vẫn không chia sẻ công khai.

## Admin cấu hình

Vào /admin/tools sau khi đăng nhập tài khoản admin hiện tại. Nhập số MoMo, tên người nhận, số Zalo liên hệ, giá mỗi lượt và hướng dẫn. Bật/tắt **Thu phí cho lượt mới** tùy thời điểm.

Giá và thông tin liên hệ được chốt theo lượt lúc tạo, tránh đổi điều kiện của giao dịch đang chờ. Lượt miễn phí tải ngay khi kết quả đã lưu xong. Tắt thu phí không tự mở khóa các giao dịch có phí đã tạo trước đó; admin vẫn có thể kích hoạt chúng. Không có hoàn tiền tự động.

## Kết nối Gmail cá nhân trong admin

Chỉ admin cấu hình một Drive của chủ website; khách không cần đăng nhập Google. **Không nhập mật khẩu Gmail vào Portal.** Cần tạo OAuth client một lần trong Google Cloud:

1. Mở [Google Cloud Console](https://console.cloud.google.com/), chọn/tạo project dành cho Portal.
2. Bật **Google Drive API** trong API Library.
3. Cấu hình Google Auth Platform/OAuth consent: ứng dụng External cho Gmail cá nhân, điền thông tin ứng dụng và email hỗ trợ. Nếu còn ở Testing, thêm chính Gmail của bạn vào test users.
4. Tạo OAuth client kiểu **Web application**. Khai báo chính xác Authorized redirect URI mà trang admin hiển thị. Production hiện là `https://vireon.vn/api/admin/tools/drive/callback`.
5. Sao chép **Client ID** và **Client secret** vào hai trường trong admin, lưu. Secret đã lưu không trả lại trình duyệt; để trống để giữ nguyên.
6. Bấm **Kết nối / cấp lại quyền Google**, đăng nhập đúng Gmail của chủ website và đồng ý quyền. Portal dùng scope `drive.file`: quản lý những file/thư mục do ứng dụng tạo, không xin toàn quyền đọc Drive.
7. Sau khi quay về admin, bấm **Kiểm tra Drive**. Portal tự tạo thư mục `Vireon Portal — Private files`; có liên kết mở thư mục cho admin.
8. Bật **Lưu file của lượt mới vào Google Drive**, lưu cấu hình. Thử một file mẫu và kiểm tra kết quả trong Drive trước khi nhận dữ liệu thật.

Tắt lưu Drive chỉ đổi nơi lưu của lượt mới; lượt Drive cũ vẫn tải/xóa qua kết nối đã có. Không đổi OAuth client khi còn bản ghi file Drive. Kết nối lại phải cùng tài khoản Google đã dùng để tránh mất quyền với file cũ. Không chia sẻ công khai thư mục hoặc tự di chuyển/xóa file đang phục vụ.

Google yêu cầu `access_type=offline` để nhận refresh token dùng cho worker khi admin không mở trình duyệt. Ứng dụng External ở chế độ Testing có thể nhận refresh token hết hạn sau 7 ngày với quyền Drive; cần hoàn tất cấu hình phát hành OAuth phù hợp cho vận hành dài hạn. Refresh token vẫn có thể bị thu hồi; khi mất quyền, admin kết nối lại. Tham khảo [OAuth web server](https://developers.google.com/identity/protocols/oauth2/web-server), [vòng đời token](https://developers.google.com/identity/protocols/oauth2#expiration) và [scope Drive](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).

## QR, tiến độ và thời hạn

- QR giao dịch được tạo tự động. Tải ảnh QR hoặc sao chép liên kết trước khi rời trang.
- QR chứa token ngẫu nhiên dài trong phần `#resume=...`, không chứa nội dung Excel hay mã thanh toán. Portal tạo ảnh QR cục bộ, không gửi liên kết sang dịch vụ tạo QR bên ngoài.
- Token chỉ cấp phiên mới quyền vào đúng công việc đó. Không đổi chủ sở hữu hoặc cho xem các job khác. Người có QR có thể xem dữ liệu mẫu/cấu hình, nên giữ QR như một thông tin bí mật.
- Khi khách rời trang, worker vẫn tiếp tục. Nếu worker bị gián đoạn, có thể retry pha đang dang dở theo cơ chế hiện tại; không hứa tiếp tục từ chính xác ô/byte đã xử lý trong RAM.
- Lượt mới hết hạn **30 ngày từ khi tạo**, kể cả đã trả tiền. Thanh toán, tải lại hay quét QR không gia hạn. Lượt cũ giữ thời hạn đã tạo (có thể 24 giờ).
- Hết hạn: API chặn truy cập ngay; cron xóa vĩnh viễn file Drive, file local, preview, cấu hình và mã khôi phục. Nếu Google lỗi, lưu thông tin file để cron thử xóa lại; không đánh dấu dọn thành công hoặc bỏ mất Drive ID. Log có `tools_cleanup_pending`.
- Đầu vào được đồng bộ lên Drive bởi worker; file tạm local chỉ xóa sau khi đồng bộ/xác minh thành công và pha đã ổn định. Kết quả chờ lưu Drive không được tải/duyệt thanh toán. Trạng thái pending được thử lại ở cron sau, log `tools_drive_pending`.

Drive giảm lượng lưu lâu dài trên hosting; CPU/RAM xử lý vẫn ở hosting. Giữ giới hạn hiện tại: một worker, 5 MiB/file, tối đa 5 file; production 10.000 dòng/100.000 ô. Giới hạn 40 job còn hạn và 5 job của mỗi phiên vẫn áp dụng; với thời hạn 30 ngày cần theo dõi dung lượng/quota trước khi tăng.

## Triển khai và backup

Theo [hướng dẫn build/deploy](./HUONG_DAN_BUILD_DEPLOY.md), dùng release ID mới. Script `tools:migrate`/`prepare` chạy thêm `20260930-tools-commerce.sql` (chỉ bổ sung bảng).

- Cấu hình giá/thu phí mặc định tắt; Drive mặc định tắt. Sau deploy admin mới cấu hình và kết nối.
- `TOOLS_ENABLED` vẫn là công tắc nhận việc trên hosting. `FREE_BETA` không còn là công tắc thu phí; thay bằng cấu hình trong admin.
- Secret Google, refresh token và recovery token được mã hóa bằng AES-256-GCM. Khóa 32 byte tự tạo trong `TOOLS_STORAGE_ROOT/.portal-secrets.key` (hoặc `TOOLS_KEY_FILE` nếu cấu hình riêng), ngoài public/source, mode 0600 trên Linux.
- Phải giữ nguyên thư mục storage/khóa giữa các release. Mất khóa không giải mã được kết nối Drive hoặc liên kết khôi phục đã tạo. Không sửa, xóa hay sinh lại khóa để chữa lỗi; phục hồi đúng khóa từ backup.
- Helper backup mới lưu thêm `tools-secrets.key`. `tool_settings` nằm trong database backup với secrets đã mã hóa. Bảo vệ cả backup/key; không tải lên thư mục public.
- Các bảng job/file/access/token/audit Tools và file khách vẫn không nằm trong backup dài hạn. Backup Portal hiện tại **không phục hồi được toàn bộ công việc/đơn hàng Tools khi mất database**. Đây không phải giải pháp lưu sổ giao dịch lâu dài; cần thiết kế backup/đối soát có thời hạn riêng trước khi dùng thu phí ở quy mô lớn.
- Không rollback về bản beta cũ khi còn job có phí hoặc file Drive chưa dọn: code cũ không kiểm tra trạng thái kích hoạt và không biết xóa Drive. Helper mới chặn trường hợp này; phải dùng bản sửa tương thích commerce và giữ worker cleanup mới.

## Kiểm thử và giới hạn xác minh

`npm test`, `node --test tests/tools-release.test.cjs`, và `TOOLS_TEST_MYSQL_PORT=3319 npm run test:tools:integration` (đổi cú pháp env theo shell). Integration dùng DB local tạm, kiểm tra paid/free, tìm giao dịch, kích hoạt đúng job, chống vượt quyền, QR khác phiên và hết hạn; Drive dùng HTTP giả lập để kiểm tra upload/checksum/offload/rehydrate/download/delete-retry.

Không xem test giả lập là bằng chứng Gmail thật đã được kết nối. OAuth thực tế và upload/download/delete thực tế phải được kiểm chứng sau khi chủ tài khoản cấp quyền trong admin. Không có giao dịch MoMo thật được thực hiện bởi bộ kiểm thử.
