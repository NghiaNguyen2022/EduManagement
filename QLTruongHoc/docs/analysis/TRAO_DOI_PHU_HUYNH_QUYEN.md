# Phân tích — Sửa quyền Trao đổi phụ huynh (I04)

> 2026-07-27, theo phản hồi: "Tài khoản cho tuyển sinh — không có quyền vào Trao đổi phụ huynh
> thì nên ẩn menu đi".

## 1. Hiện trạng trước khi sửa

Ma trận quyền cũ (`traoDoi.router.ts`, `appRoutes.tsx`, `TraoDoiPage.tsx`, `ClassDetailPage.tsx`)
dùng chung một danh sách: `hoc_sinh.xem`, `lop_hoc.xem`, `hoc_sinh.quan_ly`, `lop_hoc.quan_ly`,
`tuyen_sinh.quan_ly` cho cả XEM lẫn GHI. Rà soát từng vai trò:

| Vai trò | Có quyền nào trong danh sách cũ? | Hệ quả |
|---|---|---|
| `tuyen_sinh`/`tu_van` | `hoc_sinh.xem` (và `tuyen_sinh.quan_ly` với `tuyen_sinh`) | Thấy menu, nhưng trang gọi `listLopHocApi()` không điều kiện — cần `lop_hoc.xem`/`quan_ly` mà họ không có → **vỡ trang khi mở**. |
| `ke_toan` | `hoc_sinh.xem` | Cùng lỗi như trên. |
| `giao_vien` | **Không có mã nào trong danh sách GHI** (`hoc_sinh.quan_ly`/`lop_hoc.quan_ly`/`tuyen_sinh.quan_ly`) — chỉ có `lop_hoc.xem`, `hoc_sinh.xem` (không nằm trong list GHI) | **Không ghi được trao đổi**, dù đây là tính năng làm riêng cho giáo viên (xem `docs/analysis/QUAN_TRI_HE_THONG_UX.md`, mục I04 trong checklist: "chuyển hẳn UI ghi/xem trao đổi vào trong từng lớp"). Bug có sẵn, không phải do đợt sửa này. |
| `hoc_vu`, `quan_ly_don_vi` | `lop_hoc.quan_ly` | Đúng, hoạt động bình thường ở cả 2 phía. |

## 2. Quyết định sửa

Trao đổi phụ huynh gắn với lớp/học sinh trong lớp — chỉ vai trò **thấy được lớp** mới nên
thấy/ghi mục này. Đổi thành 2 danh sách tách biệt, khớp đúng theo BPD 7.4 (giáo viên là actor
chính) và I04:

- **Xem** (`TRAO_DOI_XEM_QUYEN`): `lop_hoc.xem`, `lop_hoc.quan_ly` — đủ để tải danh sách lớp mà
  trang cần, tự động loại kế toán/tuyển sinh/tư vấn (đúng yêu cầu "ẩn menu").
- **Ghi** (`TRAO_DOI_GHI_QUYEN`): `lop_hoc.quan_ly`, `hoc_tap.ghi_nhan` — tái dùng đúng quyền
  "ghi nhận" giáo viên đã có sẵn cho báo giảng/nhận xét (G01-G03), thay vì bắt buộc quyền
  `lop_hoc.quan_ly` (giáo viên không có, chỉ có `lop_hoc.xem`). Không tạo quyền mới.

## 3. Việc đã sửa

- `traoDoi.router.ts`: tách `TRAO_DOI_XEM_QUYEN`/`TRAO_DOI_GHI_QUYEN`, áp cho GET và POST.
- `appRoutes.tsx`: menu "Trao đổi phụ huynh" chỉ hiện với `lop_hoc.xem`/`lop_hoc.quan_ly`.
- `TraoDoiPage.tsx`, `ClassDetailPage.tsx`: điều kiện hiện form "Ghi trao đổi" đổi theo
  `TRAO_DOI_GHI_QUYEN` (khớp server).

## 4. Test tay qua API thật

- `demo_ketoan_nn`: `GET /api/trao-doi` → 403 (trước đây pass). Sidebar không còn mục "Trao đổi
  phụ huynh".
- `demo_giaovien_nn` (reset mật khẩu tạm để test — tài khoản demo, không phải dữ liệu thật):
  `GET /api/trao-doi` → 200; `POST /api/trao-doi` (ghi trao đổi cho học sinh trong lớp) → 201,
  tạo thành công — trước đây sẽ bị 403. Xoá dòng test sau khi xác nhận, không để lại dữ liệu rác.
