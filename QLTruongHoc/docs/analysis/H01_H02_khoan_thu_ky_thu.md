# Phân tích chi tiết — H01/H02: Danh mục khoản thu, Kỳ thu

> Theo khung checklist mục H (Tài chính), Sprint 5. Phạm vi: danh mục khoản thu dùng chung
> cho toàn đơn vị, kỳ thu (đợt thu tiền) và gán khoản thu áp dụng cho từng kỳ. **Chưa** gồm
> H03-H09 (sinh khoản phải thu theo lớp/học sinh, thu tiền từng phần, miễn giảm, công nợ,
> biên nhận, hoàn phí/chuyển phí/bảo lưu, báo cáo doanh thu) — để lại làm slice tiếp theo, vì
> các mục đó phụ thuộc trực tiếp vào `KhoanPhaiThu`/`PhieuThu` chưa tồn tại ở bước này.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: chuẩn hoá danh mục các loại phí (học phí, tiền ăn, dịch vụ, tài liệu...) và gom
  chúng thành từng đợt thu cụ thể (kỳ thu) có thời gian áp dụng và hạn thanh toán rõ ràng —
  làm nền cho việc sinh khoản phải thu theo học sinh ở slice sau.
- Actor chính: **Kế toán** (`ke_toan`) — đã có `tai_chinh.xem`/`tai_chinh.quan_ly` từ seed
  mặc định Sprint 0, chưa từng dùng vì module H chưa tồn tại. **Quản lý đơn vị**
  (`quan_ly_don_vi`) có cả hai quyền.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, kết quả

**Luồng chính — Chuẩn bị một đợt thu:**
1. Kế toán tạo danh mục khoản thu (nếu chưa có sẵn) — mã tự đặt, loại khoản thu, số tiền mặc
   định (tuỳ chọn), có bắt buộc hay không.
2. Tạo kỳ thu mới — mã tự đặt, loại kỳ (tháng/khoá học/học kỳ/đợt), khoảng thời gian áp dụng,
   hạn thanh toán. Kỳ thu mới luôn ở trạng thái `nhap`.
3. Vào chi tiết kỳ thu, chọn các khoản thu áp dụng cho kỳ này kèm số tiền cụ thể (có thể khác
   số tiền mặc định của danh mục — ví dụ học phí tháng có khuyến mãi).
4. Bấm "Mở kỳ thu" khi đã sẵn sàng — khoá sửa thông tin/khoản áp dụng, chuẩn bị cho bước sinh
   khoản phải thu ở slice sau.
5. Khi kết thúc đợt thu, đóng kỳ thu.

**Luồng ngoại lệ:**
- Tạo khoản thu/kỳ thu tại đơn vị hệ thống → chặn (`assertDonViChoPhepNghiepVu`, đã có từ
  E01-E04, cùng nguyên tắc "đơn vị hệ thống chỉ quản trị, không phát sinh dữ liệu nghiệp vụ").
- Sửa thông tin hoặc khoản áp dụng của kỳ thu đã `da_mo`/`da_dong` → chặn.
- Mở kỳ thu chưa có khoản thu áp dụng nào → chặn (mở một kỳ rỗng không có ý nghĩa).
- Đóng kỳ thu chưa `da_mo` (còn `nhap`) → chặn — phải mở trước rồi mới đóng được.
- Gán một khoản thu đã `ngung_ap_dung` vào kỳ thu → chặn.
- `tai_chinh.xem` (không có `tai_chinh.quan_ly`) gọi API tạo/sửa → 403.

**Kết quả:** Có đủ danh mục khoản thu và kỳ thu đã mở, sẵn sàng để slice sau (H03) sinh
`KhoanPhaiThu` cho từng học sinh dựa trên kỳ thu này.

## 3. Trạng thái và quy tắc chuyển trạng thái

- `DanhMucKhoanThu.trangThai`: `hoat_dong` ⇄ `ngung_ap_dung` — đổi tự do hai chiều (giống
  `ChuongTrinhDaoTao`). Ngừng áp dụng thì không gán được vào kỳ thu mới, nhưng dữ liệu trong
  các kỳ thu cũ vẫn giữ nguyên (không xoá `KyThuKhoanThu` đã có).
- `KyThu.trangThai`: `nhap` → `da_mo` → `da_dong`, **một chiều, không quay lại được**. Lý do
  không cho quay lại: một khi đã mở, slice sau có thể đã sinh `KhoanPhaiThu` dựa trên khoản
  áp dụng của kỳ — cho phép sửa lại sau khi mở sẽ làm lệch dữ liệu đã sinh. Quyết định này
  chốt trước khi `KhoanPhaiThu` tồn tại, để tránh phải làm lại thiết kế khi thêm H03.

## 4. Quyết định dữ liệu

- Mã khoản thu/kỳ thu: **nhân viên tự đặt** (không tự sinh), giống chương trình đào tạo/lớp
  học — khác mã học sinh/phụ huynh/lead (tự sinh theo năm).
- `KyThuKhoanThu` (khoản thu áp dụng cho kỳ): cập nhật theo kiểu **thay toàn bộ danh sách**
  (xoá hết rồi chèn lại) thay vì API thêm/gỡ từng dòng — đơn giản hơn cho UI chọn nhiều khoản
  cùng lúc bằng checkbox, cùng nguyên tắc với lưu điểm danh hàng loạt (F01).
- Số tiền lưu dạng chuỗi thập phân cố định 2 chữ số (`toFixed(2)`) trước khi ghi DB, tránh sai
  số dấu phẩy động khi cộng dồn ở slice sau (H05 thu từng phần).
- Không seed quyền mới — tái dùng `tai_chinh.xem`/`tai_chinh.quan_ly` đã có từ Sprint 0 và đã
  gán sẵn cho `ke_toan`/`quan_ly_don_vi` trong `database/008_seed_default_role_permissions.sql`.

## 5. Mô hình dữ liệu

Tham khảo bản nháp `database/003_init_finance_learning.sql` (chưa từng áp dụng), viết lại
đúng quy ước Drizzle hiện tại (bigint unsigned, index `IX_`/`UQ_`, datetime mode string không
DEFAULT CURRENT_TIMESTAMP). Xem `drizzle/schemas/taiChinh.ts` và
`database/017_add_khoan_thu_ky_thu.sql`.

- `DanhMucKhoanThu(id, donViId, maKhoanThu, tenKhoanThu, loaiKhoanThu, soTienMacDinh,
  batBuoc, trangThai)` — unique `(donViId, maKhoanThu)`.
- `KyThu(id, donViId, maKyThu, tenKyThu, loaiKy, tuNgay, denNgay, hanThanhToan, trangThai)` —
  unique `(donViId, maKyThu)`.
- `KyThuKhoanThu(id, kyThuId, danhMucKhoanThuId, soTien, ghiChu)` — unique
  `(kyThuId, danhMucKhoanThuId)`.
