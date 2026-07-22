# Phân tích chi tiết — H08: Hoàn phí / chuyển phí / bảo lưu

> Tiếp H03-H07, H09 (đã xong toàn bộ H01-H07/H09). Phạm vi: yêu cầu điều chỉnh một khoản phải
> thu (hoàn phí, chuyển phí sang khoản khác, bảo lưu), có bước duyệt tách vai trò trước khi
> thật sự tác động tới `daThu`/`trangThai`. Đây là mục còn lại cuối cùng của khối Tài chính
> (mục H), làm sau khi đối chiếu với 4 sản phẩm tham khảo (Easy Edu/CenterOnline/DotB EMS,
> KidsOnline/OneKids/MISA EMIS, FACTS/OpenEduCat) — cả 4 đều coi đây là tính năng lõi.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: xử lý 3 tình huống ngoại lệ tài chính không thuộc luồng thu tiền bình thường —
  phụ huynh yêu cầu hoàn lại tiền đã thu (nghỉ học, huỷ đăng ký...), chuyển số tiền đã thu từ
  khoản phải thu này sang khoản khác (thu nhầm kỳ/nhầm khoản, ghép tiền cho khoản khác), hoặc
  bảo lưu (tạm dừng, không truy thu tiếp trong lúc chờ quay lại học).
- Actor: **Kế toán** (`tai_chinh.quan_ly`) — tạo yêu cầu. **Người duyệt** — vai trò được cấp
  quyền mới `tai_chinh.duyet` (ví dụ Quản lý đơn vị, hoặc kế toán trưởng) — duyệt/từ chối.
  Quản trị hệ thống (`he_thong.quan_tri`) có cả hai quyền.

## 2. Vì sao cần bảng riêng thay vì sửa thẳng `KhoanPhaiThu`

BPD 7.6 nói rõ: "Không xóa giao dịch đã thu; sử dụng hủy/hoàn/điều chỉnh có chứng từ" và
"Hoàn/hủy/điều chỉnh theo quy trình phê duyệt". Nếu chỉ thêm nút "hoàn phí" sửa thẳng
`KhoanPhaiThu.daThu` (như cách H04 Miễn giảm/H05 Thu tiền đang làm — hiệu lực ngay, không
duyệt), sẽ không có:
- Chứng từ độc lập cho việc hoàn/chuyển (khác bản chất với miễn giảm — miễn giảm là quyết định
  một chiều của đơn vị, hoàn/chuyển là điều chỉnh một giao dịch tài chính đã có).
- Cơ chế tách người lập/người duyệt — rủi ro một người vừa lập vừa tự duyệt hoàn phí cho chính
  mình.

→ Bảng `DieuChinhKhoanPhaiThu` là bản ghi YÊU CẦU, có trạng thái `cho_duyet/da_duyet/tu_choi`.
Chỉ khi `da_duyet` mới thật sự cập nhật `KhoanPhaiThu` (tái dùng đúng `updateKhoanPhaiThuDaThu`
+ `tinhTrangThaiKhoanPhaiThu` đã có từ H05, không viết lại logic tính trạng thái).

## 3. Luồng chính, luồng ngoại lệ, kết quả

**Luồng chính:**
1. Từ bảng "Khoản phải thu" trong `KyThuDetailPage`, kế toán bấm "Điều chỉnh" trên đúng dòng
   học sinh cần xử lý.
2. Chọn loại (Hoàn phí / Chuyển phí / Bảo lưu), nhập số tiền (không cần cho bảo lưu), chọn
   khoản đích (chỉ chuyển phí), nhập lý do → "Gửi yêu cầu" → tạo bản ghi `cho_duyet`, **chưa**
   đổi số liệu `KhoanPhaiThu`.
3. Người có `tai_chinh.duyet` (khác người lập) mở đúng khoản phải thu đó, xem bảng lịch sử
   điều chỉnh, bấm "Duyệt" hoặc "Từ chối" (qua `ConfirmDialog`).
4. Duyệt hoàn phí → trừ `daThu` khoản nguồn. Duyệt chuyển phí → trừ `daThu` khoản nguồn, cộng
   `daThu` khoản đích (không vượt "còn phải thu" của khoản đích). Duyệt bảo lưu → không đổi số
   liệu, chỉ ghi nhận quyết định. Từ chối → không đổi gì, chỉ đổi trạng thái yêu cầu.
5. Cả hai trường hợp đều ghi audit log riêng (`dieu_chinh.create`, `dieu_chinh.approve`/
   `dieu_chinh.reject`).

**Luồng ngoại lệ:**
- Tạo yêu cầu khi kỳ thu không còn `da_mo` → chặn (tái dùng `requireKhoanPhaiThuTrongKyDangMo`
  như miễn giảm/thu tiền).
- Hoàn phí/chuyển phí số tiền > `daThu` hiện tại của khoản nguồn → chặn (không hoàn/chuyển
  nhiều hơn số thật sự đã thu).
- Chuyển phí số tiền > "còn phải thu" của khoản đích → chặn (không tạo dư thừa/âm ở khoản đích).
- Chuyển phí chọn khoản đích = khoản nguồn → chặn.
- Duyệt một yêu cầu không còn `cho_duyet` (đã xử lý trước đó) → chặn.
- **Người duyệt = người lập** → chặn cứng ở tầng service (`duyetDieuChinh`), không chỉ dựa vào
  khác mã quyền — một tài khoản có thể được gán cả `tai_chinh.quan_ly` lẫn `tai_chinh.duyet`
  cùng lúc, nên kiểm tra thêm theo `nguoiTaoId !== actorUserId`.
- Số tiền ở khoản nguồn/đích có thể đã đổi giữa lúc tạo yêu cầu và lúc duyệt (ví dụ có thêm
  phiếu thu khác) → validate lại toàn bộ tại thời điểm duyệt, không tin số liệu lúc tạo yêu cầu.

**Kết quả:** Lịch sử điều chỉnh đầy đủ theo từng khoản phải thu, có chứng từ (lý do, người lập,
người duyệt, thời điểm), số liệu `KhoanPhaiThu` chỉ đổi sau khi có quyết định duyệt rõ ràng.

## 4. Giới hạn đã biết (để lại có chủ đích)

- **Bảo lưu chưa đổi trạng thái nào trên `KhoanPhaiThu`/`HocSinh`** — chỉ là quyết định được
  ghi nhận (audit trail). Bảo lưu ở mức tổng thể học sinh đã có từ D06 (`HocSinh.trangThai =
  'bao_luu'`, đồng bộ enrollment). Nếu sau này cần "khoản phải thu này đang bảo lưu, tạm ẩn
  khỏi công nợ" như một trạng thái độc lập, cần thêm cột/enum riêng trên `KhoanPhaiThu` — đây
  là thay đổi lớn hơn (ảnh hưởng `listCongNoByDonVi`, báo cáo H09), để lại làm bước sau nếu
  thực sự cần.
- Chưa có trang "duyệt tài chính" riêng gộp mọi yêu cầu đang chờ toàn đơn vị — hiện phải mở
  đúng khoản phải thu (qua kỳ thu) để thấy lịch sử/duyệt của khoản đó. Chấp nhận được vì số
  lượng yêu cầu dự kiến không nhiều ở quy mô một trung tâm.
- Chưa in/xuất chứng từ hoàn phí riêng (khác biên nhận thu H07 đã có `PhieuThuDetailPage` +
  in).

## 5. Mô hình dữ liệu

`database/023_add_dieu_chinh_khoan_phai_thu.sql`, `drizzle/schemas/taiChinh.ts`:

- `DieuChinhKhoanPhaiThu(id, donViId, khoanPhaiThuId, khoanPhaiThuDichId?, loaiDieuChinh,
  soTien, lyDo, trangThai, nguoiTaoId, nguoiDuyetId?, ghiChuDuyet?, createdAt, duyetAt?)`.
- Quyền mới `tai_chinh.duyet` (`server/scripts/seedAuthFoundation.ts`) — chưa gán sẵn cho vai
  trò nào ngoài `quan_tri_he_thong` (được mọi quyền theo cơ chế seed hiện có); cần admin tự gán
  qua `/roles` cho vai trò phù hợp (ví dụ Quản lý đơn vị) khi triển khai thật.

## 6. Test đã chạy

- `pnpm typecheck`, `pnpm build` — PASS.
- Test tay qua UI thật với tài khoản `demo_ketoan` (có `tai_chinh.quan_ly`, cố tình **không**
  có `tai_chinh.duyet`):
  - Mở "Điều chỉnh" trên khoản phải thu của Phạm Gia Hân (Trung tâm Ngoại ngữ Quận 8) — PASS.
  - Chọn "Bảo lưu", nhập lý do, gửi yêu cầu — tạo thành công, hiện đúng trong lịch sử với
    trạng thái "Chờ duyệt", không có cột "Thao tác" (đúng vì tài khoản không có
    `tai_chinh.duyet`) — PASS.
  - Chọn "Hoàn phí" khi `daThu = 0` — nút "Gửi yêu cầu" tự khoá (disabled) tới khi nhập số tiền
    hợp lệ — PASS.
  - Phát hiện và sửa 1 lỗi có sẵn từ trước (không thuộc H08): `KyThuDetailPage.tsx` gọi
    `listLopHocApi()` không bọc lỗi trong `Promise.all` — vai trò kế toán không có
    `lop_hoc.xem` nên cả trang chi tiết kỳ thu vỡ hoàn toàn (403) dù có đủ quyền tài chính. Sửa
    bằng `.catch(() => [])` — không chặn phần còn lại của trang.
- **Chưa test được**: luồng duyệt/từ chối thật (cần tài khoản thứ hai có `tai_chinh.duyet`,
  khác tài khoản lập yêu cầu) và hoàn phí/chuyển phí với số tiền thật > 0 (công cụ tự động hoá
  trình duyệt không nhập ổn định vào `CurrencyInput` trong phiên test này). Logic hai luồng này
  đã được review kỹ qua code + `pnpm typecheck`, nhưng nên test tay qua UI thật trước khi coi
  là hoàn toàn xác nhận.
