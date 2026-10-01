# Thông báo sự kiện tự động (popup/toast) + hoàn thiện luồng tuyển sinh

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [Phần A — Thông báo sự kiện](#phần-a-thông-báo-sự-kiện)
- [Phần B — Hoàn thiện luồng tuyển sinh](#phần-b-hoàn-thiện-luồng-tuyển-sinh)

> Theo yêu cầu người dùng (2026-07-27): "khi có phát sinh thông báo, cần có popup hiện lên cho
> người nhận — nếu đang dùng thì popup thông báo liền, nếu không dùng thì khi vừa login vào sẽ
> nhận thông báo popup. VD: khoản phí kế toán tạo → thông báo cho quản lý đơn vị; quản lý duyệt/từ
> chối → thông báo lại cho kế toán" và "hoàn thiện luồng tuyển sinh, từ tư vấn, xác nhận, làm thủ
> tục nhập học (nhận học viên, phụ huynh) và xếp lớp nếu có sẵn hoặc chờ lớp". Hai phần độc lập,
> gộp chung 1 tài liệu vì làm cùng đợt.

## Phần A — Thông báo sự kiện

### Vì sao không dùng lại bảng `ThongBao` có sẵn

Rà soát trước khi code phát hiện `ThongBao` là hệ thống **thông báo thủ công** (quản lý gõ tay,
gửi theo lớp/học sinh/toàn trường qua trường `phamVi`) — không có trường "người nhận là 1 nhân
viên cụ thể", không có liên kết tới 1 sự kiện nghiệp vụ tuỳ ý. Ứng dụng cũng **không có bất kỳ cơ
chế realtime nào** (không WebSocket/SSE/socket.io) — mọi thứ là REST thuần. → Xây bảng và luồng
mới hoàn toàn tách biệt, dùng **polling** (đơn giản, khớp kiến trúc REST hiện có) thay vì WebSocket.

### Schema — `ThongBaoSuKien` (`drizzle/schemas/thongBaoSuKien.ts`, `database/031_...sql`)

Mỗi dòng nhắm tới **1 người nhận cụ thể** (`nguoiNhanId`), có 2 cờ tách biệt:
- `daHienThi`/`daHienThiAt` — đã pop-up (toast) lần nào chưa. Server tự đánh dấu `true` ngay khi
  client gọi `GET /moi`, nên mỗi sự kiện chỉ pop-up **đúng 1 lần** dù client poll lặp lại.
- `daDoc`/`daDocAt` — đã mở xem ở mục chuông chưa. Tách khỏi `daHienThi` để toast tự biến mất
  không làm mất luôn dấu "chưa đọc" ở chuông — người dùng vẫn tìm lại được trong danh sách.

### Suy người nhận theo quyền, không hard-code vai trò

`listNguoiDungTheoQuyen(donViId, maQuyen)` (`server/db/user.repository.ts`) join
`NguoiDungVaiTroDonVi` (đang hoạt động) → `VaiTro` → `VaiTroQuyen` → `Quyen`, lọc theo `maQuyen` —
đúng cách `requirePermission` middleware đang gác quyền ở router, nên "ai nhận được thông báo" luôn
khớp "ai có quyền xử lý việc đó", không lệch khi vai trò/quyền đổi sau này.

### 2 hàm dùng chung cho mọi luồng nghiệp vụ (`server/services/thongBaoSuKien.service.ts`)

- `notifyTheoQuyen({ donViId, maQuyen, loaiTruNguoiDungId, ... })` — báo cho MỌI người giữ 1 quyền
  trong đơn vị, tự loại người vừa thực hiện hành động ra khỏi danh sách (không tự báo cho chính
  mình).
- `notifyNguoiDung({ donViId, nguoiNhanId, ... })` — báo cho đúng 1 người, dùng khi báo kết quả
  duyệt lại cho người đã tạo.

### Gắn vào 4 luồng duyệt đã có (8 điểm gọi)

| Luồng | Tạo → `notifyTheoQuyen` | Duyệt/từ chối → `notifyNguoiDung` | Quyền nhận |
|---|---|---|---|
| Danh mục chi phí | `createDanhMucChiPhiMoi` | `duyetDanhMucChiPhi` | `tai_chinh.duyet` |
| Đề xuất chi | `ghiNhanChiPhi` | `duyetChiPhi` | `tai_chinh.duyet` |
| Điều chỉnh khoản thu (H08) | `taoYeuCauDieuChinh` | `duyetDieuChinh` | `tai_chinh.duyet` |
| Xin phép (phụ huynh gửi) | `createDonXinPhepByGuardian` | `duyetDonXinPhep` | `diem_danh.thuc_hien` |

Chỉ thêm đúng 1 lệnh gọi sau audit log hiện có ở mỗi hàm — không đổi logic nghiệp vụ gốc.

### Client — poll 20s, KHÔNG cần phân biệt "đang dùng" vs "vừa đăng nhập"

`NotificationContext.tsx` fetch `GET /api/thong-bao-su-kien/moi` ngay khi mount/đổi đơn vị, rồi lặp
lại mỗi 20 giây. Vì mount xảy ra cả lúc "vừa đăng nhập" lẫn trong lúc đang dùng app, **1 cơ chế poll
duy nhất giải quyết cả 2 kịch bản người dùng yêu cầu** — không cần code riêng cho "online" vs
"catch-up khi đăng nhập lại".

- `ToastStack.tsx` — toast góc màn hình, tự đóng sau 7s, bấm vào thì điều hướng theo `duongDan` +
  đánh dấu đã đọc. Tone (info/success/danger) suy từ hậu tố `loaiSuKien`.
- `NotificationBell.tsx` — thay nút chuông chết ở `Topbar.tsx`, hiện badge số chưa đọc + dropdown.
- Cả 2 dùng chung 1 `NotificationProvider` (mount trong `AppShell.tsx`) để tránh 2 nơi poll trùng
  nhau gây tranh chấp đánh dấu `daHienThi`.

### Kiểm thử

Gọi trực tiếp 4 cặp tạo/duyệt qua service thật (tài khoản `demo_ketoan_nn` tạo, `demo_quanly_nn`
duyệt) — xác nhận đúng luồng cả 2 chiều, xác nhận poll lần 2 không trả về sự kiện cũ (không spam
toast). Mở trình duyệt thật xác nhận chuông render, dropdown mở/đóng đúng, request
`/api/thong-bao-su-kien` và `/moi` trả 200 OK liên tục theo polling thật.

## Phần B — Hoàn thiện luồng tuyển sinh

### "Chờ lớp" suy từ dữ liệu enrollment, không thêm bảng/cột mới

Rà soát `HocSinhLopHoc` cho thấy đã đủ dữ liệu để suy "học sinh chưa có lớp": học sinh đang hoạt
động (`trangThai` khác `ngung_hoc`/`hoan_thanh`) mà **không có bản ghi `HocSinhLopHoc` nào đang
`dang_hoc`**. Cách này tự cập nhật đúng ngay khi có người xếp lớp — không cần đồng bộ cờ trạng thái
riêng, tránh y hệt loại bug "quên đồng bộ cờ" mà dữ liệu thật đã lộ ra khi kiểm thử (một học sinh có
`trangThai = "tiep_nhan"` NHƯNG đã có lớp đang học từ trước — nếu dựa vào `trangThai` sẽ sai; suy từ
enrollment thì luôn đúng).

`listHocSinhChoXepLop` (`server/db/hocSinh.repository.ts`) LEFT JOIN `HocSinhLopHoc` lọc
`trangThai = 'dang_hoc'`, lấy các dòng `IS NULL` phía join.

### Xếp lớp ngay lúc xác nhận đăng ký, hoặc để "chờ lớp"

`confirmLeadRegistration` (`server/services/lead.service.ts`) nhận thêm `lopHocId?: number | null`
tuỳ chọn. Sau khi tạo học sinh + gắn phụ huynh như cũ, nếu có `lopHocId` thì gọi thêm
`xepHocSinhVaoLop`. Xếp lớp lỗi (đầy lớp...) **không rollback học sinh vừa tạo** — trả về
`xepLopThatBai: string | null` để operator biết cần xếp thủ công sau; không chọn lớp thì học sinh tự
xuất hiện ở danh sách "chờ xếp lớp".

### 2 gap UX đã đóng ở `LeadDetailPage.tsx`

1. Form "Xác nhận đăng ký" trước đây bắt gõ lại tên học viên dù lead đã có sẵn — nay prefill
   `hoTenHocVien` từ `lead.hoTen` (vẫn sửa được). Các trường khác (ngày sinh, giới tính, địa chỉ)
   giữ nguyên nhập tay vì Lead không thu thập các trường này.
2. Sau khi xác nhận, trước đây chỉ có dòng chữ tĩnh "xem ở trang Học sinh" không có lối đi tiếp —
   nay có link trực tiếp `/students/{hocSinhId}`.

### "Học sinh chờ xếp lớp" trên `StudentsPage.tsx`

Panel riêng phía trên danh sách học sinh (chỉ hiện khi có học sinh đang chờ), mỗi dòng có ô chọn
lớp + nút "Xếp lớp" gọi thẳng `xepHocSinhVaoLopApi` đã có sẵn — không tạo API mới cho hành động
này, chỉ thêm 1 endpoint đọc (`GET /api/hoc-sinh/cho-xep-lop`, quyền `lop_hoc.quan_ly`).

### Kiểm thử

Qua service thật: xác nhận đăng ký 1 lead không chọn lớp → học sinh xuất hiện đúng ở
`listHocSinhChoXepLop`; xác nhận 1 lead khác có chọn lớp → không xuất hiện. Trên trình duyệt thật
(dữ liệu thật, không phải test): panel "Học sinh chờ xếp lớp (1)" hiện đúng 1 học sinh thật đang
thiếu lớp (dù `trangThai` của học sinh đó là "Tiếp nhận" — xác nhận thiết kế dựa-vào-enrollment là
đúng, không phải dựa vào `trangThai`); bấm "Xếp lớp" thành công → học sinh biến mất khỏi panel ngay.
Mở form "Xác nhận đăng ký" của 1 lead thật, xác nhận tên học viên prefill đúng và ô chọn lớp hiện
đủ 3 lớp hợp lệ — không submit vì đây là dữ liệu thật của người dùng, không phải dữ liệu test.
