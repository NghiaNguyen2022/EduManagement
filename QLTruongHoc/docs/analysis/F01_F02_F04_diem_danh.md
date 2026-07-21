# Phân tích chi tiết — F01/F02/F04: Điểm danh theo buổi học

> Theo khung checklist mục 14 của BPD. Module liên quan: M07 — Điểm danh (P0). Phạm vi:
> điểm danh học sinh theo từng buổi học cụ thể (`BuoiHoc`, đã có từ E05-E08), các trạng thái
> điểm danh, giáo viên/nhân viên học vụ ghi nhận. **Chưa** gồm F03 (phụ huynh gửi đơn xin
> phép — cần Portal phụ huynh, module J chưa làm) và F05 (thông báo vắng học — cần module
> Thông báo, M11 chưa làm). F06 (mầm non: giờ đón/trả và người đón) để riêng vì là nghiệp vụ
> chuyên biệt theo loại hình, chưa cấp thiết cho MVP điểm danh chung.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: ghi nhận tình trạng có mặt của từng học sinh trong mỗi buổi học cụ thể, làm nền
  cho báo cáo chuyên cần, tính học phí theo buổi (H), và báo giảng (G) sau này.
- Actor chính: **Giáo viên** (`giao_vien`) — đã có quyền `diem_danh.thuc_hien` từ seed mặc
  định (`database/008_seed_default_role_permissions.sql`), chưa từng dùng tới vì module F
  chưa tồn tại.
- Actor phụ: **Nhân viên học vụ** (`hoc_vu`) — chỉ có `diem_danh.xem` (xem, không ghi nhận
  thay giáo viên) theo đúng ma trận quyền đã seed sẵn — không đổi ma trận này, không tạo
  quyền mới. **Quản lý đơn vị** (`quan_ly_don_vi`) có cả hai quyền, thực hiện được khi cần.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Luồng chính — Điểm danh một buổi học:**
1. Từ trang "Điểm danh" (`/attendance`) → chọn ngày (mặc định hôm nay) → hệ thống liệt kê
   các buổi học trong ngày đó (toàn đơn vị đang chọn), trạng thái `du_kien`/`da_hoc`. Hoặc
   bấm nút "Điểm danh" ngay từ dòng buổi học trong tab "Buổi học" ở trang chi tiết lớp
   (`ClassDetailPage`) để vào thẳng đúng buổi.
2. Chọn một buổi → hệ thống dựng danh sách học sinh **đang ghi danh vào lớp đó tại đúng
   ngày học của buổi** (suy ra từ `HocSinhLopHoc.ngayVaoLop <= ngayHoc` và
   `ngayRoiLop` NULL hoặc `>= ngayHoc` — tái tạo đúng danh sách lớp tại thời điểm đó, không
   phụ thuộc trạng thái ghi danh hiện tại).
3. Nếu buổi **chưa điểm danh lần nào**: mặc định mọi học sinh là "Có mặt" — nhân viên chỉ
   cần đổi những trường hợp ngoại lệ (vắng, đi trễ...), không phải chọn tay từng em — giảm
   thao tác nhập liệu cho buổi đông học sinh.
4. Nếu buổi **đã điểm danh trước đó**: hiển thị đúng dữ liệu đã lưu để sửa lại.
5. Lưu → ghi/undo-ghi-đè từng dòng `DiemDanh` (một dòng cho mỗi học sinh trong buổi đó —
   xem mục 3 về cơ chế cập nhật), và tự động chuyển `BuoiHoc.trangThai` sang `da_hoc` nếu
   đang `du_kien` (đã điểm danh nghĩa là buổi đã diễn ra).

**Luồng ngoại lệ:**
- Điểm danh một buổi đang `nghi` hoặc `huy` → chặn, báo lỗi (buổi không diễn ra thì không
  điểm danh được).
- Buổi chưa tới ngày (tương lai) → **không chặn** ở tầng hệ thống (một số nơi có thể điểm
  danh sớm/muộn hơn dự kiến thực tế); không thêm ràng buộc ngày để giữ đơn giản, đúng tinh
  thần MVP.
- `diem_danh.xem` (không có `diem_danh.thuc_hien`) gọi API lưu điểm danh → 403.

**Kết quả:** Mỗi buổi học có đầy đủ dữ liệu điểm danh từng học sinh; buổi tự chuyển `da_hoc`
sau khi điểm danh, đúng như đã ghi chú trước ở E05-E08 ("buổi `da_hoc` không sửa được qua
màn lịch học nữa — thuộc phạm vi điểm danh/báo giảng").

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- `DiemDanh.trangThai`: `co_mat` | `vang_co_phep` | `vang_khong_phep` | `di_tre` | `ve_som`
  — không có thứ tự chuyển bắt buộc, sửa tự do (giáo viên có thể sửa lại nhiều lần trong
  ngày nếu ghi nhầm).
- Cơ chế lưu: **một dòng `DiemDanh` duy nhất cho mỗi cặp (buổi học, học sinh)** — khác với
  các bảng lịch sử khác trong hệ thống (không ghi đè). Lý do: điểm danh là một **sự kiện đã
  chốt tại một buổi cụ thể** (không phải trạng thái trải dài theo thời gian như
  `HocSinh.trangThai` hay `HocSinhLopHoc.trangThai`) — sửa lại là sửa đúng bản ghi của buổi
  đó, không phải một lần chuyển trạng thái mới cần giữ dấu vết riêng. Audit log
  (`hoc_sinh.diem_danh`/`buoi_hoc.diem_danh`) vẫn ghi lại mỗi lần lưu để có dấu vết ai sửa,
  khi nào — đủ cho truy vết mà không cần bảng lịch sử riêng.
- `BuoiHoc.trangThai`: bổ sung luồng `du_kien` → `da_hoc` khi điểm danh lần đầu (đã có sẵn
  giá trị `da_hoc` từ E05-E08, trước đó chưa có nơi nào set giá trị này).

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `DiemDanh` không có `donViId` riêng — suy ra qua `buoiHocId` → `lopHocId` → `donViId`,
  ràng buộc ở tầng service giống `LichHoc`/`BuoiHoc`.
- Không có thời gian hiệu lực riêng — thời điểm điểm danh gắn chặt với `ngayHoc` của buổi.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `diem_danh.xem` | `diem_danh.thuc_hien` |
| --- | --- | --- |
| Xem danh sách buổi cần điểm danh, xem kết quả điểm danh | Có | Có |
| Ghi nhận/sửa điểm danh | Không | Có |

Tái sử dụng đúng 2 quyền đã seed sẵn (`diem_danh.xem`, `diem_danh.thuc_hien`) — không seed
quyền mới, không đổi ma trận vai trò-quyền hiện có.

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo — M11 — chưa triển khai). Vắng không phép nên tự thông báo cho
  phụ huynh sau này (F05) — ghi chú làm việc tương lai, không làm ở bước này.

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này. Báo cáo chuyên cần tổng hợp để dành cho H09 (báo cáo) hoặc một bước
  riêng khi có nhu cầu thật.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `DiemDanh`: `buoiHocId`, `hocSinhId`, `trangThai` bắt buộc; unique
  `(buoiHocId, hocSinhId)` — đúng một dòng cho mỗi học sinh trong mỗi buổi.
- Không cho điểm danh buổi `nghi`/`huy`.
- Audit log bắt buộc mỗi lần lưu điểm danh (ghi số học sinh đã điểm danh cho buổi đó, không
  ghi từng dòng riêng lẻ — tránh làm phình `NhatKyHeThong` với dữ liệu vụn).

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng ở bước này. Giờ đón/trả và người đón cho mầm non (F06, liên quan
  `HocSinhPhuHuynh.duocDonTre` đã có từ D04) để một bước riêng sau, không trộn vào cấu trúc
  điểm danh dùng chung.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Mở một buổi chưa điểm danh → toàn bộ học sinh mặc định "Có mặt".
- [ ] Đổi một vài học sinh sang vắng/đi trễ, lưu → đúng dữ liệu, buổi chuyển `da_hoc`.
- [ ] Mở lại buổi đã điểm danh → hiển thị đúng dữ liệu đã lưu, sửa lại được.
- [ ] Điểm danh buổi `nghi`/`huy` → bị chặn.
- [ ] `diem_danh.xem` (không có `thuc_hien`) gọi API lưu điểm danh → 403.
- [ ] Roster đúng học sinh đang ghi danh tại đúng ngày học của buổi (không lẫn học sinh đã
      chuyển lớp/ngừng học trước ngày đó, không thiếu học sinh mới vào sau buổi trước).
- [ ] Đổi đơn vị ở Topbar khi đang ở trang `/attendance` → danh sách tải lại đúng đơn vị.
- [ ] `pnpm typecheck` pass.
