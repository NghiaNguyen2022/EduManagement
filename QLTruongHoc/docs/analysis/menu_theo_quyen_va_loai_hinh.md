# Phân tích — Kiến trúc menu theo quyền và theo loại hình đào tạo

> Rà soát lại yêu cầu ban đầu (2026-07-21) và đối chiếu với code thật.

## 1. Yêu cầu gốc (người dùng xác nhận lại 2026-07-21)

1. Quản trị hệ thống quản lý tất cả nên thấy được toàn bộ đơn vị.
2. Người dùng vai trò khác phải được phân quyền vào từng đơn vị cụ thể; sau khi đăng nhập
   bắt buộc chọn đơn vị làm việc.
3. Menu hiển thị khác nhau tuỳ **loại hình đào tạo** của đơn vị đang chọn (mầm non/ngoại
   ngữ/tin học).
4. Menu hiển thị khác nhau tuỳ **vai trò/quyền** của người dùng tại đơn vị đó.

## 2. Đối chiếu với code thật

| # | Yêu cầu | Trạng thái | Bằng chứng |
| --- | --- | --- | --- |
| 1 | System admin thấy toàn bộ đơn vị | **Đã đúng** | `getDonViTree` trả về toàn bộ danh sách nếu `isSystemAdmin`; `requirePermission` bỏ qua kiểm tra quyền cho `he_thong.quan_tri`. |
| 2 | Phân quyền theo đơn vị + bắt buộc chọn đơn vị khi đăng nhập | **Đã đúng** | `NguoiDungVaiTroDonVi` gắn user-vai trò-đơn vị; `App.tsx` chặn vào `AppShell` nếu `!auth.currentOrganization`, bắt buộc qua `SelectOrganizationPage`. |
| 3 | Menu khác theo loại hình đào tạo | **Chưa có** | `Sidebar.tsx` chỉ lọc theo `route.permissions`; không có điều kiện nào tham chiếu `loaiHinhDaoTao` của `currentOrganization`. |
| 4 | Menu khác theo vai trò/quyền | **Đã có, gián tiếp qua quyền** | `appRoutes[].permissions` + quyền được seed riêng theo từng vai trò (`008_seed_default_role_permissions.sql`) → mỗi vai trò tự nhiên thấy menu khác nhau. Không lọc trực tiếp theo `maVaiTro` (chủ đích — xem mục 4 bên dưới). |

## 3. Quyết định kiến trúc (đề xuất, cần code hoá)

- Thêm trường tuỳ chọn `loaiHinhDaoTao?: LoaiHinhDaoTao[]` vào `AppRouteDefinition`
  (`appRoutes.tsx`). Không khai báo = hiển thị cho **mọi** loại hình (menu dùng chung).
- Điều kiện hiển thị một mục menu = **có quyền** (như hiện tại, kể cả bypass system admin)
  **VÀ** (`route.loaiHinhDaoTao` không khai báo **HOẶC** chứa `loaiHinhDaoTao` của đơn vị
  đang chọn).
- Áp dụng lọc loại hình **cho cả system admin** — vì mục tiêu là menu phản ánh đúng nghiệp
  vụ của đơn vị đang đứng, không phải phản ánh quyền hạn của người xem. System admin vẫn
  thấy đầy đủ menu dùng chung + menu Hệ thống ở bất kỳ đơn vị nào, nhưng không thấy menu
  chuyên biệt mầm non khi đang chọn một trung tâm ngoại ngữ.
- Đơn vị `loaiDonVi = "he_thong"` (node gốc, `loaiHinhDaoTao = "khac"`) chỉ thấy menu dùng
  chung + menu Hệ thống, không thấy menu nghiệp vụ chuyên biệt theo loại hình nào.
- **Không** lọc menu trực tiếp theo `maVaiTro` (tên vai trò). Lý do: quyền (`Quyen`) đã là
  lớp trừu tượng đúng cho việc này — thêm vai trò mới chỉ cần seed đúng quyền, không phải
  sửa danh sách vai trò cứng trong code menu. Giữ đúng nguyên tắc đã có ở
  `role.service.ts` (chặn theo `phamVi`, không so khớp tên vai trò cứng).

## 4. Phạm vi áp dụng hiện tại

- Sprint 0-1 (nền tảng, tuyển sinh, học sinh...) đều là nghiệp vụ **dùng chung** theo BPD
  mục 4 (bảng "Nhóm nghiệp vụ") — chưa có mục menu nào cần gắn `loaiHinhDaoTao` ngay bây
  giờ. Chỉ chuẩn bị sẵn cơ chế.
- Sprint 7 (Nghiệp vụ chuyên biệt — mầm non: đón/trả, sức khỏe; ngoại ngữ/tin học: đầu vào,
  kỹ năng) sẽ là nơi thật sự dùng trường `loaiHinhDaoTao` trên menu.

## 5. Checklist test khi code

- [ ] Đơn vị `ngoai_ngu` không thấy menu gắn `loaiHinhDaoTao: ["mam_non"]` (khi có menu đó).
- [ ] Đơn vị `mam_non` không thấy menu gắn `loaiHinhDaoTao: ["ngoai_ngu", "tin_hoc"]`.
- [ ] Menu không khai báo `loaiHinhDaoTao` hiện ở mọi loại hình (regression Sprint 0/1).
- [ ] System admin đứng ở đơn vị `ngoai_ngu` không thấy menu chỉ dành `mam_non`.
- [ ] Đơn vị `he_thong` chỉ thấy menu dùng chung + nhóm Hệ thống.
