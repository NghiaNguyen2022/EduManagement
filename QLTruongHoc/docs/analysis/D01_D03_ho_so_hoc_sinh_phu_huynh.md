# Phân tích chi tiết — D01/D03: Hồ sơ học sinh và phụ huynh

> Theo khung checklist mục 14 của BPD. Module liên quan: M04 — Hồ sơ học viên (P0).
> Phạm vi: chỉ hồ sơ học sinh + phụ huynh + liên kết. **Chưa** gồm tài khoản đăng nhập
> phụ huynh (C07 — bước sau) và **chưa** gồm luồng Lead/tuyển sinh (C01-C06 — bước sau).
> Lý do tách nhỏ: học sinh/phụ huynh là thực thể nền mà cả hai luồng trên đều phụ thuộc,
> nên phải có trước; giữ đúng nguyên tắc vertical-slice từng bước nhỏ có thể test độc lập.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: quản lý hồ sơ học sinh và người giám hộ (phụ huynh) trong phạm vi một đơn vị,
  làm nền cho xếp lớp, điểm danh, học phí, cổng phụ huynh ở các bước sau.
- Actor chính: Nhân viên học vụ (`hoc_sinh.quan_ly`), Tuyển sinh (`hoc_sinh.xem` qua quyền
  đã seed cho vai trò `tuyen_sinh`), Quản lý đơn vị, Quản trị hệ thống.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Điểm bắt đầu:** Người dùng đã chọn đơn vị làm việc, có quyền `hoc_sinh.quan_ly`.

**Luồng chính — Tạo hồ sơ học sinh:**
1. Mở "Học sinh · Học viên" → Thêm học sinh.
2. Nhập họ tên, tên thường gọi (tuỳ chọn), ngày sinh, giới tính, ngày nhập học, địa chỉ.
3. Hệ thống tự sinh `maHocSinh` theo đơn vị (không để trống, không cho nhập tay ở bước
   này để tránh trùng — xem quy tắc mục 8).
4. Lưu → trạng thái mặc định `tiep_nhan`.

**Luồng chính — Thêm phụ huynh cho học sinh:**
1. Từ trang chi tiết học sinh → Thêm phụ huynh.
2. Nhập số điện thoại trước. Hệ thống tìm phụ huynh đã có trong đơn vị theo đúng số điện
   thoại:
   - Nếu **có** → hiển thị thông tin phụ huynh tìm thấy, chỉ cần xác nhận quan hệ
     (cha/mẹ/ông/bà/người giám hộ/khác) và các cờ (liên hệ chính, được đón trẻ, nhận thông
     báo, nhận thông tin học phí) — **không tạo phụ huynh trùng**.
   - Nếu **chưa có** → nhập đầy đủ hồ sơ phụ huynh mới (họ tên, ngày sinh, giới tính, nghề
     nghiệp, địa chỉ, email) rồi lưu.
3. Nếu đánh dấu "liên hệ chính", hệ thống tự bỏ đánh dấu liên hệ chính của phụ huynh khác
   đang giữ vai trò đó cho học sinh này (chỉ một liên hệ chính tại một thời điểm).
4. Lưu quan hệ `HocSinhPhuHuynh`.

**Luồng ngoại lệ:**
- Không thể xoá liên kết phụ huynh nếu đó là liên hệ chính duy nhất và học sinh còn phụ
  huynh khác — phải chỉ định liên hệ chính mới trước.
- Không thể xoá liên kết nếu học sinh chỉ còn đúng một phụ huynh (học sinh phải luôn có
  tối thiểu một người giám hộ một khi đã có ít nhất một).
- Đổi trạng thái học sinh sang `ngung_hoc`/`hoan_thanh` không xoá hồ sơ, không xoá liên kết
  phụ huynh (giữ lịch sử).

**Kết quả:** Hồ sơ học sinh đầy đủ, có tối thiểu một phụ huynh với đúng một liên hệ chính
(nếu đã có phụ huynh), sẵn sàng cho xếp lớp và tạo tài khoản phụ huynh ở bước sau.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

`HocSinh.trangThai`: `tiep_nhan` → `dang_hoc` → (`bao_luu` ↔ `dang_hoc`) → `ngung_hoc` /
`hoan_thanh`. Không giới hạn chiều chuyển ở bước này (chưa gắn với lớp/kỳ thu để ràng buộc
chặt hơn — sẽ siết lại khi có Sprint 2/3).

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `HocSinh.donViId`, `PhuHuynh.donViId` bắt buộc, mọi truy vấn lọc theo đơn vị hiện tại.
- `HocSinhPhuHuynh` không có `donViId` riêng — suy ra qua `hocSinhId`/`phuHuynhId` (cả hai
  luôn cùng đơn vị, ràng buộc ở tầng service khi thêm liên kết).
- Chưa có khái niệm thời gian hiệu lực cho quan hệ phụ huynh-học sinh ở bước này (không
  tách lịch sử "từng là phụ huynh nhưng đã gỡ") — nếu cần truy vết sẽ bổ sung sau.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `hoc_sinh.xem` | `hoc_sinh.quan_ly` |
| --- | --- | --- |
| Xem danh sách/chi tiết học sinh + phụ huynh | Có | Có |
| Tạo/sửa học sinh | Không | Có |
| Đổi trạng thái học sinh | Không | Có |
| Thêm/sửa/gỡ liên kết phụ huynh | Không | Có |

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo chưa triển khai).

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `HocSinh`: `hoTen`, `ngaySinh` bắt buộc. `maHocSinh` hệ thống tự sinh theo mẫu
  `HS<donViId>-<số thứ tự 4 chữ số>`, unique theo `(donViId, maHocSinh)` (đã có index).
- `PhuHuynh`: `hoTen`, `dienThoai` bắt buộc. Không có ràng buộc unique cứng ở DB cho số
  điện thoại (một số trường hợp thật có thể trùng số hoặc chưa có số) — việc gộp/tách
  trùng lặp xử lý ở tầng service khi thêm liên kết (dò theo `dienThoai` trong cùng đơn vị,
  không tự động ở tầng DB).
- `HocSinhPhuHuynh`: unique `(hocSinhId, phuHuynhId)` — một phụ huynh chỉ có một quan hệ
  với một học sinh.
- Audit log bắt buộc cho: tạo học sinh, sửa học sinh, đổi trạng thái, thêm/sửa/gỡ liên kết
  phụ huynh.

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng theo loại hình ở bước này. `duocDonTre` trên
  `HocSinhPhuHuynh` giữ chung cho mọi loại hình (áp dụng rõ nhất ở mầm non nhưng không
  chặn hiển thị ở loại hình khác — tránh over-engineer bằng cấu hình theo loại hình khi
  chưa cần).
- Hồ sơ sức khỏe mầm non (D02) và người đón trẻ chi tiết (D04) để lại cho Sprint 7.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Tạo học sinh mới, `maHocSinh` tự sinh đúng, không trùng.
- [ ] Thêm phụ huynh mới cho học sinh — tạo đúng `PhuHuynh` mới.
- [ ] Thêm phụ huynh cho học sinh khác với số điện thoại trùng phụ huynh đã có trong đơn
      vị → tái sử dụng đúng bản ghi cũ, không tạo trùng, không cần xác nhận thêm.
- [ ] Thêm phụ huynh với số điện thoại trùng một phụ huynh đã có ở **đơn vị khác** → API trả
      lỗi kèm `needsConfirmation`, UI hiện `ConfirmDialog` đúng tên/mã/đơn vị gốc; xác nhận
      xong mới tạo liên kết, ghi log `hoc_sinh.add_guardian_cross_org`.
- [ ] Tạo tài khoản cho phụ huynh dùng chung hồ sơ khác đơn vị → tài khoản không bị tạo trùng.
- [ ] Portal phụ huynh (`/portal/parent`) hiển thị đúng con dù đơn vị đang chọn (đơn vị neo
      phiên đăng nhập, ví dụ đơn vị hệ thống) khác với đơn vị của hồ sơ `PhuHuynh`/`HocSinh` —
      không cần có thêm bản ghi phân quyền `phu_huynh` riêng cho từng đơn vị con học.
- [ ] Đặt liên hệ chính mới → liên hệ chính cũ tự bỏ đánh dấu.
- [ ] Không xoá được liên kết nếu là liên hệ chính duy nhất còn phụ huynh khác.
- [ ] Không xoá được liên kết cuối cùng của học sinh.
- [ ] Dữ liệu học sinh/phụ huynh của đơn vị A không lọt sang đơn vị B ngoài đúng trường hợp
      dùng chung hồ sơ phụ huynh đã xác nhận (mục 11).
- [ ] `hoc_sinh.xem` (không có `quan_ly`) không gọi được API tạo/sửa (403).
- [ ] `pnpm typecheck` và `pnpm build` pass.

## 11. Cập nhật 2026-07-22 — Phụ huynh có con học nhiều đơn vị

Chủ đích nghiệp vụ được xác nhận: **một phụ huynh có thể có con học ở nhiều đơn vị khác
nhau** (một con chuyển/nhiều con mỗi con một đơn vị), và nên dùng chung một hồ sơ/tài khoản
thay vì buộc phải tạo lại từ đầu ở mỗi đơn vị. Đây là lý do Portal phụ huynh (mục J,
`server/services/portal.service.ts`) cần gộp dữ liệu từ nhiều đơn vị cho cùng một tài khoản
đăng nhập.

Để làm được điều này, `addGuardianToStudent`
(`server/services/phuHuynh.service.ts`) đổi từ tìm phụ huynh trùng số điện thoại **trong
đơn vị** (`findPhuHuynhByPhone`) sang tìm **toàn hệ thống** (`findPhuHuynhByPhoneGlobal`) —
mục 2 và mục 8 phía trên (viết tại thời điểm D03 chỉ xử lý trong một đơn vị) không còn đúng
100% với code hiện tại. Thay vì viết lại toàn bộ, ghi nhận phần thay đổi và các biện pháp an
toàn đi kèm tại đây:

- **Nguy cơ cần chặn:** chỉ vì trùng số điện thoại (số cũ được cấp lại, gõ nhầm số, hoặc
  trùng ngẫu nhiên giữa 2 gia đình không liên quan ở 2 đơn vị khác nhau), hệ thống có thể gán
  nhầm danh tính/tài khoản của một phụ huynh cho một học sinh không liên quan ở đơn vị khác.
- **Biện pháp:** khi số điện thoại khớp một hồ sơ `PhuHuynh` thuộc đơn vị **khác** đơn vị
  đang thao tác, service ném `CrossOrgGuardianConfirmError` kèm thông tin hồ sơ tìm thấy
  (họ tên, mã phụ huynh, tên đơn vị gốc). Frontend (`StudentDetailPage.tsx`) bắt lỗi này và
  hiện `ConfirmDialog` yêu cầu người dùng xem lại thông tin rồi xác nhận rõ ràng đây đúng là
  cùng một phụ huynh trước khi gọi lại API với `confirmCrossOrgReuse: true`. Nếu số điện thoại
  trùng **trong cùng đơn vị**, hành vi cũ (tái dùng thẳng, không cần xác nhận) được giữ
  nguyên — rủi ro thấp vì cùng một đơn vị/cùng người thao tác.
- **Audit:** ghi hành động riêng `hoc_sinh.add_guardian_cross_org` (khác
  `hoc_sinh.add_guardian` bình thường) kèm đơn vị gốc của hồ sơ được dùng chung, để tra được
  trong Nhật ký hệ thống khi cần rà soát.
- **Điểm chốt quyền thực sự nằm ở bước tạo liên kết, không phải ở đơn vị đang chọn:** bản đầu
  tiên của thay đổi này (2026-07-22, sáng) từng thêm một lớp kiểm tra thứ hai ở
  `getParentPortalOverview` — chỉ gộp những đơn vị mà tài khoản có bản ghi `NguoiDungVaiTroDonVi`
  (vai trò `phu_huynh`) đang hoạt động, thay vì tin thẳng mọi dòng `PhuHuynh` tìm theo
  `nguoiDungId`. Khi test tay với tài khoản thật (`0933873165` / "Nghia Nguyen"), lớp kiểm tra
  này chặn nhầm: vai trò `phu_huynh` của tài khoản đang gán ở **đơn vị hệ thống** (do một lần
  chuyển dữ liệu `PhuHuynh`/`HocSinh` trước đó — 2026-07-21 — không đồng thời chuyển luôn bản
  ghi phân quyền), trong khi hồ sơ `PhuHuynh` thật đã nằm ở "Trường Mầm non Hoa Nắng" — hai nơi
  lệch nhau nên bị lọc mất, dù đây là dữ liệu hợp lệ.
  Xác nhận lại với người dùng: phụ huynh **mặc định đăng nhập vào một đơn vị neo chung** (ví dụ
  đơn vị hệ thống — không mang ý nghĩa nghiệp vụ cho phụ huynh, chỉ để có một đơn vị hợp lệ cho
  phiên đăng nhập), còn **chi tiết đơn vị luôn suy ra theo con** (qua `HocSinh.donViId`/
  `HocSinhPhuHuynh`), không cần một bản ghi phân quyền `phu_huynh` riêng cho từng đơn vị con
  học. Vì vậy **bỏ hẳn** lớp kiểm tra thứ hai đó — quyền xem dữ liệu con trên Portal đi thẳng
  theo liên kết `PhuHuynh.nguoiDungId`. Điểm chốt an toàn thực sự vẫn là bước xác nhận
  `CrossOrgGuardianConfirmError` ở trên (chỉ nhân viên có `hoc_sinh.quan_ly`, sau khi xác nhận
  rõ ràng, mới tạo được liên kết học sinh-phụ huynh khác đơn vị) — đủ để đảm bảo mọi hồ sơ
  `PhuHuynh` tìm theo `nguoiDungId` đều đã được xác lập có chủ đích, không cần thêm lớp kiểm
  tra phân quyền theo đơn vị nào khác nữa.
- **Portal hiển thị thông tin chung, quản lý chi tiết theo đơn vị bên trong**: đúng 3 trường
  hợp người dùng nêu ra (nhiều con nhiều đơn vị, một con nhiều đơn vị, nhiều con một đơn vị)
  đều được xử lý bằng cùng một cơ chế — nhóm `children` theo `donVi.id`
  (`getParentPortalOverview` trả thêm `organizations: ParentPortalOrganizationGroup[]`).
  `PortalLandingPage.tsx` bỏ hẳn việc gắn thông tin đầu trang (họ tên, mã phụ huynh) với một
  đơn vị "đang chọn" cụ thể (trước đây dùng `selectedGuardian` theo `donViId` hiện tại — nay
  chỉ còn một hồ sơ đại diện dùng để hiển thị, vì các dòng `PhuHuynh` ở nhiều đơn vị đều là
  cùng một người), và hiển thị mỗi đơn vị thành một `SectionCard` riêng chứa đúng (các) con
  học ở đơn vị đó. Không thêm điều hướng "vào đơn vị này" vì vai trò `phu_huynh` hiện chưa
  được seed bất kỳ quyền nào khác ngoài Portal (`server/scripts/seedAuthFoundation.ts`) — chưa
  có trang nội bộ nào đứng vững sau khi chuyển đơn vị để dẫn tới, tránh tạo lối vào cụt.
  **Có chủ đích giữ nguyên** bước "Chọn đơn vị làm việc" sau đăng nhập (kể cả khi tài khoản
  chỉ có vai trò phụ huynh) — không đổi kiến trúc phiên đăng nhập/chọn đơn vị ở bước này, chỉ
  sửa nội dung trang Portal để không còn phụ thuộc vào đơn vị đang chọn.

Checklist D03 ở `docs/00_MASTER_CHECKLIST.md` được cập nhật để phản ánh đúng hành vi này.
