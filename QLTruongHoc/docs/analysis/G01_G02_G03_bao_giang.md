# Phân tích chi tiết — G01/G02/G03: Báo giảng theo buổi, nội dung/bài tập, nhận xét giáo viên

> Theo khung checklist mục 14 của BPD. Module liên quan: M08 — Học tập (P1). Phạm vi: ghi
> nhận nội dung đã dạy và bài tập giao cho mỗi buổi học (`BuoiHoc`, có từ E05-E08), kèm
> nhận xét riêng từng học sinh trong buổi đó (dùng lại đúng màn điểm danh, module F). **Chưa**
> gồm G04 (kiểm tra/đánh giá — cần mô hình bài kiểm tra/điểm số riêng), G05 (tiến độ theo
> chương trình — cần đối chiếu với cấu trúc buổi/chương của `ChuongTrinhDaoTao`, hiện chưa
> có cấu trúc chương/bài), G06/G07 (kỹ năng ngoại ngữ, phát triển toàn diện mầm non — nghiệp
> vụ chuyên biệt theo loại hình, để riêng khi có nhu cầu thật).

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: sau mỗi buổi dạy, giáo viên ghi lại đã dạy nội dung gì, giao bài tập gì, và
  nhận xét nhanh cho từng học sinh (nếu cần) — làm cơ sở cho phụ huynh theo dõi sau này
  (Portal, module J) và báo cáo tiến độ (G05, để sau).
- Actor chính: **Giáo viên** (`giao_vien`).
- Actor phụ (chỉ xem): **Nhân viên học vụ** (`hoc_vu`), **Quản lý đơn vị**.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Luồng chính — Ghi báo giảng cho một buổi:**
1. Từ trang Điểm danh (`/attendance`) — đúng buổi vừa điểm danh — mở thêm mục "Báo giảng"
   ngay trên cùng màn hình (không tách trang riêng, vì giáo viên thường làm cả hai việc
   cùng lúc sau buổi dạy).
2. Nhập nội dung bài học, bài tập giao (cả hai đều tuỳ chọn — có buổi không cần bài tập).
3. Lưu — một buổi chỉ có **đúng một** bản ghi báo giảng, sửa lại là ghi đè đúng bản ghi đó
   (giống nguyên tắc đã áp dụng cho điểm danh ở F — buổi là một sự kiện đã chốt, không phải
   trạng thái trải dài theo thời gian).

**Luồng chính — Nhận xét từng học sinh:**
- Ngay trong bảng điểm danh đã có (mỗi dòng một học sinh), thêm một ô "Nhận xét" cạnh ô
  trạng thái điểm danh — lưu cùng lúc với điểm danh, không tách API riêng. Lý do: đúng một
  màn hình, một luồng thao tác, tránh giáo viên phải vào hai chỗ khác nhau cho cùng một
  buổi dạy.

**Luồng ngoại lệ:**
- Ghi báo giảng cho buổi đang `nghi`/`huy` → chặn, giống nguyên tắc điểm danh ở F.
- Không bắt buộc nhập báo giảng — buổi vẫn điểm danh bình thường dù chưa ghi báo giảng.

**Kết quả:** Mỗi buổi học có thể có đầy đủ: điểm danh, nhận xét từng học sinh, và nội dung
giảng dạy — đủ dữ liệu nền cho Portal phụ huynh xem lại sau này (chưa làm ở bước này).

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- Không có trạng thái riêng cho `BaoGiang` — chỉ có/chưa có bản ghi cho một buổi.
- `DiemDanh.nhanXet` là trường tự do, không có quy tắc chuyển trạng thái.

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `BaoGiang` không có `donViId` riêng — suy ra qua `buoiHocId` → `lopHocId` → `donViId`,
  giống `DiemDanh`/`LichHoc`/`BuoiHoc`.
- Không có thời gian hiệu lực riêng — gắn với `ngayHoc` của buổi.

## 5. Vai trò được xem/tạo/sửa/hủy

Không có quyền `hoc_tap.*` sẵn có (khác `diem_danh.*` đã seed từ Sprint 0) — **cần seed
quyền mới**, vì `lop_hoc.quan_ly` (quyền quản lý lớp gần nhất hiện có) không được cấp cho
vai trò giáo viên (giáo viên chỉ có `lop_hoc.xem`), nên không dùng lại được cho việc giáo
viên tự ghi báo giảng của chính mình.

| Thao tác | `hoc_tap.xem` | `hoc_tap.ghi_nhan` |
| --- | --- | --- |
| Xem báo giảng, nhận xét | Có | Có |
| Ghi/sửa báo giảng, nhận xét học sinh | Không | Có |

Gán quyền: `giao_vien` có cả hai (đúng vai trò chính thực hiện); `hoc_vu` và
`quan_ly_don_vi` có cả hai (xem + hỗ trợ ghi thay khi cần, giống cách `quan_ly_don_vi` luôn
có đủ quyền vận hành mọi module). Không gán cho `ke_toan`, `tuyen_sinh`, `tu_van`.

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo — M11 — chưa triển khai). Về sau nội dung báo giảng nên đẩy cho
  phụ huynh xem qua Portal (J) — ghi chú làm việc tương lai.

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `BaoGiang`: `buoiHocId` bắt buộc, unique — đúng một dòng cho mỗi buổi. `noiDungBaiHoc`,
  `baiTap`, `ghiChu` đều tuỳ chọn (không bắt buộc phải điền để lưu).
- `DiemDanh.nhanXet`: thêm cột tuỳ chọn (varchar 500) vào bảng `DiemDanh` đã có — không tạo
  bảng riêng.
- Audit log bắt buộc mỗi lần lưu báo giảng (`bao_giang.save`).

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng ở bước này. Kỹ năng nghe/nói/đọc/viết (G06, ngoại ngữ) và phát
  triển toàn diện (G07, mầm non) cần cấu trúc đánh giá riêng theo từng loại hình — để bước
  sau khi có nhu cầu thật, không trộn vào `BaoGiang` dùng chung.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Ghi báo giảng cho một buổi (nội dung + bài tập) → lưu đúng, xem lại đúng.
- [ ] Ghi báo giảng buổi `nghi`/`huy` → bị chặn.
- [ ] Sửa lại báo giảng đã có → ghi đè đúng bản ghi cũ, không tạo dòng mới.
- [ ] Nhập nhận xét cho một học sinh trong màn điểm danh, lưu cùng lúc với điểm danh → đúng
      dữ liệu, không ảnh hưởng trạng thái điểm danh của học sinh khác.
- [ ] `hoc_tap.xem` (không có `ghi_nhan`) gọi API lưu báo giảng → 403.
- [ ] Vai trò `giao_vien`, `hoc_vu`, `quan_ly_don_vi` có đủ quyền theo đúng bảng ở mục 5 sau
      khi seed lại.
- [ ] `pnpm typecheck` pass.
