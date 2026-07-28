# Tách luồng tuyển sinh theo loại hình đào tạo + xếp lớp thuộc về học vụ

> Sửa lại quyết định thiết kế ở đợt trước (`docs/analysis/THONG_BAO_SU_KIEN.md` mục B), sau khi
> người dùng cho phản hồi nghiệp vụ thực tế và tôi đã tra cứu quy định/thực tiễn mầm non vs trung
> tâm ngoại ngữ-tin học (xem hội thoại 2026-07-27). Quyết định trước: tuyển sinh chọn lớp ngay lúc
> "xác nhận đăng ký". Quyết định đúng: **xếp lớp là việc của học vụ**, không phải tuyển sinh — và
> **mầm non không có khái niệm khách hàng tiềm năng/Lead** như trung tâm.

## 1. Vì sao đảo ngược "chọn lớp ngay lúc xác nhận đăng ký"

Người dùng chỉ rõ: tuyển sinh (hoặc tư vấn) dừng lại ở "ghi danh" — tạo hồ sơ học sinh + phụ huynh.
**Học vụ** mới là người xếp lớp, dựa trên nguyện vọng đã ghi nhận và (với trung tâm) kết quả test
đầu vào nếu chương trình yêu cầu. Vì vậy:

- `confirmLeadRegistration` (`server/services/lead.service.ts`) bỏ hẳn tham số `lopHocId` và khối
  gọi `xepHocSinhVaoLop` đã thêm ở đợt trước — quay về đúng việc tạo học sinh + gắn phụ huynh.
- Thay vào đó, copy `Lead.nhuCau` (đã có sẵn, không cần field mới) sang cột mới
  `HocSinh.nguyenVongLop` — đây chính là "nguyện vọng" học vụ dùng để xếp lớp sau.
- `LeadDetailPage.tsx` bỏ ô "Lớp học (nếu xếp ngay)" khỏi form xác nhận đăng ký.

## 2. Mầm non không có Lead — ghi danh trực tiếp

Rà soát thực tế (nguồn: mô tả công việc tư vấn tuyển sinh mầm non vs trung tâm ngoại ngữ, tra cứu
web ở lượt trước): mầm non không "nuôi" khách hàng tiềm năng qua nhiều bước chăm sóc như trung tâm
— tuyển sinh ghi nhận thẳng hồ sơ học sinh + phụ huynh trong 1 lần, theo chương trình chung (không
chọn chương trình cụ thể).

- `ghiNhanHoSoHocSinh` (`server/services/hocSinh.service.ts`) — tái dùng nguyên `createHocSinhMoi` +
  `addGuardianToStudent` (đúng 2 hàm `confirmLeadRegistration` cũng dùng), KHÔNG đụng bảng `Lead`.
- `POST /api/hoc-sinh/ghi-danh` (`server/routers/hocSinh.router.ts`) — gác bằng `tuyen_sinh.quan_ly`
  (đúng vai trò thực hiện, không phải `hoc_sinh.quan_ly`), mirror cách `confirmLeadRegistration`
  cũng tạo `HocSinh` qua quyền tuyển sinh.
- `LeadsPage.tsx` (route `/admissions`) rẽ nhánh theo
  `auth.currentOrganization.loaiHinhDaoTao === "mam_non"` (đúng pattern `DashboardPage.tsx` đã dùng
  cho chữ "trẻ"/"học viên") — mầm non thấy hẳn 1 form khác "Ghi nhận hồ sơ học sinh" (gộp học viên +
  người liên hệ trong 1 lần submit), các loại hình khác giữ nguyên luồng Lead.

## 3. Test đầu vào — cấu hình theo TỪNG chương trình, học vụ ghi khi xếp lớp

Quyết định qua hỏi đáp: cấu hình ở cấp **chương trình đào tạo**, không phải cả đơn vị — vì cùng 1
trung tâm có thể vừa dạy môn cần test trình độ (ngoại ngữ) vừa dạy môn không cần (tin học văn
phòng). Người ghi kết quả test: **học vụ**, ngay trong lúc xếp lớp — không cần thêm quyền/màn hình
riêng cho giáo viên.

- `ChuongTrinhDaoTao.coTestDauVao` (boolean, mặc định `false`) — thêm vào form tạo/sửa chương trình
  (`ClassesPage.tsx`, `ChuongTrinhDetailPage.tsx`), ẩn với mầm non (`loaiHinhDaoTao === "mam_non"`).
- `HocSinh.ketQuaTestDauVao` (text, null) — chỉ là ghi chú ngữ cảnh, không phải trạng thái/luồng
  duyệt. `PATCH /api/hoc-sinh/:id/ket-qua-test` gác bằng `lop_hoc.quan_ly` (đúng quyền học vụ đang
  có để xếp lớp, không cần quyền mới).
- Panel "Học sinh chờ xếp lớp" (`StudentsPage.tsx`) hiện thêm `nguyenVongLop` làm ngữ cảnh; khi học
  vụ chọn 1 lớp thuộc chương trình có `coTestDauVao=true`, hiện thêm ô "Kết quả test đầu vào" (tuỳ
  chọn); bấm "Xếp lớp" gọi tuần tự: lưu kết quả test (nếu có nhập) rồi mới gọi API xếp lớp sẵn có
  (`xepHocSinhVaoLopApi`) — không tạo luồng trạng thái mới, chỉ 2 lệnh gọi API nối tiếp.
- Việc "lớp nào cần test" được suy ở **client**, không phải thêm join ở server: `StudentsPage.tsx`
  tải thêm `listChuongTrinhApi()` (đã có sẵn), rồi tra `lop.chuongTrinhDaoTaoId` → chương trình
  tương ứng → `coTestDauVao`. Cân nhắc ban đầu là JOIN sẵn vào `listLopHocByDonVi`, nhưng việc đổi
  shape trả về của hàm này làm vỡ type ở nhiều nơi khác đang dùng y nguyên `LopHoc` row (seed
  script, các hàm tạo/sửa lớp khác) — tra cứu phía client đơn giản và an toàn hơn nhiều.

## 4. Cổng học vụ

Thêm quick-link "Học sinh chờ xếp lớp" + 1 stat card lấy số liệu thật
(`countHocSinhChoXepLop` → `dashboard.service.ts` → `workspaceSummary.hocSinhChoXepLop`), đúng
pattern đã làm cho Cổng quản lý đơn vị ở đợt trước — gác bằng `canViewClasses`
(`lop_hoc.xem`/`lop_hoc.quan_ly`), khớp quyền endpoint `/hoc-sinh/cho-xep-lop`.

## 5. Kiểm thử

Qua service thật (tạo rồi dọn dữ liệu):
- Trung tâm: tạo lead (có `nhuCau`) → `confirmLeadRegistration` (không kèm lớp) → xác nhận
  `HocSinh.nguyenVongLop` khớp đúng `lead.nhuCau`, học sinh vào đúng "chờ xếp lớp".
- Mầm non: gọi `ghiNhanHoSoHocSinh` trực tiếp (không tạo Lead) → học sinh + phụ huynh tạo đúng, vào
  "chờ xếp lớp".
- Tạo 2 chương trình (1 bật `coTestDauVao`, 1 tắt) → xác nhận cờ lưu đúng; xếp học sinh trung tâm ở
  trên vào lớp thuộc chương trình có test, kèm ghi `ketQuaTestDauVao = "A2 - Elementary"` → xác nhận
  lưu đúng giá trị và học sinh biến mất khỏi "chờ xếp lớp" sau khi xếp.
- `tsc --noEmit` sạch cả `tsconfig.json` và `tsconfig.server.json`; `npm test` 22/22 pass.

Chưa kiểm được bằng trình duyệt thật ở đợt này — phiên đăng nhập trong lúc làm việc trước đó đã bị
đăng xuất và không có mật khẩu để đăng nhập lại; toàn bộ xác nhận ở trên dựa trên gọi service trực
tiếp (đủ để chứng minh đúng luồng dữ liệu, nhưng chưa xác nhận trải nghiệm UI thực tế).
