# Phân tích chi tiết — H03/H04/H05/H06/H07: Khoản phải thu, miễn giảm, thu tiền, công nợ, biên nhận

> Tiếp H01/H02 (mục 18.13). Phạm vi: sinh khoản phải thu cho từng học sinh theo lớp, miễn
> giảm, thu tiền từng phần/nhiều lần, xem công nợ toàn đơn vị, xem lịch sử phiếu thu (biên
> nhận). **Chưa** gồm H08 (hoàn phí/chuyển phí/bảo lưu) và H09 (báo cáo doanh thu tổng hợp
> riêng, có biểu đồ) — để lại làm bước sau, cần thiết kế riêng phức tạp hơn.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: từ kỳ thu đã mở (H02), sinh ra khoản phải thu cụ thể cho từng học sinh đang học
  trong một lớp, cho phép kế toán ghi nhận miễn giảm và thu tiền (có thể nhiều lần cho tới
  khi thu đủ), đồng thời xem được tổng công nợ toàn đơn vị và lịch sử các phiếu thu đã lập.
- Actor chính: **Kế toán** (`ke_toan`), **Quản lý đơn vị** (`quan_ly_don_vi`) — tái dùng đúng
  quyền `tai_chinh.xem`/`tai_chinh.quan_ly` đã có, không tạo quyền mới.

## 2. Luồng chính, luồng ngoại lệ, kết quả

**Luồng chính:**
1. Tại trang chi tiết kỳ thu (đã `da_mo`), kế toán chọn một lớp học → bấm "Sinh khoản phải
   thu" → hệ thống lấy danh sách học sinh đang `dang_hoc` trong lớp đó, với mỗi học sinh chưa
   có khoản phải thu cho kỳ này thì tạo mới (tổng tiền = tổng các khoản thu áp dụng của kỳ),
   học sinh đã có thì bỏ qua (idempotent — chạy lại nhiều lần với nhiều lớp không tạo trùng).
2. Xem bảng "Khoản phải thu" của kỳ: mỗi dòng một học sinh, có tổng tiền/giảm trừ/đã thu/còn
   lại/trạng thái.
3. Miễn giảm: nhập số tiền giảm trừ mới cho một khoản phải thu.
4. Thu tiền: nhập số tiền (mặc định điền sẵn đúng số còn lại), phương thức, ghi chú → hệ
   thống sinh phiếu thu, cộng dồn vào `đã thu`, cập nhật trạng thái.
5. Xem "Lịch sử thu" của một khoản phải thu — danh sách phiếu thu đã lập (đóng vai trò biên
   nhận, có số phiếu tự sinh).
6. Trang Tài chính tổng có mục "Công nợ" — liệt kê mọi khoản phải thu còn nợ (còn lại > 0)
   trên toàn đơn vị, không giới hạn theo một kỳ thu, có liên kết sang đúng kỳ thu.

**Luồng ngoại lệ:**
- Sinh khoản phải thu khi kỳ thu chưa mở hoặc đã đóng → chặn.
- Sinh khoản phải thu cho lớp không thuộc đơn vị hiện tại → chặn.
- Miễn giảm/thu tiền khi kỳ thu không còn `da_mo` (đã đóng) → chặn — đóng kỳ nghĩa là chốt sổ,
  không sửa được nữa (khớp quyết định một chiều đã chốt ở H02).
- Giảm trừ mới cộng với số đã thu vượt quá tổng tiền → chặn (tránh còn lại âm).
- Số tiền thu vượt quá số còn phải thu → chặn (không cho thu quá).
- Số tiền thu ≤ 0 → chặn.

**Kết quả:** Mỗi học sinh trong lớp có đúng một khoản phải thu cho mỗi kỳ thu đã áp dụng, số
liệu công nợ/đã thu chính xác theo thời gian thực, có đầy đủ lịch sử phiếu thu để đối chiếu.

## 3. Trạng thái và quy tắc chuyển trạng thái

- `KhoanPhaiThu.trangThai`: suy ra tự động từ số liệu, không cho sửa tay:
  - `chua_thu` khi `đã thu = 0`.
  - `da_thu_du` khi `còn lại ≤ 0` (tổng tiền − giảm trừ − đã thu).
  - `thu_mot_phan` khi còn lại giữa hai mức trên.
- Không có bước "duyệt" phiếu thu riêng — tạo phiếu thu là ghi nhận đã thu ngay (khớp thực tế
  kế toán ghi nhận tại quầy/khi nhận chuyển khoản, không có quy trình phê duyệt hai bước ở
  MVP này).

## 4. Quyết định dữ liệu — đơn giản hoá so với bản nháp

- Bản nháp `database/003_init_finance_learning.sql` có `PhieuThuChiTiet` cho phép một phiếu
  thu gồm nhiều khoản phải thu khác nhau. **Slice này đơn giản hoá**: một phiếu thu gắn với
  đúng một khoản phải thu (không có bảng `PhieuThuChiTiet`). "Thu từng phần/nhiều lần" (H05)
  vẫn được đáp ứng đủ bằng cách cho phép nhiều phiếu thu trỏ tới cùng một khoản phải thu.
  Nếu sau này cần "một phiếu thu nhiều khoản" (ví dụ thu gộp học phí + tiền ăn trong một lần
  thanh toán của phụ huynh), sẽ bổ sung `PhieuThuChiTiet` ở bước riêng — không phá vỡ dữ liệu
  hiện có vì `PhieuThu.khoanPhaiThuId` vẫn giữ nguyên ý nghĩa.
- Mã phiếu thu tự sinh `PT<năm><5 số>`, khác 4 số của học sinh/lead vì số lượng phiếu thu một
  năm dự kiến nhiều hơn.
- `conLai` **không** dùng cột generated column của MySQL (khác bản nháp) — tính trong tầng
  service (`tongTien - giamTru - daThu`) để tránh phụ thuộc vào việc Drizzle ORM có mô hình
  đúng generated column khi update hay không, giữ đơn giản và nhất quán với style hiện tại.
- Công nợ toàn đơn vị (H06) lấy trực tiếp từ `KhoanPhaiThu` với điều kiện còn lại > 0, không
  cần bảng tổng hợp riêng — số lượng bản ghi ở quy mô một trung tâm không đủ lớn để cần
  denormalize.

## 5. Mô hình dữ liệu

Xem `drizzle/schemas/taiChinh.ts` (mở rộng) và
`database/018_add_khoan_phai_thu_phieu_thu.sql`.

- `KhoanPhaiThu(id, donViId, kyThuId, hocSinhId, tongTien, giamTru, daThu, trangThai)` — unique
  `(kyThuId, hocSinhId)`.
- `KhoanPhaiThuChiTiet(id, khoanPhaiThuId, danhMucKhoanThuId, soTien)` — chi tiết theo từng
  khoản thu trong kỳ, phục vụ tra cứu/báo cáo sau này (H09), không dùng để tính tiền trực
  tiếp ở slice này (tổng tiền đã chốt sẵn trên `KhoanPhaiThu.tongTien`).
- `PhieuThu(id, donViId, khoanPhaiThuId, hocSinhId, soPhieu, soTien, phuongThuc, nguoiThuId,
  ngayThu, ghiChu)` — unique `(donViId, soPhieu)`.
