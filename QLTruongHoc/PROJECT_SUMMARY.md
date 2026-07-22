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

---

## C01/C02/C03/C06 — Lead và chuyển đổi thành học sinh (2026-07-21)

Bước thứ hai của Sprint 1, xây trên nền D01/D03. Phạm vi: Lead, lịch sử chăm sóc, xác nhận
đăng ký. **Chưa** gồm C05 (kiểm tra đầu vào ngoại ngữ — Sprint 7) và C07 (tài khoản đăng
nhập phụ huynh — bước tiếp theo).

- Phân tích chi tiết: `docs/analysis/C01_C03_C06_lead_tuyen_sinh.md`.
- Cập nhật BPD: mục 18.4 — chốt lead không tự động thành học sinh (chỉ qua "Xác nhận đăng
  ký"), một lead chỉ chuyển đổi đúng một lần, lịch sử chăm sóc append-only, và **cấp thêm
  quyền `tuyen_sinh.quan_ly` cho vai trò `tu_van`** (trước đó chỉ có `tuyen_sinh.xem`, không
  đủ để ghi nhận hoạt động chăm sóc theo đúng mô tả nghiệp vụ của vai trò này).
- Database (`database/011_add_lead_tuyen_sinh.sql`): tạo `Lead`, `LeadHoatDong`. Lưu ý
  `Lead` là từ khoá dành riêng của MySQL (hàm cửa sổ `LEAD()`), phải escape bằng backtick
  trong SQL tay — Drizzle tự làm việc này nên `drizzle/schemas/tuyenSinh.ts` không cần lưu
  ý gì thêm.
- Backend: `server/db/lead.repository.ts`, `server/services/lead.service.ts` (gọi lại
  `createHocSinhMoi` và `addGuardianToStudent` từ D01/D03 khi xác nhận đăng ký — không viết
  lại logic tạo học sinh/phụ huynh), `server/routers/lead.router.ts` (đăng ký `/api/leads`).
  Quy tắc:
  - Mã lead tự sinh `LD<năm><4 số>`.
  - Ghi hoạt động có thể kèm đổi trạng thái, nhưng chặn nhảy thẳng sang `da_dang_ky`.
  - Đánh dấu không tiếp tục bắt buộc lý do; có thể mở lại về `dang_cham_soc`.
  - Không sửa được thông tin lead đã `da_dang_ky`.
  - Xác nhận đăng ký chặn nếu lead đã `da_dang_ky` hoặc đang `khong_tiep_tuc`.
- Frontend: `client/src/pages/LeadsPage.tsx` (`/admissions`, danh sách + tiếp nhận),
  `client/src/pages/LeadDetailPage.tsx` (`/admissions/:id`, sửa thông tin, ghi hoạt động,
  không tiếp tục/mở lại, xác nhận đăng ký) thay `PlaceholderPage`. Gộp 2 mục menu cũ "Hồ sơ
  tuyển sinh" và "Tư vấn tuyển sinh" thành một mục "Tuyển sinh" duy nhất (`appRoutes.tsx`)
  vì cả hai dùng chung một trang chi tiết lead, tránh menu rối.
- Test tay (2 tài khoản smoke-test tại TTNN-Q8 — vai trò `tu_van` và `giao_vien`, đã xoá
  sạch dữ liệu + tài khoản sau khi xong):
  - `giao_vien` (không có quyền tuyển sinh) tạo lead → 403 — PASS.
  - Tạo lead, mã tự sinh `LD20260001` — PASS.
  - Ghi hoạt động kèm đổi trạng thái → trạng thái lead cập nhật đúng — PASS.
  - Ghi hoạt động cố chuyển thẳng sang `da_dang_ky` → bị chặn — PASS.
  - Đánh dấu không tiếp tục thiếu lý do → bị chặn — PASS.
  - Xác nhận đăng ký → tạo đúng học sinh mới, `Lead.hocSinhId` trỏ đúng — PASS.
  - Xác nhận đăng ký lần 2 cho lead đã đăng ký → bị chặn — PASS.
  - Sửa thông tin lead đã khoá → bị chặn — PASS.
  - Lead thứ 2 cùng số điện thoại với lead đã đăng ký → xác nhận đăng ký tái sử dụng đúng
    một phụ huynh cho cả hai con, không tạo trùng — PASS (regression D03).
  - Đánh dấu không tiếp tục → chặn xác nhận đăng ký khi đang đóng → mở lại thành công —
    PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục C01, C02, C03, C04, C06 đã tick. C05 (Sprint
  7), C07 (bước tiếp theo) để lại sau.

---

## C07 — Tài khoản đăng nhập phụ huynh (2026-07-21)

Bước cuối Sprint 1. Phạm vi và quyết định: xem `docs/analysis/C07_tai_khoan_phu_huynh.md`
và BPD mục 18.5.

- Backend: `server/middleware/permission.middleware.ts` thêm `requireAnyPermission` (chấp
  nhận một trong nhiều mã quyền — dùng thay vì tiếp tục cấp chéo quyền cho từng vai trò).
  `server/db/role.repository.ts` thêm `findRoleByCode`. `server/db/phuHuynh.repository.ts`
  thêm `updatePhuHuynhNguoiDungId`. `server/services/phuHuynh.service.ts` thêm
  `createGuardianAccount` — tái sử dụng `createUserWithRole` (đã có từ Sprint 0) và
  `createTemporaryPassword` (export từ `user.service.ts` để dùng chung, không viết lại).
  Route mới `POST /api/hoc-sinh/:id/phu-huynh/:linkId/tai-khoan` với
  `requireAnyPermission(["hoc_sinh.quan_ly", "tuyen_sinh.quan_ly"])`.
- Frontend: nút "Tạo tài khoản đăng nhập" trong bảng phụ huynh ở `StudentDetailPage.tsx`,
  thêm cột "Tài khoản" hiển thị đã có/chưa có; ẩn nút nếu phụ huynh đã có tài khoản.
- Test tay qua API (tài khoản smoke-test tại TTNN-Q8, vai trò `hoc_vu`/`tu_van`/`giao_vien`):
  - Tạo tài khoản mới cho phụ huynh chưa có — tên đăng nhập sinh từ SĐT, đăng nhập thử
    bằng tài khoản vừa tạo thành công thật — PASS.
  - Gọi lại cho cùng phụ huynh qua liên kết của con thứ hai — nhận diện đã có tài khoản,
    không tạo trùng, trả đúng tên đăng nhập cũ — PASS.
  - `giao_vien` (không đủ quyền) gọi tạo tài khoản → 403 — PASS.
  - `tu_van` (chỉ có `tuyen_sinh.quan_ly`, không có `hoc_sinh.quan_ly`) vẫn tạo được tài
    khoản — xác nhận `requireAnyPermission` hoạt động đúng — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
  - **Chưa test**: xác nhận trực quan nút trên giao diện thật qua trình duyệt (mới test
    qua gọi thẳng API).
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục C07 đã tick (phần backend/API).

### Sự cố dữ liệu trong lúc test C07 (2026-07-21) — bài học quan trọng

Trong lúc test, phát hiện người dùng thật đã đăng nhập tài khoản `admin` qua giao diện
thật và thao tác song song trên cùng CSDL dev trong khi dev server đang chạy để phục vụ
test bằng curl. Các lệnh dọn dữ liệu smoke-test sau mỗi vòng test (`DELETE FROM <bảng>`
không lọc theo phạm vi) đã xoá nhầm dữ liệu thật: học sinh "Trần Hữu Án" + phụ huynh "Paul
Nguyen" (mất trong đợt dọn D01/D03), học sinh "Trần Văn An" + phụ huynh "Trần Linh Hoàn"
(mất trong đợt dọn C01-C06), và phụ huynh "Nguyen Nghia" liên kết với học sinh "Nguyen
Khang" (mất trong đợt dọn C07 — học sinh này còn sống sót nhờ ràng buộc khoá ngoại chặn
kịp). Không có backup dùng được (bản backup duy nhất có trước khi các bản ghi này tồn
tại). Không khôi phục được số điện thoại/email gốc vì audit log chỉ ghi tên.

Quy tắc bắt buộc từ nay: **không bao giờ chạy `DELETE FROM <bảng>` không lọc theo ID cụ
thể để dọn dữ liệu test trên CSDL dev này** — luôn theo dõi đúng ID đã tạo trong phiên test
và chỉ xoá đúng ID đó; nếu nghi ngờ có hoạt động thật xen lẫn, đối chiếu `NhatKyHeThong`
theo `nguoiDungId` trước khi xoá bất cứ gì.

### Đổi mật khẩu tạm sang giá trị cố định (2026-07-21)

Theo yêu cầu người dùng, `createTemporaryPassword()` trong `server/services/user.service.ts`
đổi từ sinh ngẫu nhiên sang giá trị cố định `Edu@123Qaz`, áp dụng cho mọi luồng tạo/reset
tài khoản (nhân viên và phụ huynh). Vẫn giữ `batBuocDoiMatKhau = true` bắt buộc đổi ngay
lần đăng nhập đầu — xem BPD mục 18.6. `pnpm typecheck` PASS. Chưa test runtime lại (đang
chờ xác nhận an toàn cổng server với người dùng sau sự cố ở trên).

---

## Chuẩn hoá popup — Thông báo và Xác nhận (2026-07-21)

Người dùng phản hồi popup "Gỡ liên kết phụ huynh" hiển thị thô (không overlay, không card
nổi rõ) — rà soát phát hiện `ConfirmDialog` được viết từ Sprint 0 nhưng **chưa từng có CSS
thật**, chỉ dựa vào style mặc định trình duyệt. Không có patch UI riêng nào trước đó phủ
được gap này.

- Tạo `client/src/styles/dialog.css` — overlay mờ tối, card nổi bo góc, dùng đúng token từ
  `theme.css` (không hard-code màu/shadow).
- Viết lại `ConfirmDialog.tsx` (xác nhận, 2 hành động): thêm `autoFocus` vào nút Từ chối
  (mặc định an toàn khi lỡ nhấn Enter), nút chấp nhận đổi màu cảnh báo khi `danger`. Giữ
  nguyên toàn bộ props hiện có (`onConfirm`/`onCancel`/`confirmLabel`) để không phải sửa 4
  nơi đang gọi (`OrganizationTreePage`, `UserManagementPage`, `StudentDetailPage`,
  `LeadDetailPage`).
- Tạo mới `NotificationDialog.tsx` (thông báo, 1 hành động đóng) — chuẩn bị sẵn cho các
  luồng chỉ cần xác nhận đã đọc (ví dụ hiển thị mật khẩu tạm sau khi tạo tài khoản), chưa
  có nơi dùng ngay.
- Cập nhật `docs/DESIGN_SYSTEM_RULES.md` thêm mục "Popup / Modal" làm chuẩn chính thức,
  cấm tự viết modal riêng trong page và cấm dùng `alert()`/`confirm()` trình duyệt.
- `pnpm typecheck`, `pnpm build` PASS. Chưa test trực quan trên trình duyệt (người dùng
  đang thao tác trực tiếp trên server thật cùng lúc — xem sự cố dữ liệu ở mục C07 phía
  trên; tránh khởi động thêm server song song để không lặp lại rủi ro).

### Hotfix — Lỗi bị che sau overlay modal (2026-07-21)

Người dùng test thật: bấm "Gỡ liên kết" trong modal mới không thấy phản hồi gì, tưởng
chưa gọi backend. Nguyên nhân: `ConfirmDialog` mới có overlay phủ toàn màn hình
(`position: fixed; inset: 0; z-index: 1000`), nhưng khi hành động thất bại (ví dụ đúng quy
tắc D03 "không gỡ được liên hệ chính duy nhất"), lỗi vẫn hiện ở banner `.form-error` đầu
trang — nằm **dưới** overlay nên bị che hoàn toàn, modal vẫn mở như không có gì xảy ra.

- Thêm prop `error?: string` vào `ConfirmDialog` — hiện ngay trong modal (`.dialog-card__error`,
  nền đỏ nhạt) thay vì phụ thuộc banner đầu trang.
- Nối `error` vào cả 4 nơi dùng `ConfirmDialog` (`StudentDetailPage`, `OrganizationTreePage`,
  `UserManagementPage`, `LeadDetailPage`); xoá `error` cũ ngay khi mở dialog để không hiện
  nhầm lỗi của thao tác trước đó.
- `pnpm typecheck`, `pnpm build` PASS.

---

## I01 — Thông báo nội bộ (2026-07-22)

Chọn lát cắt nhỏ nhưng có giá trị thực để mở Sprint 6: thông báo nội bộ theo đơn vị. Phạm vi hiện tại là tạo và xem thông báo với 3 mức `toan_truong` / `theo_lop` / `ca_nhan`; chưa làm đính kèm, xác nhận đã đọc hay trao đổi hai chiều.

- Database: thêm bảng `ThongBao` trong `drizzle/schemas/thongBao.ts`, có mã tự sinh theo năm, phạm vi, đối tượng áp dụng và người tạo.
- Backend: `server/db/thongBao.repository.ts`, `server/services/thongBao.service.ts`, `server/routers/thongBao.router.ts`, đăng ký tại `server/index.ts`.
- Frontend: trang `/thong-bao`, feature API/types riêng trong `client/src/features/thongBao/`, thêm vào menu và sidebar.
- Quy ước hiển thị: đơn vị hệ thống xem gộp thông báo của các đơn vị đang hoạt động; đơn vị thường tạo/xem trong đơn vị hiện tại.
- Test đã chạy: `pnpm typecheck`, `pnpm build`.
- Còn lại: I02 đính kèm, I03 xác nhận đã đọc, I04 trao đổi phụ huynh–giáo viên, I05 kiểm soát phạm vi và lưu lịch sử chi tiết hơn.

## I02 — Đính kèm tài liệu / hình ảnh (2026-07-22)

Để giữ slice nhỏ và tránh mở hệ thống upload riêng, I02 được triển khai bằng một slot đính kèm duy nhất gắn trên thông báo nội bộ.

- Database: thêm 2 cột `tepDinhKemTen` và `tepDinhKemUrl` vào `ThongBao`.
- Backend: `server/services/thongBao.service.ts` chấp nhận đính kèm nếu có đủ tên và liên kết; `server/db/thongBao.repository.ts` lưu metadata này cùng thông báo.
- Frontend: form tạo thông báo thêm 2 ô nhập đính kèm; danh sách hiển thị link mở tệp đính kèm trực tiếp.
- Giới hạn hiện tại: chưa có upload file thật hay đa tệp; đây là phiên bản tối thiểu để hoàn thành checklist I02 trước.
- Kiểm tra: `pnpm build` sẽ được chạy sau khi áp migration để xác nhận không vỡ biên dịch.

## I03 — Xác nhận đã đọc (2026-07-22)

Triển khai xác nhận đã đọc theo đúng nghĩa per-user, không dùng cột trạng thái chung trên `ThongBao`.

- Database: thêm bảng `ThongBaoDaDoc` với khóa duy nhất `(thongBaoId, nguoiDungId)`.
- Backend: list thông báo trả kèm `daDocAt` theo người dùng hiện tại; thêm route `POST /api/thong-bao/:id/da-doc` để lưu dấu xác nhận đọc.
- Frontend: trang `/thong-bao` hiển thị badge `Đã đọc` / `Chưa đọc` và nút `Xác nhận đã đọc` trên từng dòng.
- Audit: ghi `thong_bao.mark_read` vào `NhatKyHeThong` khi người dùng xác nhận.
- Kiểm tra: sẽ chạy `pnpm typecheck` và `pnpm build` sau khi áp migration DB mới.

## I04 — Trao đổi phụ huynh – giáo viên (2026-07-22)

Triển khai một sổ trao đổi tối thiểu theo học sinh/lớp, bám vào khung sườn có sẵn của hệ thống.

- Database: thêm bảng `TraoDoiHocSinh` để ghi log trao đổi theo học sinh, lớp, kênh liên lạc và vai trò người ghi.
- Backend: thêm API `/api/trao-doi` để liệt kê và tạo trao đổi; đơn vị hệ thống xem gộp đơn vị đang hoạt động, có kèm đơn vị sở hữu.
- Frontend: trang `/communications` có bộ lọc học sinh/lớp, form ghi trao đổi, và bảng lịch sử kèm liên kết sang hồ sơ học sinh/lớp.
- Audit: ghi `trao_doi.create` vào `NhatKyHeThong` khi người dùng tạo trao đổi mới.
- Kiểm tra: đã chạy `pnpm typecheck`, `pnpm build`, và áp migration DB dev.

---

## E01-E04 — Chương trình, giáo viên, lớp học, xếp lớp (2026-07-21)

Mở đầu Sprint 2, đúng 4 bước. Phạm vi: chương trình đào tạo, hồ sơ giáo viên, lớp học, xếp
học sinh vào lớp, phân công giáo viên. **Chưa** gồm lịch học/buổi học/kiểm tra xung đột/nghỉ
và học bù (E05-E08 — bước riêng tiếp theo).

- Phân tích chi tiết: `docs/analysis/E01_E04_chuong_trinh_lop_hoc.md`.
- Cập nhật BPD: mục 18.7 — dùng vai trò `hoc_vu` đã seed sẵn (không tạo vai trò "Quản lý
  chuyên môn" riêng); mã chương trình/lớp cho nhân viên tự đặt (khác mã học sinh/phụ
  huynh/lead tự sinh); không làm cơ chế tạo tài khoản riêng cho giáo viên (dùng chung Quản
  lý người dùng); chặn vượt sĩ số cứng (chưa làm phê duyệt vượt sĩ số); học sinh xếp được
  nhiều lớp cùng lúc; chuyển lớp giữ lịch sử, không ghi đè.
- Database (`database/012_add_chuong_trinh_lop_hoc.sql`): tạo `ChuongTrinhDaoTao`,
  `GiaoVien`, `LopHoc`, `LopHocGiaoVien`, `HocSinhLopHoc`. Đồng bộ
  `drizzle/schemas/lopHoc.ts`.
- Backend: `chuongTrinh.repository/service/router` (`/api/chuong-trinh`),
  `giaoVien.repository/service/router` (`/api/giao-vien`),
  `lopHoc.repository/service/router` (`/api/lop-hoc`, gồm cả phân công giáo viên và
  xếp/chuyển/kết thúc học sinh trong lớp). Quy tắc chính:
  - Không cho tạo lớp/chương trình trùng mã trong đơn vị.
  - Không cho vượt sĩ số tối đa của lớp.
  - Không xếp lớp học sinh đang `ngung_hoc`/`hoan_thanh`, hoặc ngày vào lớp trước ngày
    nhập học.
  - Không cho hai giáo viên chính cùng hoạt động một lúc cho một lớp.
  - Chuyển lớp = đóng enrollment cũ (`chuyen_lop`) + tạo enrollment mới, không ghi đè.
- Frontend: `TeachersPage.tsx` (`/teachers`), `ClassesPage.tsx` (`/classes`, gồm section
  Chương trình đào tạo), `ClassDetailPage.tsx` (`/classes/:id` — sửa lớp, đổi trạng thái,
  phân công/kết thúc giáo viên, xếp/chuyển/kết thúc học sinh) thay `PlaceholderPage`.
- Test tay qua API (dùng chung server thật đang chạy — không khởi động server riêng, theo
  dõi chính xác từng ID tạo ra để chỉ xoá đúng ID đó khi dọn dẹp, đúng bài học từ sự cố
  C07):
  - Tạo chương trình, 2 giáo viên, 2 lớp (một lớp sĩ số tối đa = 1), 2 học sinh — PASS.
  - Phân công giáo viên chính; phân công giáo viên chính thứ hai cho cùng lớp → bị chặn —
    PASS.
  - Xếp học sinh đủ sĩ số tối đa; xếp học sinh tiếp theo → bị chặn "đã đủ sĩ số" — PASS.
  - Xếp học sinh đó vào lớp khác không giới hạn sĩ số → thành công — PASS.
  - Chuyển lớp: enrollment cũ đóng đúng (`chuyen_lop`), enrollment mới tạo riêng, lịch sử
    giữ nguyên — PASS.
  - Kết thúc xếp lớp (`hoan_thanh`), kết thúc phân công giáo viên — PASS.
  - Đổi học sinh sang `ngung_hoc` rồi thử xếp lớp → bị chặn — PASS.
  - `ke_toan` (không có `lop_hoc.*`) gọi tạo lớp → 403 — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
  - Dọn dẹp: xoá đúng ID vừa tạo; trong lúc kiểm tra phát hiện thêm rác test sót lại từ
    vòng C07 trước sự cố (2 học sinh mồ côi "Lê Minh Khôi"/"Lê Minh Anh" + tài khoản phụ
    huynh test liên quan, chưa kịp dọn vì dừng đột ngột khi phát hiện sự cố) — đã xác nhận
    kỹ qua `NhatKyHeThong` (không có liên kết tới dữ liệu thật của người dùng) và xoá theo
    đúng ID. Dữ liệu thật của người dùng ("Nguyen Khang", lead "Nguyen Nghia") xác nhận
    còn nguyên vẹn sau khi dọn.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục E01-E04, B03, B06 đã tick.

---

## Dữ liệu mẫu cơ bản (2026-07-21)

Theo yêu cầu người dùng, tạo `server/scripts/seedSampleData.ts` (`pnpm db:seed:sample`) để
seed dữ liệu mẫu cho toàn bộ chức năng đã làm tới Sprint 2. Gọi thẳng qua service layer
(không insert thô) nên đi qua đủ validate + audit log như luồng thật; kết nối DB trực tiếp,
không qua HTTP server nên không xung đột với server người dùng đang chạy song song. Có
guard idempotent (kiểm tra chương trình `IELTS-CB` đã tồn tại thì bỏ qua toàn bộ, không tạo
trùng nếu chạy lại).

Dữ liệu tạo ra — **Trung tâm Ngoại ngữ Quận 8**: 2 chương trình (IELTS Cơ bản, Giao tiếp cơ
bản), 2 giáo viên, 2 lớp (mỗi lớp có giáo viên chính), 3 học sinh (2 con chung một phụ
huynh để minh hoạ tái sử dụng theo số điện thoại — D03), đã xếp lớp đầy đủ, 2 lead chưa
chuyển đổi (một lead có lịch sử chăm sóc). **Trường Mầm non Hoa Nắng**: 1 chương trình, 1
giáo viên (chủ nhiệm), 1 lớp, 2 học sinh + phụ huynh, đã xếp lớp — minh hoạ đa đơn vị/đa
loại hình đào tạo hoạt động đúng song song.

4 tài khoản demo theo vai trò tại TTNN-Q8 (`demo_tuyensinh`, `demo_hocvu`, `demo_ketoan`,
`demo_giaovien`), mật khẩu tạm cố định `Edu@123Qaz`, bắt buộc đổi lần đầu — để người dùng
đăng nhập thử đúng góc nhìn từng vai trò.

Đã verify qua DB sau khi chạy: toàn bộ mã tự sinh không trùng với dữ liệu thật hiện có
("Nguyen Khang", lead "Nguyen Nghia" — vẫn nguyên vẹn), phụ huynh "Phạm Văn Long" đúng liên
kết 2 con. `pnpm typecheck`, `pnpm build` PASS.

---

## Sửa lỗi A04/A05 — Quản trị hệ thống không thấy hết đơn vị (2026-07-21)

Người dùng phản ánh: quản trị hệ thống không thấy được dữ liệu của tất cả đơn vị, và không
gán được vai trò cho người dùng khác vào đơn vị mà chính admin chưa từng có mặt. Rà lại thì
đúng là lỗi thật, không phải yêu cầu mới — A04/A05 vốn đã tick `[x]` nhưng có lỗi che giấu.

**Nguyên nhân gốc:** `getOrganizationsForUser` (`server/db/auth.repository.ts`) chỉ trả về
đơn vị mà chính người dùng có dòng gán tường minh trong `NguoiDungVaiTroDonVi`, kể cả với
`he_thong.quan_tri`. Hàm này quyết định: danh sách đơn vị sau đăng nhập/khi đổi đơn vị,
dropdown "Đơn vị" khi gán vai trò cho người khác, và cờ `isSystemAdmin` ở mọi middleware
(vì cờ này đọc từ `quyen` của đúng đơn vị đang đứng, không phải quyền toàn cục).

**Sửa:** nếu người dùng có `he_thong.quan_tri` ở bất kỳ dòng gán nào, hàm trả về **toàn bộ
đơn vị đang hoạt động** trong hệ thống, và luôn cấp `he_thong.quan_tri` vào `quyen` của từng
đơn vị đó — để không mất quyền khi chuyển sang đơn vị chưa có dòng gán thật. Vai trò khác
giữ nguyên hành vi cũ (chỉ thấy/gán được trong đúng đơn vị đã được phân công).

Test tay qua trình duyệt: tài khoản `admin` (vốn chỉ gán tại `SYSTEM`) trước đó chỉ thấy 1
đơn vị, sau khi sửa thấy đủ 3 đơn vị hoạt động; chuyển sang đơn vị chưa từng có dòng gán vẫn
vào được, xem đúng dữ liệu, không bị 403; dropdown gán vai trò liệt kê đủ cả 3 đơn vị — PASS.

## Sửa lỗi dữ liệu không tự tải lại khi đổi đơn vị (2026-07-21)

Người dùng phản ánh: các trang Học sinh, Giáo viên, Lớp học... không tự cập nhật khi đổi
đơn vị ở Topbar mà không rời trang. Nguyên nhân: các trang dùng
`useEffect(() => { loadData() }, [])` — mảng phụ thuộc rỗng nên chỉ chạy đúng 1 lần lúc
mount, đổi đơn vị không làm component mount lại nên không gọi lại API.

Sửa bằng cách thêm `auth?.currentOrganization?.id` vào dependency của effect tải dữ liệu ở:
`StudentsPage`, `TeachersPage`, `ClassesPage`, `LeadsPage`, `UserManagementPage`,
`SystemAuditLogPage` (danh sách), và `StudentDetailPage`, `ClassDetailPage`,
`LeadDetailPage` (chi tiết — tránh giữ dữ liệu đơn vị cũ khi đổi đơn vị giữa lúc đang xem
chi tiết). Menu không cần sửa vì đã đọc thẳng từ context, tự động đúng từ trước.

Test tay: đổi đơn vị ngay trên trang Học sinh/Giáo viên (không rời trang) → danh sách cập
nhật đúng đơn vị mới ngay lập tức — PASS.

## Làm lại giao diện sidebar (2026-07-21)

Theo yêu cầu người dùng ("chuyên nghiệp, rõ ràng, trực quan"): thay 13 icon Unicode rời rạc
bằng bộ icon SVG outline đồng nhất (`client/src/components/layout/sidebarIcons.tsx`, khoá
theo `route.id`); sửa lỗi mục menu đang chọn không nổi bật (tên class CSS bị lệch giữa
`styles.css` và `sidebar-balance.css` — cascade không bao giờ áp dụng); đổi màu sidebar từ
xanh navy đậm sang xanh dương kế thừa trực tiếp `--edu-color-primary`/`-primary-strong` của
theme (không bịa màu mới); gom các chỗ CSS hard-code màu trùng lặp (viền header, tiêu đề
nhóm menu) về đúng biến theme để cấu hình một chỗ. Đã verify qua devtools (computed style
đúng thiết kế, không lỗi console), `tsc` PASS.

---

## E05-E08 — Lịch học lặp lại và thời khóa biểu (2026-07-21)

Tiếp Sprint 2 (sau E01-E04), đúng 4 bước. Phạm vi: quy tắc lịch học lặp lại theo tuần cho
lớp, sinh buổi học cụ thể, kiểm tra trùng giáo viên/phòng/lớp, đánh dấu nghỉ và tạo buổi học
bù, xem thời khóa biểu theo lớp/giáo viên. **Chưa** gồm điểm danh (F) hay báo giảng (G) —
buổi học ở bước này chỉ là khung thời gian.

- Phân tích chi tiết: `docs/analysis/E05_E08_lich_hoc.md`.
- Cập nhật BPD: mục 18.8 — tách 2 tầng dữ liệu (`LichHoc` quy tắc, `BuoiHoc` buổi cụ thể,
  không ghi đè, có lịch sử); tách hành động lưu quy tắc và sinh buổi thành hai bước để
  người dùng chủ động kiểm soát sinh đến ngày nào; chặn cứng toàn bộ khi trùng phòng/giáo
  viên (không sinh nửa vời); buổi đã `da_hoc` không sửa được qua màn lịch học nữa (thuộc
  F/G); tái sử dụng quyền `lop_hoc.xem`/`lop_hoc.quan_ly`, không tạo quyền mới.
- Database (`database/013_add_lich_hoc.sql`): tạo `LichHoc`, `BuoiHoc`. Đồng bộ
  `drizzle/schemas/lichHoc.ts`.
- Backend: `lichHoc.repository/service/router.ts` — mount `lichHocRouter` chung tiền tố
  `/api/lop-hoc` (tạo/ngừng quy tắc, sinh buổi học, buổi học theo lớp, buổi học bù, đổi
  trạng thái/sửa một buổi) và `thoiKhoaBieuRouter` riêng ở `/api/thoi-khoa-bieu` (thời khóa
  biểu toàn đơn vị, lọc theo giáo viên/khoảng ngày). Quy tắc chính:
  - Sinh buổi học: liệt kê ngày khớp thứ trong tuần trong khoảng áp dụng, bỏ qua ngày đã
    sinh (idempotent), kiểm tra trùng toàn bộ trước khi ghi, có xung đột thì chặn hết.
  - Trùng phòng/giáo viên: cùng đơn vị, cùng ngày, giờ chồng lấn, bỏ qua buổi `huy`/`nghi`.
  - Buổi `da_hoc` không sửa/đổi trạng thái được qua API này.
- Frontend: thêm section "Lịch học lặp lại" và "Buổi học" vào `ClassDetailPage.tsx`; thay
  `PlaceholderPage` ở `/schedule` bằng `SchedulePage.tsx` (thời khóa biểu toàn đơn vị, lọc
  theo khoảng ngày/giáo viên). Thêm `type="time"` cho `TextField` dùng chung.
- Test tay qua API thật (dùng chung server đang chạy, dọn đúng dữ liệu vừa tạo sau khi
  test — bảng `LichHoc`/`BuoiHoc` mới toanh nên xoá sạch an toàn, không đụng dữ liệu khác):
  - Tạo 3 quy tắc (Thứ 3/5/7) cho một lớp có sẵn giáo viên chính — PASS, tự kế thừa phòng
    và giáo viên từ lớp khi không chỉ định riêng.
  - Sinh buổi học đến cuối tháng → đúng số buổi theo đúng ngày trong tuần; sinh lại lần hai
    → không tạo trùng (idempotent) — PASS.
  - Tạo buổi học bù trùng phòng/giờ với buổi đã sinh → bị chặn đúng thông báo; đổi phòng
    khác → thành công — PASS.
  - Đánh dấu nghỉ một buổi → phòng/giờ đó không còn tính là chiếm dụng, tạo buổi bù đúng
    giờ đó thành công — PASS.
  - Thời khóa biểu toàn đơn vị trả đúng số buổi trong khoảng ngày, gồm cả buổi nghỉ và buổi
    bù — PASS.
  - Giao diện `ClassDetailPage`/`SchedulePage` hiển thị đúng dữ liệu vừa tạo, không lỗi
    console — PASS.
  - `pnpm typecheck` PASS.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục E05-E08 đã tick.

---

## Phạm vi nghiệp vụ tại đơn vị hệ thống + dữ liệu mẫu lịch học (2026-07-21)

Người dùng xác nhận lại: đơn vị gốc `SYSTEM` (`loaiDonVi = 'he_thong'`) chỉ dùng để quản
trị (cây đơn vị, người dùng/vai trò), không mở lớp học, không tạo học viên/lớp/lịch. Vẫn có
thể tạo tài khoản (kể cả vai trò giáo viên) và gán về đơn vị nghiệp vụ cụ thể — luồng "trụ
sở tạo tài khoản → phân bổ nhân sự về từng trường/trung tâm".

- Phân tích chi tiết: `docs/analysis/A01_cay_don_vi.md` mục 11 (bổ sung).
- Cập nhật BPD: mục 18.9.
- Backend: thêm `assertDonViChoPhepNghiepVu` (`server/services/donVi.service.ts`), gọi ở
  đầu `createChuongTrinhMoi`, `createGiaoVienMoi`, `createLopHocMoi`, `createHocSinhMoi`,
  `createLeadMoi` — chặn nếu đơn vị đang đứng là `he_thong`. `LichHoc`/`BuoiHoc` không cần
  chặn riêng vì luôn phụ thuộc một `LopHoc` có sẵn (đã chặn gián tiếp từ nguồn). Tạo tài
  khoản người dùng và gán vai trò/đơn vị (`NguoiDung`, `NguoiDungVaiTroDonVi`) **không** bị
  chặn — đúng chủ đích cho phép quản trị nhân sự tại đơn vị hệ thống.
- Test tay qua API: đứng tại `SYSTEM`, tạo lớp/chương trình → bị chặn đúng thông báo; tạo
  tài khoản vai trò giáo viên tại `SYSTEM` → vẫn thành công (201) — PASS. Đứng tại đơn vị
  nghiệp vụ bình thường → không ảnh hưởng, tạo được như cũ — PASS (không cần test lại toàn
  bộ vì logic tạo không đổi, chỉ thêm một bước kiểm tra đầu hàm).
- Dữ liệu mẫu bổ sung: sinh `LichHoc`/`BuoiHoc` cho 3 lớp mẫu đã có (IELTS Sáng Thứ 2-4-6,
  Giao tiếp Tối Thứ 3-5-7 tại TTNN-Q8; Lá 1 tại MN-HOA-NANG) qua API thật — 11 quy tắc, 34
  buổi học, đến hết tháng 8/2026. Thêm tài khoản demo `demo_ketoan_mn` (vai trò `ke_toan`,
  mật khẩu tạm `Edu@123Qaz`) minh hoạ vị trí kế toán cho Mầm Non — vai trò "lễ tân" **chưa
  seed** (chưa có trong `VaiTro`, để phân tích quyền hạn riêng khi thật sự cần).
  Đồng thời cập nhật `server/scripts/seedSampleData.ts` để lần seed từ đầu (DB mới hoàn
  toàn) tự sinh đủ lịch học + tài khoản này — DB dev hiện tại đã có sẵn dữ liệu nền nên
  populate trực tiếp qua API thay vì chạy lại script (script có guard bỏ qua toàn bộ nếu
  chương trình mẫu đã tồn tại, đúng chủ đích thiết kế ban đầu — không phải lỗi).
- `pnpm typecheck` (client + server) PASS.

## Ẩn UI tạo/sửa + xem gộp theo đơn vị tại đơn vị hệ thống (2026-07-21)

Người dùng yêu cầu tiếp: ngoài chặn ở API, phải **ẩn hẳn** chỗ nhập liệu tạo mới khi đứng ở
đơn vị hệ thống (không để bấm lưu rồi mới báo lỗi); đồng thời màn hình danh sách phải **xem
gộp** được dữ liệu của tất cả đơn vị, kèm biết rõ thuộc đơn vị nào.

- Phân tích: `docs/analysis/A01_cay_don_vi.md` mục 11.1 (bổ sung).
- Backend: thêm `list...AllDonVi()` (join `DonVi`, chỉ đơn vị `hoat_dong`) ở repository
  `hocSinh`, `lopHoc`, `chuongTrinh`, `giaoVien`, `lead`. Service `list...` nhận thêm
  `loaiDonVi`, rẽ nhánh sang bản gộp nếu là `he_thong`; đơn vị khác giữ nguyên hành vi cũ.
  Router truyền `loaiDonVi` từ `currentOrganization`.
- Frontend: `StudentsPage`, `ClassesPage` (chương trình + lớp), `TeachersPage`, `LeadsPage`
  — khi `loaiDonVi === 'he_thong'`: ẩn form/nút tạo (gộp vào điều kiện `canManage`), hiện
  thêm cột "Đơn vị", bỏ liên kết sang trang chi tiết (trang chi tiết vẫn khoá theo đúng đơn
  vị đang chọn, chưa mở rộng phần này — xem trước ở dạng bảng là đủ theo yêu cầu). API layer
  (`listHocSinhApi`...) tự làm phẳng cấu trúc `{ item, donVi }` từ backend thành
  `{ ...item, donVi }` để không phải sửa lại phần render bảng đã có.
- Test tay qua browser: đứng ở đơn vị hệ thống — cả 4 trang không còn form tạo, hiện đúng
  dữ liệu gộp kèm cột đơn vị (6 học sinh/3 đơn vị, 3 chương trình + 3 lớp/2 đơn vị, 3 giáo
  viên/2 đơn vị, 3 lead/2 đơn vị), không lỗi console — PASS. Đứng ở đơn vị thường (TTNN-Q8)
  — không đổi hành vi, vẫn có form tạo, không có cột đơn vị, đúng dữ liệu riêng — PASS
  (regression).
- Phát hiện dữ liệu thật: học sinh "Nguyen Khang" và lead "Nguyen Nghia" (của người dùng,
  tạo từ trước khi có validation chặn) đang nằm ở đơn vị hệ thống — hiện đã nhìn thấy được
  qua màn hình gộp. Không tự xoá/di chuyển, để người dùng tự quyết định.
- `pnpm typecheck` (client + server) PASS.

## Chuyển dữ liệu thật sang Mầm Non + D05/D06 (2026-07-21)

**Chuyển dữ liệu:** theo yêu cầu người dùng, chuyển học sinh "Nguyen Khang" (id=7), phụ
huynh "Nghia Nguyen" (id=10) và lead "Nguyen Nghia" (id=4, đã liên kết `hocSinhId=7`) từ
đơn vị hệ thống (id=1) sang Trường Mầm non Hoa Nắng (id=3). Mã học sinh/phụ huynh cũ trùng
với dữ liệu mẫu đã có ở Mầm Non (`HS20260001`, `PH000002`) nên sinh lại mã mới theo đúng
quy tắc sinh mã của ứng dụng (`HS20260003`, `PH000003`); mã lead `LD20260001` không trùng
nên giữ nguyên. Thao tác bằng SQL trực tiếp (transaction) kèm ghi `NhatKyHeThong` thủ công
để có dấu vết audit — chưa có API "chuyển đơn vị" nên đây là thao tác quản trị một lần, đã
verify lại qua API thật sau khi chuyển (PASS).

**D05/D06 — Lịch sử trạng thái học tập, chuyển lớp/ngừng học/bảo lưu:** đúng 4 bước.

- Phân tích: `docs/analysis/D05_D06_lich_su_trang_thai_hoc_tap.md`.
- Cập nhật BPD: mục 18.10.
- Database (`database/014_add_hoc_sinh_trang_thai_lich_su.sql`): thêm bảng
  `HocSinhTrangThaiLichSu` (không ghi đè, mỗi lần đổi trạng thái là một dòng). Đồng bộ
  `drizzle/schemas/hocSinh.ts`.
- Backend: `hocSinh.service.ts` — `setHocSinhTrangThai` nhận thêm `lyDo`, `ngayHieuLuc`;
  chặn nếu trùng trạng thái hiện tại; ghi một dòng lịch sử cho mỗi lần đổi (kể cả lúc tạo
  hồ sơ mới — trạng thái khởi đầu `tiep_nhan`); nếu đổi sang `ngung_hoc`/`hoan_thanh` thì tự
  đóng toàn bộ `HocSinhLopHoc` đang `dang_hoc`/`bao_luu` của học sinh (dùng lại hàm
  `closeEnrollment` đã có từ E03); nếu đổi sang `bao_luu` thì chuyển các lớp đang `dang_hoc`
  sang `bao_luu` (dùng hàm `setEnrollmentTrangThai` — có sẵn từ E03 nhưng trước đó chưa từng
  được gọi ở đâu). Mở lại trạng thái (`tiep_nhan`/`dang_hoc`) **không** tự mở lại enrollment
  đã đóng/bảo lưu — quyết định MVP, xếp lại lớp làm thủ công vì có thể khác lớp cũ.
  `getHocSinhDetail` trả thêm `lichSuTrangThai` và danh sách lớp đã tham gia (`lopHoc`, qua
  hàm mới `listEnrollmentsByHocSinh` — trước đây chỉ có chiều liệt kê học sinh theo lớp).
- Frontend: `StudentDetailPage.tsx` — mục "Trạng thái" đổi thành form (chọn trạng thái mới,
  ngày hiệu lực, lý do tuỳ chọn) thay vì đổi ngay khi chọn; thêm 2 mục mới "Lớp học đã tham
  gia" và "Lịch sử trạng thái".
- Test tay qua API thật (dùng chung server đang chạy, phục hồi đúng dữ liệu mẫu sau khi
  test):
  - Đổi trạng thái học sinh mẫu sang `bao_luu` → enrollment đang `dang_hoc` chuyển đúng
    `bao_luu`, không có `ngayRoiLop`, ghi đúng 1 dòng lịch sử — PASS.
  - Đổi trạng thái trùng trạng thái hiện tại → bị chặn — PASS.
  - Đổi tiếp sang `ngung_hoc` → enrollment đóng đúng (`ngung_hoc`, có `ngayRoiLop` theo
    đúng ngày hiệu lực nhập vào), lịch sử có đủ 2 dòng — PASS.
  - Giao diện `StudentDetailPage` hiển thị đúng, không lỗi console — PASS.
  - Phục hồi lại đúng trạng thái gốc của dữ liệu mẫu sau khi test (xoá 2 dòng lịch sử test,
    trả `HocSinh`/`HocSinhLopHoc` về giá trị ban đầu).
  - `pnpm typecheck` (client + server) PASS.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục D05, D06 đã tick.

---

## F01/F02/F04 — Điểm danh theo buổi học (2026-07-21)

Mở đầu Sprint 3, đúng 4 bước. Phạm vi: điểm danh học sinh theo từng buổi học cụ thể
(`BuoiHoc`, có từ E05-E08), 5 trạng thái điểm danh, giáo viên ghi nhận. **Chưa** gồm F03
(phụ huynh gửi đơn xin phép — cần Portal, module J) và F05 (thông báo vắng học — cần module
Thông báo, M11). F06 (mầm non đón/trả) để riêng.

- Phân tích chi tiết: `docs/analysis/F01_F02_F04_diem_danh.md`.
- Cập nhật BPD: mục 18.11 — bảng `DiemDanh` lưu một dòng duy nhất cho mỗi cặp (buổi học,
  học sinh), khác nguyên tắc không ghi đè ở nơi khác vì điểm danh là sự kiện đã chốt tại
  một buổi cụ thể; roster dựng từ `HocSinhLopHoc` theo đúng ngày học của buổi (không phụ
  thuộc trạng thái ghi danh hiện tại); mặc định "Có mặt" cho buổi chưa điểm danh để giảm
  thao tác; lưu điểm danh lần đầu tự chuyển `BuoiHoc` sang `da_hoc` (đúng như đã chốt ở mục
  18.8); tái sử dụng đúng quyền `diem_danh.xem`/`diem_danh.thuc_hien` đã seed từ Sprint 0
  (giáo viên thực hiện được, học vụ chỉ xem) — không tạo quyền mới, không đổi ma trận.
- Database (`database/015_add_diem_danh.sql`): bảng `DiemDanh`
  (`UQ_DiemDanh_buoiHocId_hocSinhId`). Đồng bộ `drizzle/schemas/diemDanh.ts`.
- Backend: `diemDanh.repository/service/router.ts` (`/api/diem-danh`) — `GET
  /buoi-hoc/:id` trả roster (học sinh đang ghi danh tại đúng ngày học + trạng thái điểm
  danh, mặc định `co_mat` nếu chưa lưu lần nào); `POST /buoi-hoc/:id` lưu hàng loạt, validate
  từng học sinh phải thuộc đúng roster, chặn nếu buổi đang `nghi`/`huy`, tự chuyển
  `BuoiHoc.trangThai` sang `da_hoc`.
- Frontend: `AttendancePage.tsx` thay `PlaceholderPage` ở `/attendance` — chọn ngày → danh
  sách buổi học trong ngày (tái dùng `listThoiKhoaBieuApi` đã có) → chọn buổi → bảng điểm
  danh (hỗ trợ deep-link qua query `?buoiHocId=`). Thêm nút "Điểm danh" vào bảng "Buổi học"
  trong `ClassDetailPage.tsx`, liên kết thẳng sang đúng buổi.
- Test tay qua API và UI thật (dùng chung server đang chạy, phục hồi đúng dữ liệu mẫu sau
  khi test):
  - Roster đúng 2 học sinh đang ghi danh tại ngày học của buổi, mặc định `co_mat` — PASS.
  - Lưu điểm danh (1 vắng có phép có ghi chú, 1 có mặt) → buổi tự chuyển `da_hoc` — PASS.
  - Đánh dấu buổi `nghi` rồi thử điểm danh → bị chặn đúng thông báo; mở lại buổi — PASS.
  - Thao tác thật qua UI: đổi trạng thái trên `AttendancePage`, bấm "Lưu điểm danh" → lưu
    đúng xuống DB, buổi chuyển `da_hoc` — PASS. Bấm nút "Điểm danh" từ `ClassDetailPage` →
    điều hướng đúng sang đúng buổi trên `AttendancePage` — PASS.
  - Phục hồi lại dữ liệu mẫu về trạng thái ban đầu sau khi test (xoá `DiemDanh` test, trả
    `BuoiHoc.trangThai` về `du_kien`).
  - `pnpm typecheck` (client + server) PASS.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục F01, F02, F04 đã tick.

---

## G01/G02/G03 — Báo giảng theo buổi, nhận xét giáo viên (2026-07-21)

Tiếp F01/F02/F04, cùng ngày, đúng 4 bước. Phạm vi: nội dung bài học + bài tập giao cho mỗi
buổi học, kèm nhận xét riêng từng học sinh (dùng lại đúng màn điểm danh). **Chưa** gồm G04
(kiểm tra/đánh giá), G05 (tiến độ theo chương trình), G06/G07 (nghiệp vụ chuyên biệt theo
loại hình) — cần mô hình dữ liệu riêng phức tạp hơn.

- Phân tích chi tiết: `docs/analysis/G01_G02_G03_bao_giang.md`.
- Cập nhật BPD: mục 18.12 — bảng `BaoGiang` lưu đúng một dòng cho mỗi buổi (unique
  `buoiHocId`), sửa lại là ghi đè, cùng nguyên tắc đã dùng cho điểm danh; nhận xét từng học
  sinh thêm thẳng vào cột `nhanXet` của bảng `DiemDanh` có sẵn thay vì tạo bảng riêng — lưu
  cùng lúc với điểm danh, đúng luồng làm việc thật của giáo viên sau mỗi buổi dạy.
- **Seed quyền mới** `hoc_tap.xem`/`hoc_tap.ghi_nhan` — khác điểm danh, không tái dùng được
  `lop_hoc.quan_ly` vì giáo viên chỉ có `lop_hoc.xem`. Gán cho `giao_vien` và
  `quan_ly_don_vi` (cả hai quyền), `hoc_vu` (chỉ xem) — đúng nguyên tắc học vụ không ghi
  nhận thay giáo viên đã áp dụng ở điểm danh. Cập nhật cả `server/scripts/seedAuthFoundation.ts`
  và `database/008_seed_default_role_permissions.sql` để lần seed từ đầu có đủ quyền này; DB
  dev hiện tại áp dụng trực tiếp qua migration.
- Database (`database/016_add_bao_giang.sql`): bảng `BaoGiang`; `ALTER TABLE DiemDanh ADD
  COLUMN nhanXet`; seed 2 quyền mới + gán vào 3 vai trò. Đồng bộ `drizzle/schemas/diemDanh.ts`
  (thêm `baoGiang` + cột `nhanXet`).
- Backend: `baoGiang.repository/service/router.ts` (`/api/bao-giang`, `GET`/`PUT` theo
  `buoiHocId`, chặn nếu buổi `nghi`/`huy` — cùng nguyên tắc điểm danh). Cập nhật
  `diemDanh.repository/service/router.ts` để nhận và lưu `nhanXet` cùng lúc với `trangThai`.
- Frontend: thêm cột "Nhận xét" vào bảng điểm danh và mục "Báo giảng" (nội dung bài học, bài
  tập, ghi chú) ngay trong `AttendancePage.tsx` — cùng màn hình với điểm danh của đúng buổi
  đó, không tách trang riêng.
- Test tay qua API và UI thật (dùng chung server đang chạy — server dev đã tắt giữa chừng
  phiên làm việc dài, phải khởi động lại qua `preview_start` + đăng nhập lại trước khi test;
  phục hồi đúng dữ liệu mẫu sau khi test):
  - Lưu báo giảng lần đầu, xem lại đúng — PASS. Lưu đè lần hai → đúng 1 dòng duy nhất
    (`id` giữ nguyên), không tạo dòng mới — PASS.
  - Lưu điểm danh kèm nhận xét cho một học sinh → đúng dữ liệu, không ảnh hưởng học sinh
    khác — PASS.
  - Ghi báo giảng cho buổi đang `nghi` → bị chặn đúng thông báo — PASS.
  - Thao tác thật qua UI: sửa nội dung bài học trên `AttendancePage`, bấm "Lưu báo giảng" →
    lưu đúng xuống DB — PASS.
  - Phục hồi lại dữ liệu mẫu về trạng thái ban đầu sau khi test (xoá `BaoGiang`/`DiemDanh`
    test, trả `BuoiHoc.trangThai` về `du_kien`).
  - `pnpm typecheck` (client + server) PASS.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục G01, G02, G03 đã tick.

---

## Thiết kế lại sidebar lần hai (2026-07-22)

Người dùng yêu cầu tiếp: mỗi nhóm chức năng đóng khung có shadow nhẹ, tên nhóm có điểm nhấn,
và chức năng chưa hoàn thiện (còn là `PlaceholderPage`) hiển thị gạch dưới để phân biệt.

- `client/src/routes/appRoutes.tsx`: thêm cờ tùy chọn `comingSoon?: boolean` trên
  `AppRouteDefinition`, gắn cho "Học phí · Công nợ" và "Cấu hình hệ thống" (2 mục còn là
  placeholder tại thời điểm đó).
- `client/src/components/layout/Sidebar.tsx`: gắn class `sidebar-item--coming-soon` +
  tooltip "(đang xây dựng)" cho mục có cờ này.
- `client/src/styles/sidebar-balance.css`: viết lại `.sidebar-group` thành thẻ card riêng
  (gradient kính mờ, viền mảnh, box-shadow); `.sidebar-group__label` thêm chấm tròn accent
  màu secondary + đường kẻ chân; mục đang active có vạch accent trái + icon đổi màu tương
  phản; mục `comingSoon` có gạch dưới nét đứt + giảm opacity.
- Test qua trình duyệt thật (đăng nhập, đọc computed style trực tiếp trên DOM vì công cụ
  screenshot bị lỗi timeout trong phiên này): xác nhận đúng shadow/border-radius/màu accent/
  underline. Phát hiện một lần đọc sai do HMR cache cũ (background trắng của mục active bị
  đọc nhầm thành trong suốt) — reload cứng xác nhận lại đúng, không phải lỗi CSS thật.
- `pnpm typecheck`, `pnpm build` PASS.
- Dọn dẹp: phát hiện `server/services/storeDutyAccessService.ts` là code rác sót từ template
  gốc (tham chiếu bảng/module không tồn tại: `db/duty`, `db/storeLedger`, bảng `residents`),
  làm `pnpm typecheck` server fail — không có nơi nào khác tham chiếu, đã xoá.

---

## H01/H02 — Danh mục khoản thu, Kỳ thu (2026-07-22)

Mở Sprint 5 (Tài chính), đúng 4 bước. Phạm vi: danh mục khoản thu, kỳ thu, gán khoản thu áp
dụng cho kỳ, mở/đóng kỳ thu. **Chưa** gồm H03-H09 (sinh khoản phải thu theo lớp, thu tiền,
miễn giảm, công nợ, biên nhận, hoàn phí/chuyển phí/bảo lưu, báo cáo doanh thu) — để lại làm
slice tiếp theo, đúng nhịp tách nhỏ đã dùng cho E01-E04/E05-E08 và F.../G....

- Mô hình dữ liệu tham khảo từ bản nháp `database/003_init_finance_learning.sql` (chưa từng
  áp dụng), viết lại đúng quy ước Drizzle hiện tại (bigint unsigned, `IX_`/`UQ_`, datetime
  mode string không có DEFAULT CURRENT_TIMESTAMP — set tay qua `now()` như các module khác).
- Database (`database/017_add_khoan_thu_ky_thu.sql`, áp dụng trực tiếp vì chưa có TTY cho
  `db:push`): tạo `DanhMucKhoanThu`, `KyThu`, `KyThuKhoanThu`. Đồng bộ
  `drizzle/schemas/taiChinh.ts`.
- Quyền: tái sử dụng `tai_chinh.xem`/`tai_chinh.quan_ly` đã seed sẵn từ Sprint 0 và đã gán
  cho `ke_toan`/`quan_ly_don_vi` trong `database/008_seed_default_role_permissions.sql` —
  không cần seed quyền mới.
- Backend: `server/db/taiChinh.repository.ts`, `server/services/taiChinh.service.ts`,
  `server/routers/taiChinh.router.ts` (đăng ký `/api/tai-chinh`). Quy tắc chính:
  - Mã khoản thu/kỳ thu nhân viên tự đặt (giống chương trình/lớp), chặn trùng mã trong đơn
    vị.
  - Chặn tạo tại đơn vị hệ thống (`assertDonViChoPhepNghiepVu`, tái dùng từ E01-E04).
  - Kỳ thu có 2 trạng thái làm việc: `nhap` (sửa được thông tin + khoản thu áp dụng) →
    `da_mo` (khoá sửa, chuẩn bị cho slice sau sinh khoản phải thu) → `da_dong`. Mở kỳ bắt
    buộc phải có ít nhất một khoản thu áp dụng; không mở lại được kỳ đã đóng.
  - Gán khoản thu áp dụng cho kỳ theo kiểu "thay toàn bộ danh sách" (replace-all) thay vì
    thêm/gỡ từng dòng — đơn giản hơn cho UI chọn nhiều khoản cùng lúc, cùng nguyên tắc với
    lưu điểm danh hàng loạt.
  - Không cho gán khoản thu đã `ngung_ap_dung` vào kỳ thu mới.
- Frontend: `client/src/pages/FinancePage.tsx` (`/finance`, 2 section: danh mục khoản thu +
  kỳ thu, dùng `CurrencyInput` có sẵn cho số tiền), `client/src/pages/KyThuDetailPage.tsx`
  (`/finance/ky-thu/:id`, sửa thông tin khi còn nháp, bảng chọn khoản áp dụng bằng checkbox +
  `CurrencyInput`, nút mở/đóng kỳ qua `ConfirmDialog`) thay `PlaceholderPage`. Gỡ cờ
  `comingSoon` khỏi mục "Học phí · Công nợ" trong `appRoutes.tsx`.
- Test tay qua UI thật (dùng chung server đang chạy, xác nhận đúng ID vừa tạo trước khi xoá,
  đúng bài học từ sự cố C07):
  - Tạo khoản thu "Học phí hàng tháng" (`HP-THANG`, 2.500.000đ) — PASS.
  - Tạo kỳ thu "Học phí tháng 8/2026" (`HP-T8-2026`, 01/08–31/08/2026) — PASS, ngày lưu đúng
    `2026-08-01`/`2026-08-31`.
  - Vào chi tiết kỳ thu, chọn khoản thu áp dụng (checkbox + số tiền tự điền từ số tiền mặc
    định), lưu — PASS.
  - Mở kỳ thu (qua `ConfirmDialog`) → form thông tin và khoản áp dụng chuyển sang chỉ đọc
    đúng — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
  - Dọn dẹp: xoá đúng 3 dòng vừa tạo (`KyThuKhoanThu` id=1, `KyThu` id=1, `DanhMucKhoanThu`
    id=1) sau khi verify qua `SELECT` khớp đúng thời gian/mã vừa tạo — xác nhận trang `/finance`
    về lại trạng thái rỗng ban đầu.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục H01, H02 đã tick.

---

## H03-H07 — Khoản phải thu, miễn giảm, thu tiền, công nợ, biên nhận (2026-07-22)

Tiếp H01/H02, đúng 4 bước. Phạm vi: sinh khoản phải thu cho từng học sinh theo lớp, miễn
giảm, thu tiền từng phần/nhiều lần, xem công nợ toàn đơn vị, xem lịch sử phiếu thu (biên
nhận). **Chưa** gồm H08 (hoàn phí/chuyển phí/bảo lưu) và H09 (báo cáo doanh thu tổng hợp có
biểu đồ) — để lại làm bước sau.

- Phân tích chi tiết: `docs/analysis/H03_H07_khoan_phai_thu_thu_tien.md`.
- Cập nhật BPD: mục 18.14 — chốt đơn giản hoá lớn nhất so với bản nháp
  `database/003_init_finance_learning.sql`: **một phiếu thu gắn đúng một khoản phải thu**
  (không có `PhieuThuChiTiet` nhiều khoản/phiếu); "thu nhiều lần" vẫn đủ vì một khoản phải
  thu nhận được nhiều phiếu thu cho tới khi thu đủ. `conLai` tính trong service, không dùng
  generated column MySQL. Đóng kỳ thu khoá luôn cả miễn giảm/thu tiền (không chỉ khoá sửa
  thông tin kỳ như đã chốt ở mục 18.13).
- Database (`database/018_add_khoan_phai_thu_phieu_thu.sql`): tạo `KhoanPhaiThu`,
  `KhoanPhaiThuChiTiet`, `PhieuThu`. Đồng bộ `drizzle/schemas/taiChinh.ts`.
- Backend: mở rộng `server/db/taiChinh.repository.ts`,
  `server/services/taiChinh.service.ts`, `server/routers/taiChinh.router.ts` (thêm các route
  con dưới `/api/tai-chinh`: sinh khoản phải thu theo lớp, xem/miễn giảm/thu tiền khoản phải
  thu, xem phiếu thu, xem công nợ toàn đơn vị). Quy tắc chính:
  - Sinh khoản phải thu: chỉ khi kỳ `da_mo`; lấy học sinh đang `dang_hoc` trong lớp; bỏ qua
    (không lỗi) học sinh đã có khoản phải thu cho kỳ đó — idempotent, chạy lại nhiều lớp/nhiều
    lần an toàn.
  - Miễn giảm/thu tiền: chỉ khi kỳ vẫn `da_mo` — đóng kỳ khoá toàn bộ thao tác tiền, kể cả
    những khoản phải thu chưa thu đủ (chốt sổ đúng nghĩa).
  - Giảm trừ mới + đã thu không được vượt tổng tiền; số tiền thu không được vượt số còn lại
    và phải lớn hơn 0.
  - Trạng thái khoản phải thu (`chua_thu`/`thu_mot_phan`/`da_thu_du`) luôn suy ra tự động từ
    số liệu sau mỗi lần đổi, không cho sửa tay.
  - Mã phiếu thu tự sinh `PT<năm><5 số>`.
- Frontend: mở rộng `client/src/pages/KyThuDetailPage.tsx` — thêm section "Sinh khoản phải
  thu" (chọn lớp, chỉ hiện khi kỳ đang mở), bảng "Khoản phải thu" theo kỳ, panel thao tác dùng
  chung một vùng hiển thị bên dưới bảng (chỉ một panel "Thu tiền"/"Miễn giảm"/"Lịch sử thu"
  hiện tại một thời điểm — tránh mở nhiều modal chồng nhau, đúng nguyên tắc thiết kế "không tự
  viết modal riêng" vì đây là form inline, không phải popup). Thêm mục "Công nợ" vào
  `client/src/pages/FinancePage.tsx` (toàn đơn vị, liên kết sang đúng kỳ thu).
- Test tay qua UI thật (dùng chung server đang chạy, theo đúng lớp/học sinh mẫu sẵn có tại
  TTNN-Q8, xác nhận đúng ID trước khi xoá):
  - Sinh khoản phải thu cho lớp "IELTS Sáng Thứ 2-4-6" (2 học sinh đang học) từ kỳ thu đã mở
    — tạo đúng 2 khoản phải thu 1.000.000đ, bỏ qua 0 — PASS.
  - Thu một phần 600.000đ cho một học sinh → còn lại 400.000đ, trạng thái "Thu một phần" —
    PASS.
  - Miễn giảm 200.000đ cho học sinh còn lại → còn lại 800.000đ, trạng thái vẫn "Chưa thu" —
    PASS. Thử giảm trừ 2.000.000đ (vượt tổng tiền) → bị chặn đúng thông báo — PASS (phát hiện
    khi test tay do gõ nhầm vào ô CurrencyInput chưa focus rỗng, validation chặn đúng, không
    có dữ liệu sai lọt xuống DB).
  - Xem "Lịch sử thu" → đúng 1 phiếu thu, mã tự sinh `PT202600001`, đúng ngày/số tiền/phương
    thức/ghi chú — PASS.
  - Trang `/finance` mục "Công nợ" hiển thị đúng cả 2 khoản còn nợ, liên kết đúng sang kỳ thu
    — PASS.
  - Đóng kỳ thu → nút "Sinh khoản phải thu" và cột "Thao tác" (Thu tiền/Miễn giảm/Lịch sử
    thu) biến mất khỏi bảng khoản phải thu, chỉ còn xem — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
  - Dọn dẹp: xoá đúng theo thứ tự khoá ngoại (`PhieuThu` id=1, `KhoanPhaiThuChiTiet` id=1-2,
    `KhoanPhaiThu` id=1-2, `KyThuKhoanThu`, `KyThu` id=2, `DanhMucKhoanThu` id=2) sau khi
    verify qua `SELECT` khớp đúng thời gian vừa tạo — xác nhận trang `/finance` về lại trạng
    thái rỗng ban đầu.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục H03, H04, H05, H06, H07 đã tick.

---

## H09 — Báo cáo tài chính (2026-07-22)

Tiếp H03-H07, đúng 4 bước. Phạm vi: tổng thu trong khoảng ngày, tổng công nợ hiện tại, bảng
thu theo từng kỳ thu. Chỉ còn **H08** (hoàn phí/chuyển phí/bảo lưu) chưa làm trong Sprint 5 —
để lại làm bước riêng vì cần thiết kế nghiệp vụ phức tạp hơn (không đơn thuần CRUD).

- Phân tích chi tiết: `docs/analysis/H09_bao_cao_tai_chinh.md`.
- Cập nhật BPD: mục 18.15 — chốt quyết định quan trọng nhất: "tổng thu" lọc theo ngày
  (`PhieuThu.ngayThu` trong khoảng chọn), còn "công nợ" và "bảng theo kỳ thu" **không** lọc
  theo ngày (luôn là số dư/luỹ kế hiện tại) — tránh trộn hai trục thời gian gây khó hiểu.
- Database: không đổi — chỉ thêm truy vấn tổng hợp (SUM/COUNT/GROUP BY) trên các bảng đã có.
- Backend: thêm `sumPhieuThuTrongKhoang`, `sumCongNoByDonVi`, `listKyThuBaoCaoByDonVi`,
  `listKyThuBaoCaoAllDonVi` (`server/db/taiChinh.repository.ts`), `getBaoCaoTaiChinh`
  (`server/services/taiChinh.service.ts`), route `GET /api/tai-chinh/bao-cao` (mặc định đầu
  tháng hiện tại → hôm nay nếu không truyền tham số).
- Frontend: `client/src/pages/FinanceReportPage.tsx` (`/finance/bao-cao`) — bộ lọc khoảng
  ngày, 2 `StatCard` (tổng thu, tổng công nợ), bảng theo kỳ thu (thêm cột "Đơn vị" khi đứng ở
  đơn vị hệ thống, cùng nguyên tắc "xem gộp" đã dùng ở các module khác). Thêm nút "Báo cáo tài
  chính" vào header trang `/finance`.
- Test tay qua UI thật (dùng chung server đang chạy, xác nhận đúng ID trước khi xoá):
  - Tạo khoản thu + kỳ thu + mở kỳ + sinh khoản phải thu cho 2 học sinh (2.000.000đ) + thu đủ
    1.000.000đ cho 1 học sinh — báo cáo hiện đúng: tổng thu 1.000.000đ/1 phiếu, tổng công nợ
    1.000.000đ, bảng kỳ thu phải thu 2.000.000đ/đã thu 1.000.000đ/còn lại 1.000.000đ — PASS.
  - Đổi "Từ ngày" sang sau thời điểm thu tiền → tổng thu về 0, nhưng công nợ và bảng theo kỳ
    thu giữ nguyên đúng như thiết kế (không lọc theo ngày) — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS.
  - Dọn dẹp: xoá đúng ID vừa tạo theo thứ tự khoá ngoại, xác nhận `/finance` và `/finance/bao-cao`
    về lại trạng thái rỗng ban đầu.
- Checklist: `docs/00_MASTER_CHECKLIST.md` mục H09 đã tick. Sprint 5 còn lại đúng một mục H08.

---

## Hệ thống link liên kết toàn app (2026-07-22)

Người dùng yêu cầu: bảng "xem gộp" ở đơn vị hệ thống (ví dụ Chương trình đào tạo trong
`ClassesPage`) phải bấm được vào tên thực thể và tên đơn vị, tự đề xuất khi nào mở cùng tab
khi nào mở tab mới, và cảnh báo khi rời trang có dữ liệu chưa lưu.

**Phát hiện kiến trúc quan trọng trước khi làm:** phiên đăng nhập dùng chung 1 cookie
(`qlth_session`) cho mọi tab của cùng trình duyệt — "đơn vị đang chọn" (`donViHienTaiId`) lưu
trên chính dòng session đó, không tách theo tab/request. Nghĩa là đổi đơn vị ở tab mới **sẽ**
đổi đơn vị cho cả tab gốc (chỉ là tab gốc không thấy ngay). Tách phiên thật sự theo từng tab
cần đổi cơ chế đăng nhập (mỗi tab một token riêng, không thể dựa thuần vào cookie) — quy mô
lớn hơn nhiều so với yêu cầu. Đã chọn hướng nhẹ: dùng đúng cơ chế hiện có + `AuthContext` tự
gọi lại `/auth/me` mỗi khi tab được focus lại, để tab gốc luôn tự sửa về đúng đơn vị đang chọn
thay vì đứng im hiển thị sai.

- Hạ tầng mới (`client/src/`):
  - `features/navigation/UnsavedChangesContext.tsx` — `UnsavedChangesProvider` (bọc toàn app
    trong `main.tsx`), `useUnsavedChangesGuard(isDirty)`, `useGuardedNavigate()`. Có
    `ConfirmDialog` xác nhận rời trang + chặn `beforeunload` khi đang dirty.
  - `components/shared/GuardedLink.tsx` — link cùng tab, tự hỏi xác nhận nếu trang đang dirty.
  - `components/shared/EntityLink.tsx` — export `EntityLink` (link tới thực thể, tự chọn cùng
    tab hay tab mới dựa vào có `donVi` hay không) và `OrgLink` (ô "Đơn vị", luôn mở tab mới).
  - `pages/OpenInOrganizationPage.tsx` (route `/mo-don-vi?donViId=&to=`) — trang trung gian
    cho link tab mới: gọi `selectOrganization` rồi điều hướng tới `to`.
  - `AuthContext.tsx` — thêm resync khi tab `focus`/`visibilitychange`.
  - Cập nhật `docs/DESIGN_SYSTEM_RULES.md` mục "Link liên kết giữa các trang" làm chuẩn dùng
    chung, cấm tự viết `window.open`/`beforeunload`/`confirm()` riêng trong page.
- Trang chi tiết mới (trước đó chưa tồn tại, chỉ sửa inline):
  - Backend: `getChuongTrinhDetail`/`GET /api/chuong-trinh/:id`,
    `getGiaoVienDetail`/`GET /api/giao-vien/:id` (tái dùng repository sẵn có, không đổi quy
    tắc nghiệp vụ).
  - `pages/ChuongTrinhDetailPage.tsx` (`/chuong-trinh/:id`) — sửa thông tin, đổi trạng thái,
    danh sách lớp đang dùng chương trình này.
  - `pages/GiaoVienDetailPage.tsx` (`/teachers/:id`) — sửa thông tin, đổi trạng thái.
    `TeachersPage.tsx` bỏ sửa/đổi trạng thái inline (chuyển hẳn sang trang chi tiết), giữ
    nguyên form tạo mới — cùng khuôn mẫu với `StudentsPage`/`LeadsPage`.
- Gắn `EntityLink`/`OrgLink` vào đúng cột tên thực thể + cột "Đơn vị" ở mọi bảng xem gộp đã có
  từ trước: `ClassesPage` (chương trình, lớp học), `TeachersPage`, `StudentsPage`,
  `LeadsPage`, `FinancePage` (kỳ thu, công nợ), `FinanceReportPage` (thu theo kỳ thu). Có chủ
  đích **không** link các cột chỉ hiển thị dữ liệu (số điện thoại, ghi chú, số tiền...) — đúng
  yêu cầu "cân đối", không phải chỗ nào cũng cần link.
- Gắn `useUnsavedChangesGuard` vào các trang có form tạo/sửa đang nhận link điều hướng mới:
  `ClassesPage`, `TeachersPage`, `StudentsPage`, `LeadsPage`, `FinancePage`,
  `KyThuDetailPage`, `ChuongTrinhDetailPage`, `GiaoVienDetailPage`. **Chưa** lùi sâu vào
  `StudentDetailPage`/`ClassDetailPage`/`LeadDetailPage` (các trang chi tiết có sẵn từ trước,
  nhiều mục sửa nhỏ lẻ, không thuộc phạm vi thay đổi lần này) — để lại nếu cần sau.
- Test tay qua trình duyệt thật:
  - Bảng "Chương trình đào tạo" ở đơn vị hệ thống — bấm tên chương trình → mở đúng tab mới,
    href `/mo-don-vi?donViId=2&to=%2Fchuong-trinh%2F3`, `target="_blank"` — PASS. Điều hướng
    trực tiếp tới URL đó xác nhận: tự chuyển đúng đơn vị (`TTNN-Q8`), vào đúng trang chi tiết,
    hiện đúng danh sách lớp dùng chương trình — PASS.
  - Sửa tên chương trình rồi bấm "← Lớp học" → hiện đúng `ConfirmDialog` "Rời trang khi chưa
    lưu"; bấm "Rời trang" → điều hướng đúng, dữ liệu chưa lưu bị huỷ đúng ý (không lưu xuống
    DB) — PASS.
  - `TeachersPage` → bấm tên giáo viên → vào đúng `GiaoVienDetailPage`, hiển thị đúng thông
    tin — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS. Không phát sinh lỗi console thật (một dòng lỗi HMR
    "Failed to reload App.tsx" chỉ là log cũ còn sót lại từ lúc đang sửa file giữa chừng, xác
    nhận lại bằng console sạch sau khi tải lại trang mới).
- Checklist: không thuộc mục H hay bất kỳ mục nào trong `docs/00_MASTER_CHECKLIST.md` — đây là
  cải tiến hạ tầng UI/UX xuyên suốt app, không phải một tính năng nghiệp vụ mới.

---

## 3 trang chi tiết còn thiếu — Phiếu thu, Đơn vị, Người dùng (2026-07-22)

Tiếp ngay hệ thống link ở trên: rà soát toàn bộ entity theo nguyên tắc "đối tượng nghiệp vụ
cốt lõi cần trang chi tiết riêng theo đơn vị, dữ liệu danh mục/tham chiếu thì giữ dạng bảng +
form inline" (tham khảo mẫu List Report/Object Page của SAP Fiori và thực tiễn SIS). Phát hiện
3 khoảng trống: Phiếu thu (chỉ xem trong danh sách "Lịch sử thu", chưa tra cứu độc lập được),
Đơn vị (chỉ có form sửa nhanh trong cây, chưa có hồ sơ riêng), Người dùng (quản lý vai trò qua
modal `UserAssignmentPanel`, chưa có trang riêng). Làm cả 3 theo yêu cầu người dùng.

- Backend: thêm 3 hàm chi tiết + 3 route `GET /:id` mới, tái dùng toàn bộ logic nghiệp vụ đã
  có (không đổi quy tắc):
  - `getPhieuThuDetail` (`server/services/taiChinh.service.ts`) + `findPhieuThuById`
    (join `hocSinh`/`khoanPhaiThu`/`kyThu`) — `GET /api/tai-chinh/phieu-thu/:id`.
  - `getDonViDetail` (`server/services/donVi.service.ts`, chỉ là wrapper quanh
    `findDonViById` đã có) — `GET /api/don-vi/:id`.
  - `getUserDetail` (`server/services/user.service.ts`) — **có lọc bỏ `matKhauHash`** trước
    khi trả về frontend (an toàn bảo mật, `findUserById` gốc trả nguyên cả hash) —
    `GET /api/users/:id`.
- Frontend — trang mới:
  - `PhieuThuDetailPage.tsx` (`/finance/phieu-thu/:id`) — chỉ xem (phiếu thu không sửa được
    sau khi lập, đúng bản chất chứng từ), có nút "In biên nhận" dùng `window.print()` (không
    cần thêm thư viện PDF). Link từ "Lịch sử thu" trong `KyThuDetailPage`.
  - `DonViDetailPage.tsx` (`/organizations/:id`) — sửa thông tin, đổi trạng thái (3 mức:
    hoạt động/tạm ngưng/ngừng hoạt động, khác 2 mức của Chương trình/Giáo viên), danh sách
    đơn vị con (link đệ quy sang chính trang này). `OrganizationTreePage.tsx` đơn giản hoá
    còn list + tạo mới, bỏ sửa/đổi trạng thái inline — cùng khuôn mẫu đã áp dụng cho
    Teachers/Students trước đó.
  - `UserDetailPage.tsx` (`/users/:id`) — khoá/mở khoá, reset mật khẩu (qua `ConfirmDialog` +
    `NotificationDialog` hiện mật khẩu tạm), quản lý vai trò theo đơn vị (viết lại mới, dùng
    `ConfirmDialog` thay vì `window.confirm()` như component cũ). Xoá hẳn
    `client/src/components/users/UserAssignmentPanel.tsx` (không còn nơi nào dùng, đúng
    nguyên tắc không giữ code chết) — chức năng chuyển hết vào trang chi tiết.
  - Cả 3 trang dùng `EntityLink`/`GuardedLink` cho link nội bộ và
    `useUnsavedChangesGuard` cho form sửa — đúng hạ tầng vừa xây ở mục trên.
- Test tay qua UI thật (dùng chung server đang chạy):
  - `DonViDetailPage`: bấm từ cây đơn vị vào TTNN-Q8 — hiện đúng trạng thái, form sửa, danh
    sách đơn vị con (0 đơn vị, đúng thực tế) — PASS.
  - `UserDetailPage`: bấm vào tài khoản `demo_hocvu` — hiện đúng thông tin, đúng cờ "Bắt buộc
    đổi mật khẩu", đúng 1 phân công vai trò có sẵn (`hoc_vu` tại TTNN-Q8). Reset mật khẩu →
    `ConfirmDialog` → `NotificationDialog` hiện đúng mật khẩu tạm cố định `Edu@123Qaz` — PASS.
  - `PhieuThuDetailPage`: tạo khoản thu + kỳ thu + mở kỳ + sinh khoản phải thu + thu tiền đủ
    cho 1 học sinh → bấm "Lịch sử thu" → bấm số phiếu `PT202600001` → trang chi tiết hiện
    đúng toàn bộ thông tin (học sinh, kỳ thu, số tiền, phương thức, ngày thu) và đúng số dư
    khoản phải thu liên quan (còn lại 0đ, đã thu đủ) — PASS.
  - `pnpm typecheck`, `pnpm build` — PASS. Không phát sinh lỗi console thật.
  - Dọn dẹp: xoá đúng ID vừa tạo cho vòng test Phiếu thu theo thứ tự khoá ngoại; không đổi
    trạng thái thật của TTNN-Q8 (chỉ xem, không bấm nút đổi trạng thái khi test); reset mật
    khẩu `demo_hocvu` là hành động an toàn vì mật khẩu tạm luôn là giá trị cố định có sẵn.
- Checklist: không thuộc mục nào trong `docs/00_MASTER_CHECKLIST.md` — tiếp tục thuộc phạm vi
  cải tiến hạ tầng UI/UX, không phải tính năng nghiệp vụ mới.

---

## Rà soát I01-I04 + khung Portal, chốt D03 "phụ huynh nhiều đơn vị" (2026-07-22)

Rà soát lại phần vừa thêm (I01-I04 — Thông báo/Trao đổi — và một khung Portal chưa lên
checklist) theo checklist, mô tả yêu cầu, template style, cấu trúc route và component. I01-I04
đạt yêu cầu. Khung Portal (`client/src/features/portal/`, `client/src/config/portal.ts`,
`PortalLandingPage.tsx`, `server/routers|services/portal.*`) phát hiện một thay đổi nghiệp vụ
lớn chưa ghi tài liệu: `addGuardianToStudent` đã đổi từ tái sử dụng phụ huynh theo số điện
thoại **trong đơn vị** sang **toàn hệ thống**, để phục vụ Portal gộp dữ liệu con theo nhiều
đơn vị cho một tài khoản phụ huynh.

Xác nhận với người dùng: đây đúng là chủ đích — **một phụ huynh có thể có con học nhiều đơn
vị** (một con hoặc nhiều con). Bổ sung các biện pháp an toàn/chuyên môn đi kèm quyết định này:

- **Xác nhận rõ ràng khi ghép chéo đơn vị**: `server/services/phuHuynh.service.ts` thêm
  `CrossOrgGuardianConfirmError` — khi số điện thoại khớp phụ huynh ở đơn vị khác,
  `addGuardianToStudent` không tự động ghép mà báo lỗi kèm thông tin hồ sơ tìm thấy (họ tên,
  mã phụ huynh, tên đơn vị gốc). `StudentDetailPage.tsx` bắt lỗi này, hiện `ConfirmDialog`
  (đúng chuẩn popup 2 hành động của app) để người dùng xem và xác nhận trước khi gọi lại API
  với `confirmCrossOrgReuse: true`. Ghép trong cùng đơn vị vẫn tự động như cũ (rủi ro thấp).
- **Audit riêng cho ghép chéo đơn vị**: hành động `hoc_sinh.add_guardian_cross_org` (khác
  `hoc_sinh.add_guardian` thường), ghi rõ đơn vị gốc của hồ sơ dùng chung.
- **Cấp quyền tường minh theo A04**: `createGuardianAccount` giờ đảm bảo tài khoản phụ huynh
  luôn có bản ghi `NguoiDungVaiTroDonVi` (vai trò `phu_huynh`) cho đúng đơn vị đang thao tác
  khi dùng lại tài khoản đã tạo ở đơn vị khác — không chỉ dựa vào liên kết
  `PhuHuynh.nguoiDungId` để suy ra quyền, giữ đúng nguyên tắc "phân quyền theo từng đơn vị".
- **Portal chỉ gộp đơn vị đã được cấp quyền**: `getParentPortalOverview`
  (`server/services/portal.service.ts`) lọc theo `NguoiDungVaiTroDonVi` đang hoạt động, không
  tin tưởng tuyệt đối mọi dòng `PhuHuynh` tìm theo `nguoiDungId`.
- Chi tiết đầy đủ (nguy cơ, luồng, test case): `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`
  mục 11. Checklist D03 cập nhật theo (`docs/00_MASTER_CHECKLIST.md`).

Các vấn đề khác phát hiện khi rà soát khung Portal, đã sửa trong cùng đợt:

- **Route mặc định sau đăng nhập / `/`**: trước đó đổi thẳng sang Portal cho **mọi** vai trò
  (kể cả học vụ/kế toán/tuyển sinh/quản trị hệ thống), trong khi Portal của các vai trò này
  mới chỉ là khung tĩnh (`portalRoles` trong `config/portal.ts`), chưa có dữ liệu thật. Thêm
  `getDefaultLandingPath()` — chỉ đưa vai trò `phu_huynh` vào Portal, các vai trò còn lại vẫn
  về `/dashboard` như trước. Portal các vai trò khác vẫn vào được qua `/portal/:roleSlug`.
- **2 quick-link Portal trỏ cứng ID bản ghi mẫu**: `to: "/chuong-trinh/1"` (học vụ) và
  `to: "/finance/phieu-thu/1"` (kế toán) trong `config/portal.ts` — đổi về trang danh sách an
  toàn (`/classes`, `/finance`).
- **Lỗi thứ tự hook ở `PortalLandingPage.tsx`**: một nhánh `return <Navigate />` sớm nằm trước
  `useEffect`, vi phạm Rules of Hooks (số hook gọi ra không cố định giữa các lần render). Đưa
  cả 2 nhánh điều hướng sớm xuống sau toàn bộ hook.
- **Nhật ký hệ thống thiếu nhãn**: `SystemAuditLogPage.tsx` bổ sung nhãn cho
  `thong_bao.mark_read`, `trao_doi.create`, `hoc_sinh.add_guardian_cross_org` và các hành động
  `hoc_sinh.*` liên quan phụ huynh vốn chưa từng có nhãn từ trước.
- **Dọn nhỏ**: bỏ 2 type alias thừa (`HocSinhLookupItem`, `LopHocLookupItem`) trùng hệt kiểu
  gốc, không dùng ở đâu khác.
- **Định dạng**: phần code mới (I01-I04, Portal) và một số file có sẵn bị thụt lề lại thành
  6-space không nhất quán với chuẩn 2-space toàn repo (nhiều khả năng do editor khác cấu
  hình). Thêm `.prettierrc.json` (2-space, trailing comma) và chạy `prettier --write` lại toàn
  bộ file bị ảnh hưởng trong đợt này để đưa về đúng chuẩn.
- Kiểm tra: `pnpm typecheck`, `pnpm build` — PASS.

### Portal phụ huynh: hiển thị thông tin chung, quản lý chi tiết theo đơn vị (2026-07-22)

Theo đúng 3 tình huống người dùng nêu ra (nhiều con nhiều đơn vị, một con nhiều đơn vị, nhiều
con một đơn vị), chỉnh lại trang `/portal/parent`:

- `getParentPortalOverview` (`server/services/portal.service.ts`) bỏ tham số `donViId` — không
  còn phụ thuộc "đơn vị đang chọn" để tính toán dữ liệu. Trả thêm `organizations`: danh sách
  con được nhóm theo từng đơn vị (`ParentPortalOrganizationGroup`), bên cạnh `children`/
  `upcomingSessions` dạng phẳng (dùng để tính số liệu tổng — số con, số lớp, số buổi sắp tới).
- `PortalLandingPage.tsx`: phần đầu trang ("Thông tin chung") không còn gắn với mã phụ huynh
  của một đơn vị cụ thể (bỏ `selectedGuardian` theo `donViId` hiện tại, chỉ còn một hồ sơ đại
  diện — vì các dòng `PhuHuynh` ở nhiều đơn vị đều là cùng một người). Phần "Con của bạn" tách
  thành nhiều `SectionCard`, mỗi thẻ ứng với một đơn vị, chứa (các) con đang học ở đó.
- Có chủ đích **giữ nguyên** bước chọn đơn vị làm việc sau đăng nhập — không đổi luồng phiên
  đăng nhập; đây chỉ là thay đổi trong nội dung trang Portal.
- Có chủ đích **không** thêm nút "vào đơn vị này" vì vai trò `phu_huynh` hiện chưa được seed
  quyền nào khác ngoài Portal — chưa có trang nội bộ nào để dẫn tới sau khi chuyển đơn vị.
- Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md` mục 11.
- Kiểm tra: `pnpm typecheck`, `pnpm build` — PASS. Chưa test tay qua trình duyệt (cần dữ liệu
  mẫu phụ huynh có con ở nhiều đơn vị + đăng nhập thật để xác nhận hiển thị đúng).

### Bỏ lớp kiểm tra phân quyền theo đơn vị thừa ở Portal phụ huynh (2026-07-22)

Test tay với tài khoản thật (`0933873165` — "Nghia Nguyen") lộ ra lỗi: đăng nhập báo "Không
tìm thấy hồ sơ phụ huynh trong hệ thống", dù hồ sơ `PhuHuynh`/`HocSinh` của tài khoản này thật
sự tồn tại (đã chuyển sang "Trường Mầm non Hoa Nắng" từ 2026-07-21).

- Nguyên nhân: bản đổi ở mục trên có thêm một lớp kiểm tra ở `getParentPortalOverview` — chỉ
  gộp những đơn vị mà tài khoản có bản ghi phân quyền `phu_huynh` (`NguoiDungVaiTroDonVi`)
  đang hoạt động. Tài khoản này chỉ có đúng một bản ghi phân quyền, gán ở **đơn vị hệ thống**
  (còn sót lại từ trước khi chuyển dữ liệu `PhuHuynh` sang Mầm Non Hoa Nắng — lần chuyển đó
  không chuyển luôn bản ghi phân quyền). Lớp kiểm tra mới lọc mất đúng hồ sơ hợp lệ.
- Xác nhận lại với người dùng mô hình đúng: phụ huynh đăng nhập mặc định vào một đơn vị neo
  chung (ví dụ đơn vị hệ thống — không mang ý nghĩa nghiệp vụ), còn **chi tiết đơn vị luôn suy
  ra theo con** (qua `HocSinh.donViId`), không cần một bản ghi phân quyền `phu_huynh` riêng cho
  từng đơn vị con học.
- Sửa: bỏ hẳn lớp kiểm tra phân quyền theo đơn vị đó ở `server/services/portal.service.ts` —
  quay lại tin thẳng mọi hồ sơ `PhuHuynh` tìm theo `nguoiDungId`. Bỏ luôn phần tự cấp thêm vai
  trò `phu_huynh` theo đơn vị hiện tại ở `createGuardianAccount`
  (`server/services/phuHuynh.service.ts`) — không còn cần thiết, và nếu giữ sẽ khiến tài khoản
  phụ huynh nhiều đơn vị bị bắt chọn đơn vị làm việc ở màn hình đăng nhập (mất tính "mặc định
  vào một đơn vị neo chung, đơn giản").
- Điểm chốt an toàn thực sự vẫn giữ nguyên và không đổi: bước xác nhận
  `CrossOrgGuardianConfirmError` khi ghép phụ huynh khác đơn vị (`addGuardianToStudent`) — chỉ
  nhân viên `hoc_sinh.quan_ly` sau khi xác nhận rõ ràng mới tạo được liên kết, nên tin thẳng
  `PhuHuynh.nguoiDungId` là đủ, không cần thêm một lớp phân quyền theo đơn vị nữa.
- Không cần sửa dữ liệu của tài khoản `0933873165` — bỏ lớp kiểm tra là đủ để hồ sơ hợp lệ
  hiện đúng trở lại, không cần thao tác gán lại vai trò qua `/users/13`.
- Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md` mục 11.
- Kiểm tra: `pnpm typecheck`, `pnpm build` — PASS.

### Đối chiếu tham khảo ngoài + phân bổ luồng/layout cho phần còn thiếu (2026-07-22)

Đối chiếu BPD gốc (`extracted.txt`) với tính năng thật của Easy Edu/CenterOnline/DotB EMS
(trung tâm ngoại ngữ), KidsOnline/OneKids/MISA EMIS Kindergarten (mầm non), FACTS/OpenEduCat
(kiến trúc lớn) — chỉ rút phần đã có trong BPD mà app chưa làm, không sao chép tính năng ngoài
phạm vi (marketing/CRM, camera/AI điểm danh, chat realtime/SMS-Zalo, vận chuyển/căn tin/payroll
— đều là các câu hỏi BPD mục 15 còn để ngỏ, không phải yêu cầu đã chốt).

Cập nhật `docs/00_MASTER_CHECKLIST.md`:

- Thêm mới **mục L. Báo cáo & Dashboard** (tương ứng M15/REP-01..04 trong BPD, trước đây không
  có chữ cái riêng nên rơi mất dấu vết): L01 Dashboard vận hành (hiện đang số liệu cứng ở
  `DashboardPage.tsx`), L02 báo cáo tuyển sinh, L03 báo cáo chuyên cần/học tập — cả 3 chưa
  làm, đã ghi rõ luồng và layout dự kiến (dùng khuôn `FinanceReportPage`/`/finance/bao-cao`
  làm mẫu). L04 báo cáo tài chính đã có (H09) nên đánh dấu xong.
- Đánh dấu lại **J01 Portal phụ huynh = đã có phần lõi** (trước đây để trống hoàn toàn) — tổng
  quan chung + nhóm theo đơn vị từng con, xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`
  mục 11.
- Phát hiện thêm khi rà lại J03: quick-link Portal phụ huynh trỏ tới `/notifications` và
  `/communications` nhưng vai trò `phu_huynh` chưa được seed bất kỳ quyền nào cho 2 route này —
  bấm vào sẽ lỗi 403. Ghi nhận là việc cần xử lý trước khi tick J03, chưa sửa trong đợt này.
- Ghi phân bổ luồng/layout cho các mục còn thiếu quan trọng nhất, chưa code, chỉ lên kế hoạch
  vị trí đặt tính năng để lần sau làm nhanh hơn:
  - **C05** (kiểm tra đầu vào): section mới trong `LeadDetailPage`, chỉ hiện với đơn vị
    `ngoai_ngu`.
  - **D02+F06+G07** (mầm non): gộp thành 1 "Nhật ký ngày" — mở rộng ngay trang `/attendance`
    theo cấu hình `loaiHinhDaoTao = mam_non`, không tạo trang/module riêng.
  - **H08** (hoàn phí/chuyển phí/bảo lưu): nút mới trong chi tiết khoản phải thu ở
    `KyThuDetailPage`, cần quy trình duyệt riêng — đây là khoảng trống tài chính lớn nhất còn
    lại, cả 4 sản phẩm tham khảo đều coi là tính năng lõi.
  - **J06** (học phí trong Portal): thêm block "Học phí" chỉ đọc vào từng thẻ con trong
    `PortalLandingPage.tsx`, tái dùng dữ liệu `KhoanPhaiThu`/`PhieuThu` đã có, không cần route
    mới — ưu tiên hơn J02/J04 vì rẻ và dữ liệu đã sẵn có.
- Không đổi mô hình tài chính (kỳ thu tách khỏi khoản phải thu) theo FACTS — cách hiện tại phù
  hợp hơn với thu học phí theo tháng/kỳ ở VN.
- Ghi nhận vào backlog kiến trúc (chưa cấp thiết): BPD gốc đề xuất tách `Person` dùng chung cho
  `HocSinh`/`PhuHuynh`/`GiaoVien`/`NguoiDung`, hiện vẫn là các bảng độc lập — giống FACTS/
  OpenEduCat cũng làm vậy, nhưng để càng lâu retrofit sau càng tốn.
- Không cần sửa code trong đợt này — chỉ cập nhật tài liệu/checklist để phân bổ kế hoạch.

---

## L01 + J06 + J03 — Dashboard thật, học phí trong Portal, sửa thông báo/trao đổi cho phụ huynh (2026-07-22)

Làm 3 việc ưu tiên demo đã thống nhất ở mục trên, theo đúng thứ tự đề xuất.

**L01 — Dashboard vận hành thật:**
- Thêm `server/db/dashboard.repository.ts` (đếm học sinh đang học, lớp đang học, lead mới từ
  đầu tháng — có bản gộp cho đơn vị hệ thống) và `sumCongNoAllDonVi` trong
  `taiChinh.repository.ts` (bản gộp của `sumCongNoByDonVi` sẵn có).
- `server/services/dashboard.service.ts` (`getDashboardSummary`) gộp thêm lịch học hôm nay
  (tái dùng `listThoiKhoaBieu` như Portal đã dùng) — route mới `GET /api/dashboard/summary`.
- `DashboardPage.tsx` bỏ hẳn số liệu cứng (`"486"`, `"28"`...) và 4 lớp học giả lập; 4 thẻ
  KPI + bảng "Lịch học hôm nay" giờ đọc đúng dữ liệu thật theo đơn vị đang chọn (gộp cho đơn vị
  hệ thống, riêng lịch học hôm nay trả rỗng ở đơn vị hệ thống vì không tổ chức lớp — đúng phạm
  vi đã chốt ở A01).

**J06 — Học phí trong Portal phụ huynh:**
- Thêm `listKhoanPhaiThuByHocSinh` (`taiChinh.repository.ts`) — toàn bộ khoản phải thu của một
  học sinh kèm tên kỳ thu.
- `getParentPortalOverview` gọi thêm hàm này cho từng con, trả kèm `khoanPhaiThu` trong mỗi
  phần tử `children`.
- `PortalLandingPage.tsx` thêm block "Học phí" (chỉ đọc) vào mỗi thẻ con: tên kỳ thu, tổng
  tiền, trạng thái, số còn lại nếu có. Chưa làm phần xem biên nhận chi tiết (`PhieuThuDetailPage`
  đang khoá theo `tai_chinh.xem`/`tai_chinh.quan_ly`) — để bước sau.

**J03 — Thông báo mở cho phụ huynh, trao đổi chuyển hẳn vào Portal:**
- `server/middleware/permission.middleware.ts` thêm `requireAnyPermissionOrRole` — cho qua nếu
  có 1 trong các mã quyền liệt kê HOẶC vai trò tại đơn vị hiện tại nằm trong danh sách vai trò
  liệt kê (dùng đúng cách `portal.router.ts` đã kiểm tra `vaiTro` trực tiếp).
- `thongBao.router.ts`: `GET /` và `POST /:id/da-doc` dùng `requireAnyPermissionOrRole` với vai
  trò `phu_huynh` — chỉ áp dụng cho xem/xác nhận đọc, tạo thông báo vẫn management-only.
- Vấn đề phát sinh: đơn vị "đang chọn" của phụ huynh thường là một đơn vị neo chung (ví dụ đơn
  vị hệ thống — xem ca `0933873165` ở mục trước), không phải đơn vị của con. Nếu dùng thẳng
  `loaiDonVi === "he_thong"` để quyết định gộp, phụ huynh sẽ thấy TOÀN BỘ thông báo của mọi đơn
  vị trong hệ thống, không chỉ đơn vị con học. Sửa: thêm `listThongBaoByDonViIds` (gộp đúng
  danh sách đơn vị) và `findThongBaoByIdAny`/`getGuardianDonViIds`
  (`phuHuynh.service.ts`) — khi người gọi là phụ huynh không có quyền quản lý, `listThongBao`/
  `confirmThongBaoDaDoc` gộp đúng theo đơn vị của các con, bỏ qua đơn vị đang chọn.
- `ThongBaoPage.tsx`: cột "Đơn vị" hiện thêm cho phụ huynh (không chỉ đơn vị hệ thống); phụ
  huynh xem tên đơn vị dạng chữ thường (không dùng `OrgLink` — phụ huynh không có phiên làm
  việc ở đơn vị con nên đổi đơn vị qua `OrgLink` sẽ thất bại).
- **Trao đổi**: quyết định KHÔNG mở trang `/communications` cho phụ huynh — trang này gọi
  `listHocSinhApi`/`listLopHocApi` để đổ dropdown lọc + form tạo mới, đòi `hoc_sinh.xem`/
  `lop_hoc.xem` mà phụ huynh không có; nếu cấp quyền đó sẽ lộ toàn bộ danh sách học sinh/lớp
  của đơn vị cho phụ huynh — vi phạm rõ ràng "Thông tin nhạy cảm của học viên khác... không
  được hiển thị" (BPD 7.7). Thay vào đó: `getParentPortalOverview` gọi thêm `listTraoDoi` (tái
  dùng nguyên hàm service của I04) lọc theo đúng `hocSinhId` cho từng con, hiển thị "Trao đổi
  gần đây" (chỉ xem, 5 dòng mới nhất) ngay trong thẻ con ở Portal. 2 quick-link Portal từng trỏ
  `/communications` đổi về `/portal/parent` (tự tham chiếu, vì đã hiện sẵn ngay tại đó).
- **Phát hiện thêm (lỗi có sẵn từ trước, không liên quan đợt sửa phụ huynh)**: khi đọc kỹ
  `traoDoi.repository.ts` để tái dùng, phát hiện `client/src/features/traoDoi/traoDoiApi.ts`
  gộp dữ liệu sai — server luôn trả `{traoDoi, hocSinh, lopHoc, nguoiTao, donVi}` (các trường
  là anh em, không lồng trong `traoDoi`), nhưng client cũ chỉ gộp `{...row.traoDoi, donVi}`,
  làm rớt hẳn `hocSinh`/`lopHoc`/`nguoiTao`. Trang `/communications` (`TraoDoiPage.tsx`) dùng
  `item.hocSinh.hoTen`/`item.nguoiTao.hoTen` trực tiếp — lẽ ra sẽ lỗi runtime ngay khi hiển thị
  bất kỳ dòng trao đổi nào (module vừa làm ngày 22/07, có thể chưa ai kịp test qua UI thật với
  dữ liệu thật). Đã sửa `flattenTraoDoiRow` gộp đủ cả 4 trường cho cả `listTraoDoiApi` và
  `createTraoDoiApi`.
- Cập nhật `config/portal.ts`: 2 quick-link trao đổi đổi hướng, 3 "notices" của vai trò phụ
  huynh viết lại cho khớp thực tế (trước đây nói "chưa dùng được"/"cần bổ sung quyền sau" —
  giờ đã làm).
- Checklist: J01/J03/J06/L01 cập nhật trong `docs/00_MASTER_CHECKLIST.md`.
- Kiểm tra: `pnpm typecheck`, `pnpm build` — PASS. Chưa test tay qua trình duyệt thật (đề nghị
  test lại với tài khoản `0933873165` — giờ nên thấy đúng thông báo/trao đổi/học phí của con ở
  Trường Mầm non Hoa Nắng, không lẫn dữ liệu đơn vị khác).

### Hotfix — Vỡ trang `/portal/parent` khi có trao đổi (2026-07-22)

Người dùng test tay qua trình duyệt thật ngay sau mục trên, phát hiện `RangeError: Invalid
time value` tại `formatDateTime` trong `PortalLandingPage.tsx`, vỡ toàn bộ trang khi một con có
ít nhất một dòng trao đổi.

- Nguyên nhân: đúng lỗi "nested vs phẳng" vừa tìm và sửa ở `traoDoiApi.ts` (mục trên), nhưng
  lần này tự lặp lại ở phía server — `getParentPortalOverview` gán thẳng kết quả `listTraoDoi`
  (dạng `{traoDoi: {...}, hocSinh, lopHoc, nguoiTao, donVi}`) vào `child.traoDoi` mà không gỡ
  phẳng, trong khi kiểu `ParentPortalTraoDoi` ở client khai báo các trường (`id`, `createdAt`,
  `nguoiGuiVaiTro`...) nằm trực tiếp. Riêng phần `khoanPhaiThu` cùng hàm đã gỡ phẳng đúng —
  chỉ sót đúng `traoDoi`.
- Sửa: `server/services/portal.service.ts` gỡ phẳng `traoDoi` giống hệt cách đã làm với
  `khoanPhaiThu` (map lấy đúng field từ `item.traoDoi`, giữ `item.nguoiTao`).
- Test tay qua trình duyệt thật (đăng nhập `0933873165`): Portal hiện đúng — 2 con, nhóm đúng
  2 đơn vị (Trung tâm Ngoại ngữ Quận 8, Trường Mầm non Hoa Nắng), mục "Trao đổi gần đây" của
  "Nguyen Khang" hiện đúng ngày giờ + nội dung, không còn lỗi console. `pnpm typecheck`,
  `pnpm build` — PASS.
