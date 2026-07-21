# Phân tích chi tiết — D05/D06: Lịch sử trạng thái học tập, chuyển lớp/ngừng học/bảo lưu

> Theo khung checklist mục 14 của BPD. Module liên quan: M04 — Hồ sơ học sinh (P0). Phạm
> vi: lịch sử đổi `HocSinh.trangThai` (tổng thể học sinh, khác `HocSinhLopHoc.trangThai` đã
> có ở E03 — trạng thái theo từng lớp), và đồng bộ hai tầng trạng thái này khi đổi ở cấp học
> sinh. Hạ tầng chính đã có sẵn từ D01 (`HocSinh.trangThai`, API `setHocSinhTrangThai` đã
> tồn tại nhưng chưa có lịch sử/chưa đồng bộ enrollment) và E03 (`HocSinhLopHoc`).

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: khi nhân viên học vụ đổi trạng thái tổng thể của một học sinh (ví dụ "Ngừng
  học", "Bảo lưu"), hệ thống (1) ghi lại lịch sử để biết đổi khi nào, từ trạng thái nào,
  lý do gì, và (2) tự đồng bộ trạng thái ở tất cả lớp học sinh đang theo học — tránh tình
  trạng học sinh đã "Ngừng học" ở hồ sơ chung nhưng vẫn hiện "Đang học" trong lớp.
- Actor chính: **Nhân viên học vụ** (`hoc_vu`), tái sử dụng quyền `hoc_sinh.quan_ly` đã có.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Luồng chính — Đổi trạng thái học sinh:**
1. Từ trang chi tiết học sinh → mục "Trạng thái" → chọn trạng thái mới, nhập lý do (tuỳ
   chọn), chọn ngày hiệu lực (mặc định hôm nay).
2. Hệ thống ghi một dòng lịch sử mới (`HocSinhTrangThaiLichSu`) — không ghi đè, giữ đúng
   nguyên tắc lịch sử chung của BPD.
3. Nếu trạng thái mới là `ngung_hoc` hoặc `hoan_thanh`: đóng tất cả `HocSinhLopHoc` đang
   `dang_hoc`/`bao_luu` của học sinh — set `trangThai` tương ứng (`ngung_hoc`/`hoan_thanh`),
   `ngayRoiLop` = ngày hiệu lực, `lyDoRoiLop` = lý do chung.
4. Nếu trạng thái mới là `bao_luu`: chuyển tất cả `HocSinhLopHoc` đang `dang_hoc` sang
   `bao_luu` (không đóng, không set `ngayRoiLop` — bảo lưu là tạm dừng, không phải rời lớp).
5. Nếu trạng thái mới là `tiep_nhan`/`dang_hoc` (mở lại): **không** tự động mở lại các
   enrollment đã đóng/bảo lưu — nhân viên học vụ xếp lại lớp thủ công qua màn hình lớp học
   (E03), vì có thể xếp vào lớp khác lớp cũ. Quyết định MVP để tránh suy luận sai lớp đích.

**Luồng chính — Xem lịch sử trạng thái:**
- Trang chi tiết học sinh hiển thị danh sách lịch sử (mới nhất trước), gồm: từ trạng thái
  nào → sang trạng thái nào, ngày hiệu lực, lý do, người thao tác, thời điểm ghi nhận.
- Đồng thời hiển thị danh sách lớp học sinh đã/đang tham gia (tái dùng dữ liệu
  `HocSinhLopHoc` đã có, chỉ thêm API liệt kê theo `hocSinhId` — trước đây chỉ có chiều
  ngược lại là liệt kê học sinh theo lớp).

**Luồng ngoại lệ:**
- Trạng thái mới trùng trạng thái hiện tại → chặn, báo lỗi (tránh ghi lịch sử rỗng).
- Trạng thái không hợp lệ → chặn (giữ nguyên validate cũ).

**Kết quả:** Hồ sơ học sinh có lịch sử trạng thái đầy đủ; trạng thái lớp học luôn nhất quán
với trạng thái tổng thể học sinh sau mỗi lần đổi ở cấp học sinh.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- `HocSinh.trangThai`: `tiep_nhan` ↔ `dang_hoc` ↔ `bao_luu` → `ngung_hoc`/`hoan_thanh`.
  Giữ nguyên tập giá trị đã có (D01), không thêm/bớt — chỉ thêm cơ chế lịch sử + đồng bộ.
- Không thêm quy tắc chặn chuyển trạng thái theo thứ tự cứng (giữ đúng mức độ linh hoạt đã
  có từ trước — MVP chưa cần state machine chặt, chỉ chặn set trùng trạng thái hiện tại).

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `HocSinhTrangThaiLichSu` không có `donViId` riêng — suy ra qua `hocSinhId`, ràng buộc ở
  tầng service (học sinh phải thuộc đúng đơn vị đang chọn, theo đúng mẫu `HocSinhLopHoc`).
- Có thời gian hiệu lực: `ngayHieuLuc` trên mỗi dòng lịch sử.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `hoc_sinh.xem` | `hoc_sinh.quan_ly` |
| --- | --- | --- |
| Xem lịch sử trạng thái, danh sách lớp đã tham gia | Có | Có |
| Đổi trạng thái học sinh (tự động ghi lịch sử + đồng bộ lớp) | Không | Có |

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo — M11 — chưa triển khai).

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `HocSinhTrangThaiLichSu`: `hocSinhId`, `trangThaiMoi`, `ngayHieuLuc` bắt buộc;
  `trangThaiCu` có thể NULL (dòng đầu tiên lúc tạo hồ sơ); không có ràng buộc unique (một
  học sinh có nhiều dòng lịch sử theo thời gian).
- Audit log bắt buộc cho mỗi lần đổi trạng thái (đã có sẵn `hoc_sinh.set_status`, giữ
  nguyên, không tạo action mới).

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng — dùng chung cho mọi loại hình.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Đổi trạng thái học sinh sang `ngung_hoc` → tất cả enrollment `dang_hoc`/`bao_luu`
      chuyển đúng `ngung_hoc`, có `ngayRoiLop`.
- [ ] Đổi trạng thái sang `bao_luu` → enrollment `dang_hoc` chuyển `bao_luu`, không có
      `ngayRoiLop`.
- [ ] Đổi trạng thái sang chính trạng thái hiện tại → bị chặn.
- [ ] Lịch sử trạng thái hiển thị đúng thứ tự, đủ dòng qua nhiều lần đổi.
- [ ] Danh sách lớp đã tham gia hiển thị đúng trên trang chi tiết học sinh.
- [ ] `hoc_sinh.xem` (không có `quan_ly`) gọi API đổi trạng thái → 403.
- [ ] `pnpm typecheck` pass.
