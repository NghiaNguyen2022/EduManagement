# Phân tích chi tiết — E05/E06/E07/E08: Lịch học lặp lại và thời khóa biểu

> Theo khung checklist mục 14 của BPD. Module liên quan: M06 — Lớp học & xếp lớp (P0),
> phần lịch học. Phạm vi: quy tắc lịch học lặp lại theo tuần cho một lớp, sinh buổi học cụ
> thể, kiểm tra trùng giáo viên/phòng/lớp, đánh dấu nghỉ và tạo buổi học bù, xem thời khóa
> biểu theo lớp/giáo viên. Tiếp nối `docs/analysis/E01_E04_chuong_trinh_lop_hoc.md` (đã có
> `LopHoc`, `LopHocGiaoVien`, `HocSinhLopHoc`). **Chưa** gồm điểm danh theo buổi (module F)
> hay báo giảng (module G) — `BuoiHoc` ở bước này chỉ là khung thời gian, chưa gắn nội dung
> giảng dạy/điểm danh.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: từ một lớp đã có (E02) và giáo viên đã phân công (E04), tạo quy tắc lặp lại
  theo tuần (ví dụ "Thứ 2 - Thứ 5, 18:00-19:30") và sinh ra các buổi học cụ thể theo ngày;
  cho phép đánh dấu nghỉ và tạo buổi học bù riêng lẻ; xem lại toàn bộ buổi học theo lớp
  hoặc theo giáo viên. Đây là nền bắt buộc cho Điểm danh (F) và Báo giảng (G).
- Actor chính: **Nhân viên học vụ** (`hoc_vu`) — tái sử dụng quyền `lop_hoc.xem`/
  `lop_hoc.quan_ly` đã seed từ Sprint 0, giống quyết định ở E01-E04. Không tạo quyền mới.
- Actor phụ (chỉ xem): **Giáo viên** (`giao_vien`) — xem thời khóa biểu của chính mình qua
  màn hình `/schedule` (đã có quyền `lop_hoc.xem` từ seed mặc định).

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Mô hình dữ liệu:** tách 2 tầng, giống nguyên tắc "quy tắc lặp lại" và "bản ghi cụ thể"
đã dùng ở `HocSinhLopHoc` (không ghi đè, giữ lịch sử):

- `LichHoc`: **quy tắc lặp lại theo tuần** cho một lớp (ví dụ "Thứ 2 và Thứ 5, 18:00-19:30,
  phòng P.201, GV Nguyễn Thảo", áp dụng từ ngày X đến ngày Y).
- `BuoiHoc`: **buổi học cụ thể** tại một ngày nhất định — hoặc được máy sinh ra từ một
  `LichHoc` (`lichHocId` khác NULL), hoặc tạo tay độc lập cho buổi học bù
  (`lichHocId = NULL`, `loaiBuoi = 'bu'`). Điểm danh/báo giảng sau này sẽ gắn vào
  `BuoiHoc`, không gắn vào `LichHoc` — vì `LichHoc` chỉ là quy tắc, có thể sửa/ngừng mà
  không ảnh hưởng các buổi đã sinh trong quá khứ (dữ liệu buổi học được sao chép giờ/phòng/
  giáo viên tại thời điểm sinh, không tham chiếu động).

**Luồng chính — Tạo quy tắc lịch học (E05):**
1. Từ trang chi tiết lớp → tab "Lịch học" → "Thêm lịch".
2. Chọn thứ trong tuần (có thể chọn nhiều thứ cùng lúc để tạo nhiều `LichHoc` một lượt,
   ví dụ tick "Thứ 2" và "Thứ 5"), giờ bắt đầu, giờ kết thúc, phòng học (mặc định lấy theo
   `LopHoc.phongHoc`, có thể đổi riêng), giáo viên (mặc định lấy giáo viên chính đang hoạt
   động của lớp, có thể đổi riêng cho quy tắc này), ngày áp dụng từ, ngày áp dụng đến
   (tuỳ chọn — để trống nếu chưa xác định điểm kết thúc).
3. Lưu quy tắc — **chưa tự sinh buổi học**, tách hành động "lưu quy tắc" và "sinh buổi học"
   ra hai bước để nhân viên học vụ kiểm soát được sinh đến ngày nào (xem luồng dưới).

**Luồng chính — Sinh buổi học (E05):**
1. Từ quy tắc `LichHoc` (hoặc từ tất cả quy tắc đang hoạt động của lớp) → "Sinh buổi học
   đến ngày...".
2. Hệ thống liệt kê tất cả ngày khớp `thuTrongTuan` trong khoảng
   `[max(ngayApDungTu, ngày sinh gần nhất đã có), min(ngayApDungDen, ngày người dùng chọn)]`,
   bỏ qua ngày đã có `BuoiHoc` được sinh từ đúng quy tắc đó (tránh sinh trùng khi bấm sinh
   nhiều lần).
3. Kiểm tra trùng giáo viên/phòng cho **toàn bộ** các buổi dự kiến sinh (E06, xem mục dưới)
   trước khi ghi bất kỳ buổi nào.
4. Nếu không có xung đột → tạo hàng loạt `BuoiHoc` (`loaiBuoi = 'thuong'`,
   `trangThai = 'du_kien'`), sao chép giờ/phòng/giáo viên từ `LichHoc` tại thời điểm sinh.
5. Nếu có xung đột → **chặn toàn bộ, không sinh buổi nào**, trả về danh sách cụ thể các
   ngày/giờ xung đột và lý do (trùng phòng hay trùng giáo viên, với lớp nào) để người dùng
   tự đổi giờ/phòng/giáo viên rồi thử lại. Quyết định MVP: không sinh "nửa vời" (bỏ qua các
   buổi lỗi, giữ lại buổi hợp lệ) — tránh dữ liệu khó kiểm soát, nhất quán với nguyên tắc
   chặn cứng đã dùng ở E03 (vượt sĩ số).

**Luồng chính — Kiểm tra trùng giáo viên/phòng/lớp (E06):**
- Hai `BuoiHoc` được coi là xung đột nếu: cùng `donViId` (suy ra qua lớp), cùng `ngayHoc`,
  khung giờ `[gioBatDau, gioKetThuc)` chồng lấn nhau, và (cùng `phongHoc` khác NULL) hoặc
  (cùng `giaoVienId` khác NULL).
- Chỉ tính các `BuoiHoc` có `trangThai` khác `huy` và khác `nghi` (buổi đã hủy/nghỉ không
  còn chiếm phòng/giáo viên).
- Áp dụng khi: sinh buổi học hàng loạt (E05), tạo buổi học bù (E07), sửa giờ/phòng/giáo
  viên của một buổi học đơn lẻ.

**Luồng chính — Đánh dấu nghỉ (E07):**
1. Từ danh sách buổi học của lớp → chọn buổi → "Đánh dấu nghỉ", nhập lý do (tuỳ chọn).
2. `BuoiHoc.trangThai = 'nghi'` — giữ nguyên bản ghi (không xoá), để lịch sử biết buổi nào
   đã nghỉ và vì sao.

**Luồng chính — Tạo buổi học bù (E07):**
1. Từ trang chi tiết lớp → "Thêm buổi học bù".
2. Nhập ngày, giờ bắt đầu/kết thúc, phòng, giáo viên (không bắt buộc trùng với quy tắc lịch
   học của lớp — buổi bù có thể khác giờ thường lệ).
3. Kiểm tra trùng (E06) như buổi thường.
4. Tạo `BuoiHoc` với `lichHocId = NULL`, `loaiBuoi = 'bu'`, `trangThai = 'du_kien'`.

**Luồng chính — Xem thời khóa biểu (E08):**
- Theo lớp: trong trang chi tiết lớp, danh sách buổi học sắp tới/đã qua, lọc theo khoảng
  ngày.
- Theo giáo viên: trang `/schedule`, chọn khoảng ngày (mặc định tuần hiện tại), xem tất cả
  buổi học của giáo viên đó (hoặc toàn bộ đơn vị nếu có quyền `lop_hoc.quan_ly`) trong đơn
  vị đang chọn.
- **Chưa làm** thời khóa biểu theo học sinh/phụ huynh ở bước này — thuộc phạm vi Portal
  (module J), chưa tới lượt triển khai.

**Luồng ngoại lệ:**
- `gioKetThuc` không sau `gioBatDau` → chặn, báo lỗi.
- `ngayApDungDen` trước `ngayApDungTu` (khi có) → chặn.
- Sinh buổi học khi lớp đã `ket_thuc`/`huy` → chặn.
- Sinh buổi học/tạo buổi bù có xung đột phòng hoặc giáo viên → chặn, trả danh sách xung
  đột cụ thể (xem mục E06 ở trên).
- Đánh dấu nghỉ hoặc sửa một buổi học đã `da_hoc` → chặn (buổi đã diễn ra không được sửa
  qua màn hình lịch học nữa; việc đó thuộc phạm vi điểm danh/báo giảng — module F/G).

**Kết quả:** Lớp có lịch học rõ ràng theo tuần, buổi học cụ thể được sinh sẵn để module
Điểm danh (F) và Báo giảng (G) sử dụng; không phát sinh trùng phòng/giáo viên; nghỉ/học bù
được ghi nhận có lịch sử.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- `LichHoc.trangThai`: `hoat_dong` → `ngung_hoat_dong` (ngừng áp dụng quy tắc — không xoá,
  không ảnh hưởng các `BuoiHoc` đã sinh trước đó; không sinh buổi mới từ quy tắc đã ngừng).
- `BuoiHoc.trangThai`: `du_kien` → `da_hoc` / `nghi` / `huy`. Không có chiều ngược (một khi
  đã `da_hoc` thì không sửa qua màn hình này — thuộc module F/G). `nghi` và `huy` có thể mở
  lại về `du_kien` (ví dụ đánh dấu nghỉ nhầm) miễn buổi đó chưa `da_hoc`.
- `BuoiHoc.loaiBuoi`: cố định tại thời điểm tạo — `thuong` (sinh từ `LichHoc`) hoặc `bu`
  (tạo tay). Không chuyển đổi qua lại.

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `LichHoc`, `BuoiHoc` không có `donViId` riêng — suy ra qua `lopHocId` (giống
  `LopHocGiaoVien`/`HocSinhLopHoc`), ràng buộc kiểm tra ở tầng service (lớp phải thuộc
  đúng đơn vị đang chọn).
- Thời gian hiệu lực: `LichHoc.ngayApDungTu/ngayApDungDen`; mỗi `BuoiHoc` gắn với đúng một
  `ngayHoc` cụ thể.
- Trùng giáo viên/phòng (E06) chỉ kiểm tra **trong cùng đơn vị** — không kiểm tra chéo đơn
  vị (một giáo viên có hồ sơ ở 2 đơn vị khác nhau được coi là 2 nguồn lực độc lập, đúng
  nguyên tắc `GiaoVien.donViId` đã chốt ở E01-E04).

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `lop_hoc.xem` | `lop_hoc.quan_ly` |
| --- | --- | --- |
| Xem lịch học/buổi học của lớp, thời khóa biểu | Có | Có |
| Tạo/sửa/ngừng quy tắc lịch học | Không | Có |
| Sinh buổi học | Không | Có |
| Đánh dấu nghỉ, tạo buổi học bù | Không | Có |

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo — M11 — chưa triển khai). Khi làm tới module I, buổi nghỉ nên
  tự thông báo cho phụ huynh học sinh trong lớp — ghi chú lại làm việc tương lai.

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này. Thời khóa biểu dạng in ấn để sau (không thuộc phạm vi MVP).

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `LichHoc`: `lopHocId`, `thuTrongTuan` (2-8, quy ước 2=Thứ Hai...7=Thứ Bảy, 8=Chủ Nhật),
  `gioBatDau`, `gioKetThuc`, `ngayApDungTu` bắt buộc; `gioKetThuc` phải sau `gioBatDau`;
  `ngayApDungDen` (nếu có) phải từ `ngayApDungTu` trở đi.
- `BuoiHoc`: `lopHocId`, `ngayHoc`, `gioBatDau`, `gioKetThuc` bắt buộc; không unique cứng
  theo DB cho việc chống trùng phòng/giáo viên (dữ liệu chồng chéo giữa nhiều lớp, không
  thể biểu diễn bằng unique index đơn giản) — kiểm tra ở tầng service (mục E06).
- Audit log bắt buộc: tạo/ngừng quy tắc lịch học, sinh buổi học (ghi số lượng buổi được
  tạo), đánh dấu nghỉ, tạo buổi học bù, sửa/hủy một buổi học.

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng ở bước này. Lịch học dùng chung cấu trúc cho mọi loại hình —
  khác biệt về nghiệp vụ (ví dụ mầm non có giờ đón/trả riêng — D04/F06) nằm ở các module
  khác, không ảnh hưởng cấu trúc `LichHoc`/`BuoiHoc`.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Tạo quy tắc lịch học cho lớp, chọn nhiều thứ trong tuần cùng lúc → tạo đúng số
      `LichHoc`.
- [ ] `gioKetThuc` không sau `gioBatDau` → bị chặn.
- [ ] Sinh buổi học → đúng số buổi theo số ngày khớp thứ trong tuần, không sinh trùng khi
      bấm sinh lần hai.
- [ ] Sinh buổi học trùng phòng với lớp khác → bị chặn toàn bộ, không có buổi nào được tạo.
- [ ] Sinh buổi học trùng giáo viên với lớp khác → bị chặn toàn bộ.
- [ ] Đánh dấu nghỉ một buổi → buổi đó không còn tính là xung đột phòng/giáo viên với buổi
      khác được sinh sau.
- [ ] Tạo buổi học bù trùng giờ/phòng với buổi khác → bị chặn.
- [ ] Xem thời khóa biểu theo lớp và theo giáo viên → đúng dữ liệu, đúng đơn vị đang chọn.
- [ ] `lop_hoc.xem` (không có `quan_ly`) gọi API tạo/sửa lịch học → 403.
- [ ] Đổi đơn vị ở Topbar khi đang đứng ở trang `/schedule` → danh sách tải lại đúng đơn vị
      mới (regression cho bản vá tối 2026-07-21 về refetch theo đơn vị).
- [ ] `pnpm typecheck` và `pnpm build` pass.
