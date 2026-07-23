# Phân tích — Trải nghiệm vai trò Quản trị hệ thống (đơn vị `he_thong`)

> Rà soát theo từng vai trò để chuẩn bị demo full (2026-07-23). Vai trò đầu tiên: quản trị hệ
> thống (`quan_tri_he_thong`, đứng ở đơn vị gốc `loaiDonVi = 'he_thong'`). Ghi lại quyết định
> thiết kế ở đây để không lặp lại tranh luận khi rà soát các vai trò tiếp theo.
>
> Cập nhật (cùng ngày, sau phản hồi thêm khi xem qua UI thật): 5 điểm bổ sung.
> 1. **Scrollbar sidebar** — nền trắng mặc định không khớp tông xanh sidebar, thêm
>    `scrollbar-color`/`::-webkit-scrollbar-*` khớp theme (`sidebar-balance.css`).
> 2. **Dropdown "Đơn vị cha"** khi tạo đơn vị mới vẫn liệt kê "Hệ thống quản lý giáo dục" —
>    thừa và có thể gây lệch dữ liệu: dữ liệu thật (TTNN-Q8, MN-HOA-NANG) đều có
>    `donViChaId` = id thật của đơn vị hệ thống, không phải NULL, trong khi chọn "Không có
>    (đơn vị cấp 1)" trước đây submit `donViChaId: null` — khiến đơn vị mới không nằm trong
>    cây (thành gốc riêng). Sửa: bỏ "Hệ thống" khỏi danh sách chọn, và khi chọn "Không có"
>    thì tự động dùng đúng id đơn vị hệ thống thay vì null.
> 3. **Menu nhóm "Hệ thống"** (Cây đơn vị, Vai trò·Phân quyền, Nhật ký hệ thống, Cấu hình hệ
>    thống) trước đây hiện ở MỌI đơn vị vì không có điều kiện lọc theo cấp đơn vị — đây là các
>    nghiệp vụ quản trị toàn hệ thống, chỉ nên làm ở đúng trang quản trị (đơn vị hệ thống), để
>    tránh rải rác. Thêm cờ `onlyAtHeThong` (ngược với `hideAtHeThong` đã thêm ở vòng trước),
>    ẩn 4 mục này khi đứng ở đơn vị con. Riêng "Quản lý người dùng" vẫn hiện ở mọi đơn vị —
>    nghiệp vụ tạo tài khoản nhân sự vẫn cần làm theo từng đơn vị.
> 4. **"Trao đổi phụ huynh"** không có ý nghĩa ở đơn vị hệ thống (không có lớp/học sinh riêng)
>    — thêm `hideAtHeThong`. Đồng thời chuyển hẳn UI ghi/xem trao đổi vào trong từng lớp
>    (`ClassDetailPage.tsx`, section mới "Trao đổi phụ huynh", học sinh chọn từ đúng roster
>    lớp, `lopHocId` cố định = lớp đang xem) — giữ nguyên trang `/communications` gốc cho nhu
>    cầu xem gộp nhiều lớp (2 nơi dùng chung API, dữ liệu nhất quán).
> 5. Xác nhận lại: hệ thống luôn có đúng một đơn vị `he_thong` được tạo sẵn từ khi khởi tạo
>    (seed), không phải thứ người dùng tự tạo — đây là lý do nó không nên xuất hiện như một
>    lựa chọn "cha" tường minh (mục 2) và không nên tạo thêm được (đã chặn ở vòng trước).
>
> Cập nhật (2026-07-23): siết thêm mục 2 — quyết định nghiệp vụ hiện tại là cây đơn vị chỉ có
> **một cấp** (mọi trường/trung tâm/cơ sở nằm trực tiếp dưới đơn vị hệ thống, không đơn vị nào
> chứa đơn vị con khác), không phải "cho chọn cha nhưng mặc định Hệ thống" như bản trước. Bỏ hẳn
> field "Đơn vị cha" khỏi form tạo đơn vị (`OrganizationTreePage.tsx`); server
> (`donVi.service.ts#createDonViUnit`) không nhận `donViChaId` từ client nữa, luôn tự gán vào
> đơn vị hệ thống gốc (`findHeThongDonVi`). Cột `donViChaId` và cây cha-con hiển thị
> (`buildDonViTree`) giữ nguyên — khi nghiệp vụ thật cần nhiều cấp (VD: cơ sở thuộc trường), chỉ
> cần nới điều kiện gán cha ở service và mở lại field chọn cha ở form, không phải đổi schema.

## 1. Yêu cầu và hiện trạng trước khi sửa

Người dùng yêu cầu (rút gọn):
1. Đăng nhập vào thấy dashboard/menu "đặc thù cho quản trị", chỉ hiện thông tin cần thiết.
2. Cho tạo đơn vị, xem đơn vị theo hình cấu trúc (orgchart); **không** cho tạo thêm đơn vị cấp
   hệ thống.
3. Đứng ở đơn vị con, vai trò vẫn là quản trị hệ thống (không đổi vai trò khi đổi đơn vị).
4. Ở trang User của đơn vị hệ thống, chỉ tạo được vai trò mang tính hệ thống (Quản lý đơn vị,
   Kế toán tổng...); ở đơn vị con, tạo được các vai trò vận hành (giáo viên, tư vấn, tuyển
   sinh, học vụ, kế toán, quản lý đơn vị).
5. **Không** cho tạo user vai trò phụ huynh ở màn hình User (chỉ tạo được từ hồ sơ học sinh),
   nhưng vẫn cho xem/reset mật khẩu tài khoản phụ huynh sẵn có.
6. Các module khác (học sinh, giáo viên, lịch học...) ở đơn vị hệ thống nên là "view quản trị"
   (chỉ xem, gộp toàn hệ thống), không phải "view vận hành".
7. Menu đặc thù, đổi theo đơn vị đang đứng (hệ thống ↔ đơn vị con).

Rà soát code thật (không đoán) trước khi sửa cho thấy: (3) đã đúng sẵn — vai trò không gắn với
đơn vị đang chọn, `he_thong.quan_tri` là quyền toàn cục. (6) đã làm gần đủ — Học sinh/Giáo
viên/Lớp học/Tài chính/Tuyển sinh/Thông báo/Trao đổi đã có "xem gộp" khi đứng ở hệ thống (ẩn
form tạo/sửa, thêm cột "Đơn vị"), chỉ riêng **Lịch học** chưa có. Các mục còn lại (1), (2), (4),
(5), (7) chưa làm.

## 2. Quyết định thiết kế

### "Kế toán tổng" — không tạo vai trò mới

Hệ thống chỉ có 8 vai trò cố định (`database/006_full_reset_schoolcenter.sql`), trong đó
`ke_toan` có `phamVi = 'don_vi'` — gán được ở bất kỳ đơn vị nào, kể cả đơn vị hệ thống. Các
trang tài chính (`FinancePage.tsx`, `FinanceReportPage.tsx`) đã có sẵn nhánh "xem gộp toàn hệ
thống" khi `currentOrganization.loaiDonVi === 'he_thong'`. Vậy gán `ke_toan` cho một người tại
đơn vị hệ thống **tự nhiên** cho họ đúng trải nghiệm "kế toán tổng" (xem công nợ/doanh thu gộp
toàn trường/trung tâm) mà không cần thêm bảng/vai trò riêng — đúng tinh thần "không tạo mới nếu
tái dùng được" đã áp dụng xuyên suốt dự án.

### Org chart — cây thụt lề, không canvas

`OrganizationTreePage.tsx` trước là bảng phẳng. Đổi sang cây thụt lề dựng ngay trong component
từ danh sách phẳng có sẵn (nhóm theo `donViChaId`, đệ quy), hiển thị bằng `margin-left` +
`border-left` làm đường nối. Không làm canvas/SVG đồ hoạ phức tạp — đúng mức đầu tư phù hợp với
phong cách các trang khác trong hệ thống (không có trang nào dùng thư viện vẽ đồ hoạ), vẫn thể
hiện đúng "hình cấu trúc" cha-con nhiều cấp theo đúng yêu cầu.

### Menu đặc thù ở hệ thống — chỉ ẩn 2 mục

Chỉ ẩn **Lịch học** và **Điểm danh** khi đứng ở đơn vị hệ thống — hai mục duy nhất không có
(và không cần) nhánh "xem gộp", vì đơn vị hệ thống vốn không tổ chức lớp/lịch riêng (đã chốt ở
`docs/analysis/A01_cay_don_vi.md` mục 11). Giữ nguyên mọi mục khác (Học sinh, Giáo viên, Lớp
học, Học phí, Tuyển sinh, Thông báo, Trao đổi) vì đã có "xem gộp" thật sự hữu ích cho vai trò
giám sát xuyên đơn vị — ẩn thêm sẽ làm mất khả năng đó mà không có lý do nghiệp vụ.

Cơ chế: thêm field `hideAtHeThong?: boolean` vào `AppRouteDefinition`
(`client/src/routes/appRoutes.tsx`), lọc thêm trong `Sidebar.tsx` — tách biệt với
`loaiHinhDaoTao` (lọc theo loại hình đào tạo của đơn vị, không phải theo cấp đơn vị).

### Vai trò được tạo theo ngữ cảnh đơn vị

`server/services/user.service.ts#getRoles(loaiDonVi)`:
- `loaiDonVi === 'he_thong'` → chỉ `quan_ly_don_vi`, `ke_toan`.
- còn lại → mọi vai trò trừ `phu_huynh`.

Áp dụng ngay ở tầng trả danh sách (không phải lọc phía client) để client luôn nhận đúng danh
sách theo đơn vị đang chọn, tự động cập nhật khi đổi đơn vị ở Topbar (không cần sửa gì thêm ở
`UserManagementPage.tsx` — trang này đã gọi lại API vai trò mỗi khi
`auth.currentOrganization.id` đổi).

Chặn tạo `phu_huynh` qua đường này ở **cả hai lớp**: service (`createUser` ném lỗi nếu
`role.maVaiTro === 'phu_huynh'`) để không thể lách qua gọi API trực tiếp, và service trả danh
sách vai trò (`getRoles`) để UI không hiện lựa chọn đó ngay từ đầu. Không đụng
`createGuardianAccount` (`phuHuynh.service.ts`) — đường tạo tài khoản phụ huynh hợp lệ duy nhất,
đã xác nhận hoạt động đúng qua UI thật (xem C07, `docs/00_MASTER_CHECKLIST.md`). Không đụng
hành động xem/khoá/reset mật khẩu ở `UserManagementPage.tsx` — các hành động đó là generic theo
từng dòng, không phân biệt vai trò, nên tài khoản phụ huynh sẵn có vẫn thao tác được bình
thường.

## 3. Giới hạn còn lại (có chủ đích, chưa làm)

- Vẫn chưa có UI gán vai trò `quan_tri_he_thong` (phạm vi hệ thống) — chỉ gán được qua seed,
  đúng chủ đích cũ (tránh leo thang quyền). Không nằm trong đợt sửa này.
- Dashboard ở hệ thống mới chỉ thêm khối "Lối vào nhanh cho quản trị", chưa có widget quản trị
  chuyên biệt nào khác (ví dụ số đơn vị theo trạng thái, số user theo vai trò) — 4 `StatCard`
  hiện tại giữ nguyên (đã đúng, chỉ là số liệu gộp thay vì theo một đơn vị).
