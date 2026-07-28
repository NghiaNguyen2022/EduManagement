# Phân tích — Hoạt động chăm sóc lead thành task thật (hẹn lịch)

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [1. Hiện trạng trước khi sửa](#1-hiện-trạng-trước-khi-sửa)
- [2. Thiết kế](#2-thiết-kế)
- [3. Việc đã làm](#3-việc-đã-làm)
- [4. Test tay qua service layer thật (không qua UI — tránh phụ thuộc mật khẩu tài khoản demo)](#4-test-tay-qua-service-layer-thật-không-qua-ui-tránh-phụ-thuộc-mật-khẩu-tài-khoản-demo)
- [5. Giới hạn có chủ đích (chưa làm)](#5-giới-hạn-có-chủ-đích-chưa-làm)

> 2026-07-27, theo phản hồi: "Hoạt động chỉ mới tạo và ghi chú, chưa có các hoạt động mang tính
> task như đặt lịch hẹn, sét lịch và gặp gỡ trao đổi".

## 1. Hiện trạng trước khi sửa

`LeadHoatDong` (C03) đã có `loaiHoatDong` gồm `goi_dien`/`gap_truc_tiep`/`nhan_tin`/`hen_lich`/
`hoc_thu`/`khac` và cột `thoiGian` — tưởng như đã hỗ trợ lịch hẹn. Nhưng rà soát
`LeadDetailPage.tsx` ("Ghi nhận hoạt động chăm sóc"): form chỉ có Loại hoạt động, Nội dung, Kết
quả, Đổi trạng thái — **không có ô chọn thời gian**. `thoiGian` luôn bị ghi đè bằng giờ hiện tại
ở service (`input.thoiGian || nowDateTime()`), dù tầng service/router đã âm thầm hỗ trợ nhận
`thoiGian` tuỳ ý từ lâu (chỉ là chưa có UI gửi lên). Hệ quả: "hẹn lịch" chỉ ghi được đúng thời
điểm đang gõ, không đặt trước được cho tương lai — đúng như phản hồi, chỉ là "tạo và ghi chú",
không phải task thật. Đồng thời `LeadHoatDong` không có cột trạng thái nào — không phân biệt được
lịch hẹn đã xử lý hay chưa; `countLichHenTuVanHomNay` (dùng cho Portal tuyển sinh) đếm mọi
`hen_lich` trong ngày bất kể đã xử lý hay chưa.

## 2. Thiết kế

- Thêm `LeadHoatDong.trangThai` (`cho_xu_ly`/`da_xu_ly`/`da_huy`). Chỉ `hen_lich` mới có ý nghĩa
  "task chờ xử lý" — tạo mới với loại này luôn ở `cho_xu_ly`; các loại khác (gọi điện, nhắn tin...)
  vốn là log việc ĐÃ XẢY RA nên tạo thẳng `da_xu_ly`, không cần luồng task, không đổi trải nghiệm
  ghi nhận nhanh hiện có.
- Thêm ô "Thời gian" (`DateTimeField`, component có sẵn nhưng chưa từng dùng ở đâu trong hệ
  thống) vào form ghi hoạt động — mặc định giờ hiện tại, tư vấn viên có thể chọn tương lai để đặt
  lịch hẹn trước.
- "Lịch hẹn sắp tới" — trang mới trong `LeadsPage.tsx` (không tách trang riêng): liệt kê mọi
  `hen_lich` còn `cho_xu_ly` của toàn đơn vị (không lọc theo tư vấn viên — quy mô trung tâm nhỏ,
  ai cũng nên thấy để hỗ trợ chéo), kèm quá hạn chưa xử lý (không giới hạn "hôm nay"), có nút
  "Đã thực hiện"/"Huỷ" xử lý ngay tại đây. Trang chi tiết lead cũng có cùng 2 nút cho từng dòng
  `hen_lich` trong lịch sử chăm sóc.
- `countLichHenTuVanHomNay` (Portal tuyển sinh) lọc thêm `trangThai = cho_xu_ly` — tránh đếm lịch
  hẹn đã xử lý xong vẫn hiện như "còn phải làm hôm nay".

## 3. Việc đã làm

- Schema: `LeadHoatDong.trangThai` (migration `database/029_add_lead_hoat_dong_trang_thai.sql`).
- `lead.repository.ts`: `createLeadHoatDong` nhận `trangThai`; thêm `findLeadHoatDongById`,
  `updateLeadHoatDongTrangThai`, `listLichHenSapToi`; `countLichHenTuVanHomNay` lọc thêm trạng
  thái.
- `lead.service.ts`: `addLeadHoatDongMoi` tự suy `trangThai` theo `loaiHoatDong`; thêm
  `getLichHenSapToi`, `xuLyLichHen` (chặn xử lý 2 lần, chặn xử lý loại khác `hen_lich`).
- `lead.router.ts`: `GET /api/leads/lich-hen-sap-toi`, `PATCH /api/leads/hoat-dong/:id/trang-thai`.
- Client: `LeadActivityFormInput.thoiGian`, `LeadHoatDongItem.trangThai`, `LichHenSapToiItem`,
  `listLichHenSapToiApi`, `xuLyLichHenApi`. `LeadDetailPage.tsx` thêm `DateTimeField` + trạng thái/
  thao tác trong bảng lịch sử. `LeadsPage.tsx` thêm khối "Lịch hẹn sắp tới".

## 4. Test tay qua service layer thật (không qua UI — tránh phụ thuộc mật khẩu tài khoản demo)

Tạo hoạt động `hen_lich` cho lead thật (id 5, đơn vị TTNN-Q8) với `thoiGian` trong tương lai →
đúng `trangThai=cho_xu_ly`; xuất hiện trong `getLichHenSapToi`. Gọi `xuLyLichHen` đánh dấu
`da_xu_ly` → biến mất khỏi danh sách sắp tới. Dữ liệu test đã xoá sau khi xác nhận. `tsc` sạch cả
client/server.

## 5. Giới hạn có chủ đích (chưa làm)

- Không thêm nhắc nhở/thông báo tự động khi tới giờ hẹn (module Thông báo hiện không hỗ trợ
  nhắc theo lịch riêng lẻ) — chỉ hiện trong danh sách "sắp tới" khi tư vấn viên tự mở trang.
  Nếu cần, đây là việc riêng (tích hợp M11).
- "Lịch hẹn sắp tới" không lọc theo tư vấn viên phụ trách — hiện cho mọi người xem trang Tuyển
  sinh trong đơn vị. Nếu trung tâm lớn cần lọc riêng theo người phụ trách, cần thêm bộ lọc, để
  sau khi có nhu cầu thật.
