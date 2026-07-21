# Phân tích chi tiết — C07: Tạo tài khoản đăng nhập phụ huynh

> Theo khung checklist mục 14 của BPD. Bước cuối Sprint 1, phụ thuộc D03 (phụ huynh) và
> C06 (xác nhận đăng ký) đã xong.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: cấp tài khoản đăng nhập cho phụ huynh đã liên kết với học sinh, đúng theo quy
  tắc BPD 7.1 đã chốt từ đầu: "Tài khoản phụ huynh phải liên kết theo guardian-person,
  không tạo tài khoản trùng cho từng con."
- Actor chính: Nhân viên học vụ (`hoc_sinh.quan_ly`), Tuyển sinh (`tuyen_sinh.quan_ly`) —
  cả hai đều có thể là người hoàn tất hồ sơ nhập học, xem quyết định phân quyền mục 5.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Điểm bắt đầu:** Học sinh đã có ít nhất một phụ huynh liên kết (từ D03 hoặc từ xác nhận
đăng ký C06).

**Luồng chính:**
1. Từ trang chi tiết học sinh, tại dòng phụ huynh → "Tạo tài khoản đăng nhập".
2. Hệ thống kiểm tra `PhuHuynh.nguoiDungId`:
   - Nếu **đã có** (phụ huynh này đã có tài khoản, có thể từ một con khác đã cấp trước) →
     không tạo tài khoản mới, chỉ hiển thị lại tên đăng nhập hiện có. Không tạo tài khoản
     trùng, không đổi mật khẩu.
   - Nếu **chưa có** → tạo tài khoản mới: tên đăng nhập sinh từ số điện thoại (dò trùng
     toàn hệ thống, thêm hậu tố nếu cần), mật khẩu tạm ngẫu nhiên, bắt buộc đổi mật khẩu
     lần đầu, gán vai trò `phu_huynh` tại đơn vị hiện tại, cập nhật
     `PhuHuynh.nguoiDungId` trỏ về tài khoản mới.
3. Hiển thị mật khẩu tạm một lần duy nhất cho người thao tác (đúng UX đã dùng ở Quản lý
   người dùng).

**Luồng ngoại lệ:**
- Số điện thoại/email của phụ huynh trùng với tài khoản đã tồn tại vì lý do khác (ví dụ
  trùng email với một nhân viên nội bộ) → báo lỗi rõ ràng, không tạo tài khoản, không có
  cách tự động xử lý ở bước này (phải sửa dữ liệu phụ huynh trước — sửa thông tin phụ
  huynh chưa có trong phạm vi D03/C07, để lại bước sau nếu phát sinh nhu cầu thật).

**Kết quả:** Phụ huynh có một tài khoản duy nhất, dùng chung cho mọi con tại cùng đơn vị.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- Không có trạng thái riêng cho hành động này. `NguoiDung.trangThai` mặc định `hoat_dong`,
  `batBuocDoiMatKhau = true` — theo đúng quy ước tạo tài khoản đã có ở Sprint 0.

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `PhuHuynh.donViId` xác định đơn vị; endpoint chỉ thao tác trên liên kết đúng đơn vị hiện
  tại (dùng lại `findGuardianLinkById` đã có, đã kiểm tra `donViId`).
- Tài khoản (`NguoiDung`) là thực thể toàn hệ thống (không có donViId), nhưng vai trò
  `phu_huynh` được gán theo đơn vị qua `NguoiDungVaiTroDonVi` như mọi vai trò khác.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `hoc_sinh.xem` | `hoc_sinh.quan_ly` | `tuyen_sinh.quan_ly` |
| --- | --- | --- | --- |
| Tạo tài khoản đăng nhập phụ huynh | Không | Có | Có |

**Quyết định phân quyền:** thay vì cấp thêm quyền chéo cho vai trò (như đã làm ở bước
trước với `tu_van`), lần này thêm middleware dùng chung `requireAnyPermission([...])` —
chấp nhận **một trong nhiều** mã quyền. Lý do đổi cách tiếp cận: đây là lần thứ hai gặp
đúng một dạng nhu cầu (một hành động hợp lý cho từ hai vai trò trở lên), cấp quyền chéo
thêm nữa sẽ làm quyền của từng vai trò phình to không kiểm soát được. `requireAnyPermission`
là tiện ích dùng lại được cho các trường hợp tương tự sau này, không phải cấu hình riêng
cho vai trò.

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo chưa triển khai). Mật khẩu tạm hiển thị trực tiếp cho người
  thao tác, chưa gửi SMS/email tự động (nằm trong "Các quyết định cần làm rõ" — mục 15 BPD,
  câu hỏi về tích hợp SMS/Zalo/Email chưa chốt).

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- Tên đăng nhập sinh từ số điện thoại (chỉ giữ chữ số), dò trùng `NguoiDung.tenDangNhap`
  toàn hệ thống, thêm hậu tố `-2`, `-3`... nếu trùng.
- `NguoiDung.email` unique toàn hệ thống — nếu trùng, insert thất bại và trả lỗi rõ ràng,
  không tạo tài khoản một phần.
- Audit log bắt buộc: tạo tài khoản mới, hoặc phát hiện tài khoản đã tồn tại (không tạo
  trùng) — cả hai đều ghi log để truy vết ai thao tác lúc nào.

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không có.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Tạo tài khoản cho phụ huynh chưa có `nguoiDungId` → tạo mới đúng, gán vai trò
      `phu_huynh` tại đơn vị hiện tại.
- [ ] Tạo tài khoản lần 2 cho cùng phụ huynh (đã có `nguoiDungId` từ lần 1) → không tạo
      tài khoản mới, trả về đúng tên đăng nhập hiện có.
- [ ] Phụ huynh có 2 con (từ regression D03) → tạo tài khoản từ con thứ nhất, sang con thứ
      hai gọi lại → nhận diện đã có tài khoản, không tạo trùng.
- [ ] `hoc_sinh.xem` (không có `quan_ly`) gọi tạo tài khoản → 403.
- [ ] `tuyen_sinh.quan_ly` (không có `hoc_sinh.quan_ly`) vẫn tạo được tài khoản — xác nhận
      `requireAnyPermission` hoạt động đúng.
- [ ] `pnpm typecheck` và `pnpm build` pass.
