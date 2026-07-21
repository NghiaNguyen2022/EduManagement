# Phân tích chi tiết — A01: Cây đơn vị trường/trung tâm/cơ sở

> Theo khung checklist mục 14 của BPD (`BPD_App_Quan_Ly_Truong_Hoc_Trung_Tam_v0.1.docx`).
> Module liên quan: M01 — Tổ chức & đơn vị (P0).

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: cho phép quản trị hệ thống tạo, sửa, ngừng hoạt động các đơn vị (hệ thống/cụm/
  trường/trung tâm/cơ sở) theo đúng mô hình cây đã chốt ở BPD mục 3.
- Actor chính: **System Owner / Super Admin** (`he_thong.quan_tri`).
- Actor phụ (chỉ xem): School/Center Admin (`quan_ly_don_vi`) — xem được đơn vị mình đang
  làm việc và cây đơn vị con (nếu có), không tạo/sửa/ngừng hoạt động.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Điểm bắt đầu:** Quản trị hệ thống đã đăng nhập, đã chọn đơn vị làm việc (bất kỳ, vì đây
là thao tác phạm vi hệ thống, không phụ thuộc đơn vị hiện tại).

**Điều kiện trước:** Có quyền `he_thong.quan_tri`.

**Luồng chính — Tạo đơn vị:**
1. Mở màn hình "Cây đơn vị" (menu Hệ thống).
2. Bấm "Thêm đơn vị", chọn đơn vị cha (hoặc để trống nếu là đơn vị cấp 1 dưới `SYSTEM`).
3. Nhập mã đơn vị, tên đơn vị, loại đơn vị (`truong`/`trung_tam`/`co_so`), loại hình đào
   tạo (nếu áp dụng), địa chỉ, điện thoại, email.
4. Lưu → hệ thống kiểm tra trùng mã, ghi `NhatKyHeThong`.

**Luồng chính — Sửa đơn vị:**
1. Chọn đơn vị trong cây → Sửa.
2. Cập nhật tên/địa chỉ/liên hệ/loại hình đào tạo. Không cho đổi `loaiDonVi` sau khi đã có
   dữ liệu nghiệp vụ con (người dùng/lớp/học sinh) gắn vào — tránh sai lệch cấu trúc.
3. Lưu → ghi `NhatKyHeThong`.

**Luồng chính — Ngừng hoạt động đơn vị:**
1. Chọn đơn vị → Ngừng hoạt động.
2. Hệ thống chặn nếu đơn vị còn đơn vị con đang hoạt động (`trangThai = hoat_dong`).
3. Xác nhận → `trangThai = ngung_hoat_dong`, ghi `NhatKyHeThong`.
4. Hệ quả tự động: người dùng đang có vai trò tại đơn vị này sẽ không còn thấy đơn vị đó
   trong danh sách chọn khi đăng nhập (đã áp dụng từ bản vá `getOrganizationsForUser` lọc
   `trangThai = hoat_dong` — Việc 009).

**Luồng ngoại lệ:**
- Mã đơn vị trùng → báo lỗi, không lưu.
- Chọn đơn vị cha không tồn tại hoặc đơn vị cha đang `ngung_hoat_dong` → chặn, báo lỗi.
- Ngừng hoạt động đơn vị `he_thong` gốc (`SYSTEM`) → luôn chặn, không cho phép trong mọi
  trường hợp (đây là node gốc bắt buộc phải tồn tại).
- Ngừng hoạt động đơn vị đang là `donViHienTaiId` của một phiên đăng nhập đang hoạt động →
  vẫn cho phép (phiên đó sẽ tự mất quyền chọn lại đơn vị ở lần tải context tiếp theo, không
  cần thu hồi phiên ngay).

**Kết quả:** Cây đơn vị phản ánh đúng cấu trúc vận hành thật; đơn vị ngừng hoạt động không
còn xuất hiện trong các lựa chọn nghiệp vụ (chọn đơn vị khi đăng nhập, gán vai trò mới).

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

`DonVi.trangThai`: `hoat_dong` → `tam_ngung` → `hoat_dong` (mở lại được) hoặc
`hoat_dong`/`tam_ngung` → `ngung_hoat_dong` (không mở lại qua UI này; chỉ có thể xử lý tay
ở DB nếu thật sự cần, không nằm trong phạm vi Sprint này).

Quy tắc chặn chuyển trạng thái:
- Không chuyển `ngung_hoat_dong` nếu còn đơn vị con `trangThai != ngung_hoat_dong`.
- Không chuyển trạng thái node `SYSTEM` gốc.

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- Đây là thao tác phạm vi **toàn hệ thống** (không lọc theo `donViId` hiện tại của người
  thao tác) — khác với các module nghiệp vụ khác (học sinh, lớp...) vốn phải lọc theo
  đơn vị đang chọn.
- Không có khái niệm "thời gian hiệu lực" cho `DonVi` ở giai đoạn này (không tách lịch sử
  đổi tên/loại hình theo mốc thời gian) — nếu cần sau này sẽ bổ sung bảng lịch sử riêng.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `he_thong.quan_tri` | `don_vi.quan_ly` (khác) |
| --- | --- | --- |
| Xem cây đơn vị (toàn bộ) | Có | Chỉ xem đơn vị mình + đơn vị con trực tiếp (nếu có) |
| Tạo đơn vị | Có | Không |
| Sửa thông tin đơn vị | Có | Không |
| Ngừng hoạt động | Có | Không |

*Ghi chú:* giới hạn này là quyết định MVP (xem mục "Cập nhật BPD" bên dưới), có thể mở rộng
sau khi có nhu cầu để `don_vi.quan_ly` tự tạo `co_so` (chi nhánh) dưới đơn vị của mình.

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa cần thông báo tự động ở bước này (module Thông báo — M11 — chưa triển khai).
- Ghi `NhatKyHeThong` cho mọi thao tác tạo/sửa/ngừng hoạt động là bắt buộc (đã có sẵn hạ
  tầng `createAuditLog`).

## 7. Chứng từ/báo cáo cần in/xuất

- Không có ở bước này.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- Bắt buộc: `maDonVi`, `tenDonVi`, `loaiDonVi`.
- `maDonVi` unique toàn hệ thống (đã có `UQ_DonVi_maDonVi`).
- `loaiHinhDaoTao` bắt buộc khi `loaiDonVi` là `truong`/`trung_tam` (không bắt buộc với
  `he_thong`/`co_so` vì cơ sở kế thừa loại hình từ đơn vị cha).
- `donViChaId` phải trỏ tới đơn vị đang `hoat_dong`.
- Audit log bắt buộc cho create/update/deactivate (đã có repo `audit.repository.ts`).

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không phát sinh trường riêng ở cấp `DonVi` — `loaiHinhDaoTao` là đủ để các module sau
  (lớp, chương trình...) tự bật cấu hình riêng theo loại hình.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Tạo đơn vị mới thành công, xuất hiện đúng vị trí trong cây.
- [ ] Trùng `maDonVi` → báo lỗi, không tạo.
- [ ] Sửa đơn vị, không cho đổi `loaiDonVi` nếu đã có dữ liệu con (kiểm tra thủ công vì
      Sprint 1 chưa có dữ liệu con thật để test tự động).
- [ ] Ngừng hoạt động đơn vị còn con đang hoạt động → bị chặn.
- [ ] Ngừng hoạt động node `SYSTEM` → luôn bị chặn.
- [ ] Sau khi ngừng hoạt động một đơn vị, tài khoản có vai trò tại đó không còn thấy đơn vị
      này ở màn hình chọn đơn vị (regression cho Việc 009).
- [ ] `don_vi.quan_ly` không gọi được API tạo/sửa/ngừng hoạt động (403).
- [ ] `pnpm typecheck` và `pnpm build` pass.
