# PROJECT SUMMARY — QLTruongHoc / SchoolCenter

> Tài liệu này là **append-only**: ghi thêm theo thời gian, không xóa lịch sử cũ (quy tắc
> tại `docs/TRACKING_RULE.md`). Ngày 2026-07-20 phát hiện file này đã bị các patch UI gần
> nhất (Date Picker Premium v0.2, Audit Filter Layout) ghi đè mất toàn bộ nội dung Sprint 0
> (nền tảng đa đơn vị, auth, RBAC, audit log) — vi phạm đúng quy tắc "không ghi đè bằng bản
> cũ". Đã khôi phục lại nội dung Sprint 0 bên dưới dựa trên review code thật, giữ nguyên hai
> mục patch UI đã có, và thêm mục Việc 009 cho lần sửa này.

---

## Sprint 0 — Nền tảng đa đơn vị (khôi phục 2026-07-20)

**Trạng thái:** Auth + RBAC + audit log backend/frontend đã chạy được. Còn thiếu: UI quản lý
cây đơn vị (CRUD `DonVi`), migration chính thức, test tự động.

### Database
- `DonVi` (cây đơn vị: `donViChaId`, `loaiDonVi`, `loaiHinhDaoTao`, `trangThai`).
- `NguoiDung`, `VaiTro`, `Quyen`, `VaiTroQuyen`, `NguoiDungVaiTroDonVi` — RBAC tách bảng
  quyền riêng thay vì nhồi vào enum vai trò như bản nháp SQL ban đầu.
- `PhienDangNhap` — session lưu DB (token hash SHA-256, không lưu token thô), có
  `donViHienTaiId` để nhớ đơn vị đang chọn.
- `NhatKyHeThong` — audit log, có `donViId` để cách ly theo đơn vị.
- Việc 009 (2026-07-20): thêm `NguoiDung.soLanDangNhapSaiLienTiep` và
  `NguoiDung.khoaDangNhapDenLuc` cho khóa tạm đăng nhập sai nhiều lần.
- Nguồn sự thật schema: `drizzle/schema.ts` — xem `docs/SCHEMA_SOURCE_OF_TRUTH.md`.

### Backend (`server/`)
- Đăng nhập/đăng xuất/đổi mật khẩu (`auth.service.ts`, `auth.router.ts`), cookie
  `httpOnly` + `sameSite=lax` + `secure` khi production.
- Middleware `requireAuth`, `requireCurrentOrganization`, `requirePermission` — chặn đúng
  theo đơn vị đang chọn và mã quyền (`quyen.maQuyen`), có bypass cho `he_thong.quan_tri`.
- Quản lý người dùng: tạo tài khoản, khóa/mở, reset mật khẩu, thu hồi toàn bộ phiên khi
  khóa/reset (`user.service.ts`, `user.router.ts`).
- Quản lý vai trò/quyền: `role.service.ts`, `role.router.ts` — sửa quyền của vai trò
  phạm vi hệ thống (`phamVi = "he_thong"`) bị chặn nếu người thao tác không có
  `he_thong.quan_tri`.
- Gán vai trò theo đơn vị cho người dùng (`user-assignment.service.ts`), có chặn tự xóa
  vai trò cuối cùng của chính tài khoản đang đăng nhập tại đơn vị hiện tại.
- Audit log cách ly theo đơn vị: quản trị hệ thống xem toàn bộ, người khác chỉ xem log
  của đơn vị mình (`audit-log.service.ts`).
- Việc 009 (2026-07-20): khóa tạm tài khoản 15 phút sau 5 lần đăng nhập sai liên tiếp,
  tự reset khi lock hết hạn hoặc đăng nhập đúng.

### Frontend (`client/`)
- `AuthContext`/`authApi` quản lý phiên qua cookie, tự gọi `/api/auth/me` khi mở app.
- `LoginPage`, `SelectOrganizationPage`, `ChangePasswordPage`.
- `AppShell`/`Sidebar`/`Topbar`/`OrganizationSelector` — layout dùng chung, đổi đơn vị
  ngay trên topbar không cần đăng xuất.
- `appRoutes.tsx` định nghĩa menu kèm `permissions`, lọc hiển thị theo quyền của đơn vị
  hiện tại (chỉ là lọc UX; chặn thật vẫn ở backend).
- `UserManagementPage`, `RolePermissionPage`, `SystemAuditLogPage`.

### Đã sửa ngày 2026-07-20 (rà soát bảo mật + dọn nợ kỹ thuật)
- Gỡ tài khoản/mật khẩu mặc định điền sẵn trong `LoginPage.tsx`.
- `getOrganizationsForUser` lọc thêm `donVi.trangThai = 'hoat_dong'` — đơn vị bị tạm
  ngưng/ngừng hoạt động không còn hiện ra để chọn.
- `role.service.ts` chặn sửa quyền vai trò hệ thống theo `phamVi` thay vì so khớp cứng
  một mã vai trò — tránh sót vai trò hệ thống khác thêm sau này.
- Thêm khóa tạm đăng nhập sai nhiều lần (xem Database/Backend ở trên).
- Sửa lỗi `pnpm typecheck`/`pnpm build` từng fail sẵn trước đó (không liên quan các mục
  trên, phát hiện khi verify): thiếu `createdAt`/`updatedAt` khi insert ở
  `audit.repository.ts`, `role.repository.ts`, `user-assignment.repository.ts`; sai kiểu
  `Pool` giữa `mysql2` và `mysql2/promise` trong `connection.ts`; thiếu
  `DATABASE_CONNECTION_LIMIT` trong `env.ts`; prop `action`/`actions` không khớp giữa
  `PageHeader` và `SectionCard` ở `DashboardPage.tsx`.
- Test tay: `pnpm typecheck` và `pnpm build` pass; chạy server thật, xác nhận khóa tài
  khoản đúng sau 5 lần đăng nhập sai, mở khóa lại đúng.

---

## Date Picker Premium v0.2

### DateField
- Hỗ trợ nhập tay dd/mm/yyyy.
- Hỗ trợ chọn từ calendar popup.
- Icon lịch nằm trong input.
- Popup premium giống mẫu tham chiếu.
- Điều hướng tháng trước/sau.
- Điều hướng năm trước/sau.
- Tuần hiển thị CN → T7.
- Ngày ngoài tháng hiển thị mờ.
- Ngày hiện tại có chỉ báo.
- Ngày đang chọn nền primary.
- Có Hôm nay và Xóa.
- Hỗ trợ min/max.
- Giá trị gửi API vẫn yyyy-mm-dd.

### Audit Log
- Từ ngày và Đến ngày dùng DateField mới.
- Bỏ help text thừa.
- Bộ lọc gọn hơn.

---

## Audit Filter Layout Fix

- Tách bộ lọc thành hai hàng rõ ràng.
- Hàng 1: Tìm kiếm, Hành động, Mức độ.
- Hàng 2: Từ ngày, Đến ngày, Xóa lọc, Áp dụng.
- Không còn chồng lấn control.
- Responsive tablet/mobile.

---

## Rà soát 2026-07-21 — Đối chiếu lại toàn bộ code thật, xác định bước tiếp theo

Đối chiếu trực tiếp `git log`, toàn bộ cây thư mục `server/`/`client/`/`drizzle/`, và `SHOW
TABLES` trên DB dev thật (`SchoolCenter`). Mục tiêu: xác nhận đúng cái gì đã xong, cái gì
còn dở dang, để bước tiếp theo bám sát `docs/01_EXECUTION_PLAN.md` thay vì đoán.

### Xác nhận lại: Sprint 0 vẫn đúng như mô tả ở trên

`git log` cho thấy các sửa ngày 2026-07-20 đã được commit (`f639c04`). Working tree sạch.
Không có module nghiệp vụ mới nào được thêm kể từ lần rà soát trước — cây thư mục
`server/`, `client/` không đổi ngoài các sửa đã ghi nhận.

### Phát hiện: `HocSinh` là scaffold mồ côi, chưa hoạt động được

- `drizzle/schemas/hocSinh.ts`, `server/db/hocSinh.repository.ts`,
  `server/services/hocSinh.service.ts` đã có code, nhưng:
  - **Bảng `HocSinh` chưa tồn tại trong DB thật.** `SHOW TABLES` trên `SchoolCenter` chỉ có
    8 bảng nền tảng (`DonVi`, `NguoiDung`, `VaiTro`, `Quyen`, `VaiTroQuyen`,
    `NguoiDungVaiTroDonVi`, `PhienDangNhap`, `NhatKyHeThong`) — chưa từng chạy
    `db:push`/migration cho `hocSinh`.
  - **Không có router.** `server/index.ts` và `server/routers/` không import gì liên quan
    `hocSinh` — `getHocSinhDetail()` không thể gọi được từ API nào.
  - **Không có trang frontend thật.** Route `/students` trong `App.tsx` vẫn trỏ vào
    `PlaceholderPage`, không dùng `hocSinh.service.ts`.
- Kết luận: đây là code nền chuẩn bị trước cho Sprint 1, không tính là "đã xong" — không
  gắn cờ hoàn thành cho mục D01 (Hồ sơ học sinh) trong checklist tổng.

### Phát hiện: `database/001_*.sql` → `004_*.sql` là bản nháp cũ, chưa từng áp dụng

- 4 file này định nghĩa đầy đủ `PhuHuynh`, `HocSinh`, `HocSinhPhuHuynh`, `ChuongTrinhDaoTao`,
  `GiaoVien`, `LopHoc`, `LopHocGiaoVien`, `HocSinhLopHoc`, `LichHoc`, `BuoiHoc`, `DiemDanh`,
  `DonXinPhep`, `BaoGiang`, `DanhGiaHocTap`, `DanhMucKhoanThu`, `KyThu`, `KyThuKhoanThu`,
  `KhoanPhaiThu`, `KhoanPhaiThuChiTiet`, `PhieuThu`, `PhieuThuChiTiet` — đúng mô hình dữ liệu
  trong BPD mục 8-9.
- Nhưng **chưa từng chạy** trên DB dev hiện tại (bị bỏ qua khi Sprint 0B reset về
  `005_reset_auth_foundation.sql`), và cột/kiểu dữ liệu của các file này (ví dụ không dùng
  `bigint unsigned` nhất quán, không theo style `IX_`/`UQ_` như `drizzle/schemas/core.ts`)
  không khớp quy ước đang dùng trong Drizzle.
- Theo `docs/SCHEMA_SOURCE_OF_TRUTH.md`, các file này chỉ là **tham khảo mô hình dữ liệu**,
  không phải nguồn để áp dụng nguyên trạng. Khi làm Sprint 1, phải viết lại thành
  `drizzle/schemas/*.ts` theo đúng quy ước hiện tại (mode "string" cho datetime, index
  `IX_`/`UQ_`, `donViId` bigint unsigned tham chiếu `DonVi`), rồi mới áp dụng — không chạy
  thẳng SQL cũ.

### Bảng tổng hợp tiến độ theo Sprint (đối chiếu `docs/01_EXECUTION_PLAN.md`)

| Sprint | Nội dung | Trạng thái thật |
| --- | --- | --- |
| 0 — Foundation | Đa đơn vị, user/role/quyền, audit, layout | **Xong.** CRUD cây đơn vị hoàn tất 2026-07-21 (xem mục A01 bên dưới). Còn thiếu migration chính thức (`db:generate`/`db:migrate`). |
| 1 — Tuyển sinh & ghi danh | Lead, tư vấn, đăng ký, học sinh + phụ huynh, tài khoản phụ huynh | **Chưa bắt đầu.** Chỉ có scaffold `HocSinh` mồ côi (xem trên); chưa có Lead/Consultation, chưa có `PhuHuynh`. |
| 2 — Chương trình, lớp, xếp lớp | `ChuongTrinhDaoTao`, `LopHoc`, xếp lớp | **Chưa bắt đầu.** Chỉ có trong bản nháp SQL chưa áp dụng. |
| 3 — Lịch học & điểm danh | `LichHoc`, `BuoiHoc`, `DiemDanh`, học bù | **Chưa bắt đầu.** |
| 4 — Báo giảng & tiến độ | `BaoGiang`, `DanhGiaHocTap` | **Chưa bắt đầu.** |
| 5 — Kỳ thu & học phí | `KyThu`, `KhoanPhaiThu`, `PhieuThu` | **Chưa bắt đầu.** |
| 6 — Thông báo & trao đổi | Thông báo, hội thoại phụ huynh-giáo viên | **Chưa bắt đầu.** |
| 7 — Nghiệp vụ chuyên biệt | Mầm non (đón/trả, sức khỏe), ngoại ngữ (đầu vào, kỹ năng) | **Chưa bắt đầu.** |

### Bước tiếp theo đề xuất — bám sát Sprint 1 (đúng thứ tự trong `01_EXECUTION_PLAN.md`)

Sprint 0 đã đủ nền để bắt đầu Sprint 1. Thứ tự đề xuất, theo đúng vertical-slice
(DB → Backend → Frontend → Test) đã cam kết trong `README.md`:

1. **Chuẩn hóa schema Sprint 1 trong Drizzle** — viết `drizzle/schemas/tuyenSinh.ts` (Lead,
   LeadActivity/lịch sử tư vấn) và `drizzle/schemas/hocSinh.ts` mở rộng (thêm `PhuHuynh`,
   `HocSinhPhuHuynh`, các cột còn thiếu so với bản nháp: `tenThuongGoi`, `diaChi`,
   `loaiHinhDaoTao`), theo đúng quy ước hiện tại (không copy nguyên `database/002_*.sql`).
2. **Áp dụng schema** — `pnpm db:push` từ terminal thật, hoặc ALTER/CREATE tay đánh số
   `database/010_*.sql` nếu không có TTY (xem `docs/SCHEMA_SOURCE_OF_TRUTH.md`).
3. **Nối lại `HocSinh` module** — thêm `hocSinh.router.ts`, đăng ký vào `server/index.ts`,
   thêm quyền tương ứng (`hoc_sinh.xem`/`hoc_sinh.quan_ly` đã có sẵn trong `Quyen` từ seed).
4. **Trang Học sinh thật** — thay `PlaceholderPage` ở route `/students` bằng danh sách +
   chi tiết học sinh, theo đúng nguyên tắc UX đã chốt (header 2 dòng, filter rõ).
5. **Luồng tuyển sinh tối thiểu** — Lead → tư vấn → xác nhận đăng ký → tạo học sinh + liên
   kết phụ huynh → tạo tài khoản phụ huynh (tái dùng `user.service.ts` hiện có, vai trò
   `phu_huynh` đã seed sẵn).
6. Cập nhật `docs/00_MASTER_CHECKLIST.md` mục C/D và `PROJECT_SUMMARY.md` sau mỗi bước,
   đúng quy tắc append-only.

Chưa triển khai bước nào ở trên trong lần rà soát này — đây là đề xuất thứ tự việc, chờ xác
nhận trước khi code.

---

## A01 — Quản lý cây đơn vị (2026-07-21)

Quy trình áp dụng đúng 4 bước đã thống nhất: phân tích → tài liệu phân tích chi tiết → cập
nhật BPD → code.

- Phân tích chi tiết: `docs/analysis/A01_cay_don_vi.md`.
- Cập nhật BPD: `BPD_App_Quan_Ly_Truong_Hoc_Trung_Tam_v0.1.docx` mục 18.1 (quyết định:
  chỉ `he_thong.quan_tri` được tạo/sửa/ngừng hoạt động đơn vị).
- Database: không cần migration — schema `DonVi` đã đủ trường từ Sprint 0.
- Backend: `server/db/donVi.repository.ts`, `server/services/donVi.service.ts`,
  `server/routers/donVi.router.ts` (đăng ký `/api/don-vi`), quy tắc:
  - Chặn trùng `maDonVi`.
  - Bắt buộc `loaiHinhDaoTao` khi `loaiDonVi` là `truong`/`trung_tam`.
  - Chặn tạo con dưới đơn vị cha không `hoat_dong`.
  - Chặn đổi `loaiDonVi` nếu đơn vị đã có người dùng được gán (`NguoiDungVaiTroDonVi` active).
  - Chặn ngừng hoạt động nếu còn đơn vị con đang hoạt động.
  - Chặn ngừng hoạt động node `SYSTEM` gốc trong mọi trường hợp.
  - Ghi `NhatKyHeThong` cho mọi create/update/đổi trạng thái.
- Frontend: trang `/organizations` (`OrganizationTreePage.tsx`), thêm vào menu Hệ thống
  (`appRoutes.tsx`), form tạo/sửa dùng chung, `ConfirmDialog` cho đổi trạng thái.
- Test tay (dùng tài khoản smoke-test tạo riêng, đã xoá sạch sau khi test, không đụng dữ
  liệu seed thật ngoại trừ TTNN-Q8 bị deactivate tạm để test rồi kích hoạt lại đúng):
  - Tạo đơn vị con dưới TTNN-Q8 — PASS.
  - Sửa tên/địa chỉ có dấu tiếng Việt, xác nhận lưu đúng UTF-8 trong DB — PASS.
  - Ngừng hoạt động đơn vị còn con đang hoạt động → bị chặn — PASS.
  - Ngừng hoạt động sau khi con đã ngừng hoạt động → thành công — PASS.
  - Ngừng hoạt động node `SYSTEM` → luôn bị chặn — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
- Chưa test: `don_vi.quan_ly` (không phải `he_thong.quan_tri`) bị từ chối 403 khi gọi
  create/update/status — chưa có tài khoản test phù hợp trong lần này, cần test khi có
  tài khoản `quan_ly_don_vi` thật.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục A01 đã tick.

---

## Kiến trúc menu theo quyền và loại hình đào tạo (2026-07-21)

Người dùng rà soát lại yêu cầu ban đầu, xác nhận 2 điểm đã đúng (system admin thấy toàn bộ
đơn vị; phân quyền + bắt buộc chọn đơn vị khi đăng nhập) và chỉ ra 1 điểm chưa có: menu phải
khác nhau theo loại hình đào tạo của đơn vị. Áp dụng đúng 4 bước.

- Phân tích chi tiết: `docs/analysis/menu_theo_quyen_va_loai_hinh.md`.
- Cập nhật BPD: mục 18.2 — chốt quyết định lọc menu theo loại hình áp dụng cho mọi người
  dùng kể cả system admin; không lọc menu theo tên vai trò cứng (giữ nguyên lọc theo quyền).
- Database: không đổi.
- Code:
  - `client/src/routes/appRoutes.tsx`: thêm type `LoaiHinhDaoTao` và trường tuỳ chọn
    `loaiHinhDaoTao?: LoaiHinhDaoTao[]` trên `AppRouteDefinition`. Không khai báo = dùng
    chung mọi loại hình.
  - `client/src/components/layout/Sidebar.tsx`: điều kiện hiển thị menu = có quyền **và**
    đúng loại hình (`route.loaiHinhDaoTao` trống hoặc chứa loại hình của đơn vị đang chọn).
- Hiện chưa có mục menu nào thật sự gán `loaiHinhDaoTao` (Sprint 0-1 toàn bộ là nghiệp vụ
  dùng chung) — đây là thay đổi chuẩn bị cơ chế, không đổi hành vi hiện tại. `pnpm
  typecheck`/`pnpm build` PASS. Sẽ test runtime thật khi Sprint 7 thêm menu chuyên biệt đầu
  tiên (ví dụ "Đón/trả trẻ" chỉ cho `mam_non`).
- Checklist: `docs/UI_SHELL_CHECKLIST.md` mục "Menu theo loại hình đào tạo" đã tick.

---

## D01/D03 — Hồ sơ học sinh và phụ huynh (2026-07-21)

Bước đầu tiên của Sprint 1, đúng 4 bước đã thống nhất. Phạm vi: chỉ hồ sơ học sinh + phụ
huynh + liên kết — **chưa** gồm tài khoản đăng nhập phụ huynh (C07) và **chưa** gồm luồng
Lead/tuyển sinh (C01-C06), để lại làm bước riêng tiếp theo.

- Phân tích chi tiết: `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`.
- Cập nhật BPD: mục 18.3 — chốt mã học sinh tự sinh (không nhập tay), phụ huynh tái sử
  dụng theo số điện thoại trong cùng đơn vị (không tạo trùng), một liên hệ chính tại một
  thời điểm, không xoá được liên kết cuối cùng hoặc liên hệ chính khi còn phụ huynh khác.
- Database (`database/010_add_hoc_sinh_phu_huynh.sql`, áp dụng trực tiếp vì chưa có TTY
  cho `db:push`): tạo `HocSinh` (trước đó chỉ là scaffold code, bảng thật chưa từng tồn
  tại), `PhuHuynh`, `HocSinhPhuHuynh`. Đồng bộ `drizzle/schemas/hocSinh.ts` khớp đúng.
- Backend: viết lại `server/db/hocSinh.repository.ts` (trước đó chỉ có
  `findHocSinhById`), thêm `server/db/phuHuynh.repository.ts`,
  `server/services/hocSinh.service.ts`, `server/services/phuHuynh.service.ts`,
  `server/routers/hocSinh.router.ts` (đăng ký `/api/hoc-sinh` — nối lại scaffold mồ côi từ
  lần rà soát trước). Quy tắc:
  - Mã học sinh tự sinh `HS<năm><4 số>`, mã phụ huynh `PH<6 số>`.
  - Thêm phụ huynh: dò theo `(donViId, dienThoai)` trước, tái sử dụng nếu đã có, chỉ tạo
    mới khi chưa có và có họ tên.
  - Đặt liên hệ chính mới tự bỏ đánh dấu liên hệ chính cũ.
  - Chặn gỡ liên kết cuối cùng của học sinh.
  - Chặn gỡ liên kết đang là liên hệ chính khi còn phụ huynh khác (yêu cầu chỉ định lại
    trước).
  - Ghi `NhatKyHeThong` cho create/update/đổi trạng thái/thêm-sửa-gỡ phụ huynh.
- Frontend: `client/src/pages/StudentsPage.tsx` (`/students`, danh sách + tạo mới),
  `client/src/pages/StudentDetailPage.tsx` (`/students/:id`, sửa hồ sơ, đổi trạng thái,
  quản lý phụ huynh) thay `PlaceholderPage`.
- Test tay (2 tài khoản smoke-test riêng tại TTNN-Q8 — vai trò `hoc_vu` và `tuyen_sinh`,
  đã xoá sạch tài khoản + dữ liệu test sau khi xong):
  - `tuyen_sinh` (không có `hoc_sinh.quan_ly`) gọi tạo học sinh → 403 — PASS.
  - Tạo học sinh, mã tự sinh `HS20260001` — PASS.
  - Thêm phụ huynh mới (số điện thoại chưa có) → tạo `PhuHuynh` mới — PASS.
  - Thêm phụ huynh cho học sinh khác với số điện thoại trùng phụ huynh đã có trong đơn vị
    → tái sử dụng đúng, không tạo trùng — PASS.
  - Đặt liên hệ chính mới → liên hệ chính cũ tự bỏ đánh dấu — PASS.
  - Gỡ liên kết không phải liên hệ chính khi còn liên kết khác → thành công — PASS.
  - Gỡ liên kết cuối cùng của học sinh → bị chặn — PASS.
  - Gỡ liên kết đang là liên hệ chính khi còn phụ huynh khác → bị chặn — PASS.
  - `tuyen_sinh` gọi xoá liên kết → 403 — PASS.
  - Tiếng Việt có dấu lưu đúng UTF-8 qua toàn luồng — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục D01, D03, D04 đã tick. D02 (sức khỏe mầm
  non), D05/D06 (lịch sử học tập, chuyển lớp — phụ thuộc Sprint 2 lớp học) để lại sau.
