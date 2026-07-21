# Phân tích chi tiết — C01/C02/C03/C06: Lead và chuyển đổi thành học sinh

> Theo khung checklist mục 14 của BPD. Module liên quan: M03 — CRM tuyển sinh (P1).
> Phạm vi: tiếp nhận lead, ghi nhận nhu cầu, lịch sử chăm sóc, xác nhận đăng ký (chuyển
> lead thành học sinh + phụ huynh). **Chưa** gồm C04 (đã có qua form xác nhận đăng ký, xem
> mục 2), C05 (kiểm tra đầu vào ngoại ngữ — Sprint 7), C07 (tài khoản đăng nhập phụ huynh —
> bước riêng ngay sau, phụ thuộc bước này).

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: quản lý khách hàng tiềm năng (lead) từ khi tiếp nhận đến khi xác nhận đăng ký,
  tái sử dụng đúng hồ sơ học sinh/phụ huynh đã xây ở D01/D03 khi chuyển đổi.
- Actor chính: Tuyển sinh (`tuyen_sinh.quan_ly`), Tư vấn viên (`tuyen_sinh.quan_ly` — xem
  quyết định phân quyền mục 5).

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Điểm bắt đầu:** Có người quan tâm liên hệ (điện thoại, walk-in, form web...).

**Luồng chính — Tiếp nhận lead (C01/C02):**
1. Nhân viên tuyển sinh tạo lead: họ tên người liên hệ, số điện thoại, email (tuỳ chọn),
   nguồn (giới thiệu/Facebook/website/walk-in/khác), độ tuổi hoặc trình độ quan tâm, nhu
   cầu (khóa/lớp quan tâm — ghi chú tự do ở bước này, chưa gắn cứng vào `ChuongTrinhDaoTao`
   vì Sprint 2 chưa làm).
2. Có thể phân công tư vấn viên ngay hoặc để trống, phân công sau.
3. Trạng thái mặc định `moi`.

**Luồng chính — Chăm sóc lead (C03):**
1. Từ chi tiết lead → Ghi nhận hoạt động: loại (gọi điện/gặp trực tiếp/nhắn tin/hẹn
   lịch/học thử/khác), nội dung, kết quả (tuỳ chọn), thời gian.
2. Có thể chọn kèm trạng thái mới cho lead trong cùng thao tác (ví dụ ghi "đã hẹn lịch" và
   chuyển trạng thái sang `da_hen_lich`) — **trừ** không cho chuyển thẳng sang `da_dang_ky`
   qua đường này (phải qua luồng xác nhận đăng ký riêng, xem dưới).
3. Lịch sử hoạt động append-only, không sửa/xoá.

**Luồng chính — Xác nhận đăng ký, sinh học sinh (C06):**
1. Từ lead đủ điều kiện (chưa `da_dang_ky`, chưa `khong_tiep_tuc`) → Xác nhận đăng ký.
2. Nhập thông tin học viên: họ tên, ngày sinh, giới tính, địa chỉ, ngày nhập học (họ tên
   người liên hệ trên lead **không** mặc định là học viên — thường là phụ huynh, phải nhập
   riêng học viên).
3. Chọn mối quan hệ của người liên hệ trên lead với học viên (cha/mẹ/ông/bà/người giám
   hộ/khác).
4. Hệ thống: tạo `HocSinh` mới (dùng lại `createHocSinhMoi`), thêm phụ huynh liên kết dùng
   lại `addGuardianToStudent` (số điện thoại = số điện thoại lead → tự tái sử dụng đúng
   phụ huynh nếu trùng số đã có trong đơn vị, đúng quy tắc đã chốt ở D03), đặt liên hệ
   chính = người liên hệ trên lead.
5. Cập nhật `Lead.trangThai = da_dang_ky`, `Lead.hocSinhId` trỏ tới học sinh mới tạo.

**Luồng ngoại lệ:**
- Không cho xác nhận đăng ký nếu lead đã `da_dang_ky` (tránh tạo học sinh trùng từ cùng
  một lead) hoặc đã `khong_tiep_tuc` (phải mở lại trạng thái trước — xem dưới).
- Đánh dấu "không tiếp tục" bắt buộc nhập lý do; có thể mở lại về `dang_cham_soc` sau nếu
  khách hàng quay lại (không khoá vĩnh viễn).
- Sửa thông tin cơ bản của lead (họ tên, số điện thoại, nguồn, nhu cầu) không cho phép nếu
  lead đã `da_dang_ky` (đã có học sinh thật, sửa lead lúc này không còn ý nghĩa nghiệp vụ).

**Kết quả:** Lead có lịch sử chăm sóc đầy đủ; khi đủ điều kiện, chuyển đổi thành hồ sơ học
sinh + phụ huynh thật mà không tạo trùng dữ liệu.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

`Lead.trangThai`: `moi` → `dang_cham_soc` ↔ `da_hen_lich` ↔ `da_hoc_thu` → `da_dang_ky`
(cuối, khoá) hoặc → `khong_tiep_tuc` (có thể mở lại về `dang_cham_soc`). Không cho chuyển
vào `da_dang_ky` trừ qua luồng xác nhận đăng ký (mục 2).

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `Lead.donViId`, mọi truy vấn lọc theo đơn vị hiện tại.
- `LeadHoatDong` không có `donViId` riêng — suy ra qua `leadId` (ràng buộc ở service).
- `LeadHoatDong.thoiGian` là thời điểm hoạt động diễn ra (có thể khác thời điểm nhập liệu),
  mặc định là hiện tại nếu không nhập.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `tuyen_sinh.xem` | `tuyen_sinh.quan_ly` |
| --- | --- | --- |
| Xem danh sách/chi tiết lead + lịch sử | Có | Có |
| Tạo lead, sửa thông tin, phân công tư vấn viên | Không | Có |
| Ghi nhận hoạt động chăm sóc | Không | Có |
| Đánh dấu không tiếp tục / mở lại | Không | Có |
| Xác nhận đăng ký (tạo học sinh) | Không | Có |

**Quyết định phân quyền:** vai trò `tu_van` hiện chỉ được seed `tuyen_sinh.xem` (chỉ xem),
nhưng mô tả nghiệp vụ gốc của Tư vấn viên là "chăm sóc lead, tư vấn, follow-up" — cần tạo
được hoạt động chăm sóc. Ở MVP này, cấp thêm `tuyen_sinh.quan_ly` cho vai trò `tu_van`
(dùng chung phạm vi với `tuyen_sinh`), chưa tách quyền chi tiết hơn (ví dụ chỉ cho ghi hoạt
động mà không cho xác nhận đăng ký) — tránh tạo permission quá sớm khi chưa có nhu cầu thật
phân biệt rõ. Có thể tách lại khi vận hành thật cho thấy cần thiết.

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo chưa triển khai).

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này (báo cáo tuyển sinh — REP-02 — để sau).

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `Lead`: `hoTen`, `soDienThoai` bắt buộc. `maLead` tự sinh `LD<năm><4 số>`, unique theo
  `(donViId, maLead)`.
- `LeadHoatDong`: `loaiHoatDong`, `noiDung` bắt buộc.
- Đánh dấu "không tiếp tục" bắt buộc `lyDoKhongTiepTuc`.
- Audit log bắt buộc cho: tạo lead, sửa lead, phân công tư vấn viên, ghi hoạt động, đổi
  trạng thái, xác nhận đăng ký.

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng ở bước này. Trường `doTuoiHoacTrinhDo` dùng chung (ghi chú tự
  do), đủ cho cả mầm non (độ tuổi) và ngoại ngữ/tin học (trình độ) mà không cần cấu hình
  riêng theo loại hình.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Tạo lead mới, `maLead` tự sinh đúng.
- [ ] Ghi nhận hoạt động chăm sóc kèm đổi trạng thái — trạng thái lead cập nhật đúng.
- [ ] Không thể chuyển trạng thái lead thành `da_dang_ky` qua API ghi hoạt động.
- [ ] Đánh dấu không tiếp tục thiếu lý do → bị chặn.
- [ ] Xác nhận đăng ký: tạo đúng `HocSinh` mới, `Lead.hocSinhId` trỏ đúng, `Lead.trangThai`
      chuyển `da_dang_ky`.
- [ ] Xác nhận đăng ký với số điện thoại lead trùng phụ huynh đã có trong đơn vị (từ D03)
      → tái sử dụng đúng phụ huynh, không tạo trùng — regression D03.
- [ ] Xác nhận đăng ký lần 2 cho cùng lead đã `da_dang_ky` → bị chặn.
- [ ] `tuyen_sinh.xem` (không có `quan_ly`) không gọi được API tạo/sửa/xác nhận (403).
- [ ] Dữ liệu lead của đơn vị A không lọt sang đơn vị B.
- [ ] `pnpm typecheck` và `pnpm build` pass.
