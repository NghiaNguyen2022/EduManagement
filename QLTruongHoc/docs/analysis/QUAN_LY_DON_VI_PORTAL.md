# Phân tích — Portal, đề xuất tính năng, thông số báo cáo và quản trị cho vai trò Quản lý đơn vị

> Bắt đầu 2026-07-27. Vai trò `quan_ly_don_vi` (giám đốc/hiệu trưởng đứng ở một trường/trung
> tâm/cơ sở cụ thể) đã có đủ quyền vận hành từ B02 (2026-07-21) nhưng **chưa có Portal riêng**,
> vẫn tạm dùng `/dashboard` — ghi nhận sẵn ở `docs/worklog/ROLE_PORTAL_AUDIT_2026-07-25.md` mục
> "Việc nối sâu tiếp theo" nhưng chưa lên kế hoạch cụ thể. Doc này chốt thiết kế Portal +
> đề xuất tính năng/báo cáo/quản trị cho vai trò này, theo đúng khuôn mẫu đã dùng cho
> `docs/analysis/QUAN_TRI_HE_THONG_UX.md`.

## 1. Hiện trạng

- Quyền: `don_vi.xem`, `don_vi.quan_ly`, `nguoi_dung.xem`, `nguoi_dung.quan_ly`, `phan_quyen.xem`,
  `tuyen_sinh.*`, `hoc_sinh.*`, `lop_hoc.*`, `diem_danh.*`, `hoc_tap.*`, `tai_chinh.*`
  (`database/008_seed_default_role_permissions.sql` mục 2) — rộng nhất trong các vai trò vận
  hành, đúng vai trò người đứng đầu một đơn vị.
- Route: không có `roles: ["quan_ly_don_vi"]` riêng ở bất kỳ đâu trong
  `client/src/routes/appRoutes.tsx` — họ thấy gần như mọi mục menu vận hành (Tuyển sinh, Học
  sinh, Giáo viên, Lớp học, Lịch học, Điểm danh, Tài chính, Thông báo, Trao đổi, Người dùng) nhờ
  lọc theo `permissions`, cộng thêm `/dashboard` (lọc theo `permissions: ["he_thong.quan_tri",
  "don_vi.quan_ly"]`).
- `getDefaultLandingPath` (`client/src/config/portal.ts`) chưa có nhánh cho `quan_ly_don_vi` nên
  rơi vào `/dashboard` mặc định — **đúng là trang tổng quan, nhưng là trang dùng chung với mọi
  vai trò có quyền `don_vi.quan_ly`, không phải màn hình thiết kế riêng cho vai trò này** (không
  có "Lối vào nhanh", "Định hướng portal", ghi chú phạm vi... như các Portal khác).
- Dữ liệu: `dashboard.service.ts#getDashboardSummary` **đã tính sẵn** gần như mọi số liệu một
  quản lý đơn vị cần — kể cả những số hiện **không được hiển thị ở đâu cả** khi đứng tại một đơn
  vị cụ thể: `leadDangXuLy`, `lichHenTuVanHomNay`, `tyLeChuyenDoiLead`, `buoiHocCanDieuChinh`,
  `hocSinhBaoLuu`, `dieuChinhChoDuyet` (điều chỉnh tài chính chờ duyệt). `DashboardPage.tsx` chỉ
  render một phần nhỏ trong số này (`khoanThuTheoHan`, `donXinPhepChoDuyet`, `siSoTheoLop`) —
  phần còn lại bị tính rồi bỏ phí. Đây là chỗ nối rẻ nhất: không cần thêm truy vấn DB mới, chỉ
  cần hiển thị đúng.

## 2. Đề xuất tính năng — Portal cổng quản lý đơn vị

Theo đúng khuôn mẫu Portal đã có (`portalRoles` trong `config/portal.ts` +
`PortalLandingPage.tsx`), thêm slug `quan-ly-don-vi`:

1. **4 thẻ tổng quan** (dùng lại `DashboardSummary` đã có, không thêm API): học viên đang học,
   lớp đang hoạt động, công nợ hiện tại, lead mới trong tháng — đúng 4 số `DashboardPage.tsx`
   dùng cho nhánh hệ thống, tái dùng cho nhất quán.
2. **"Cần chú ý"** — khối duy nhất thật sự khác biệt so với các Portal vận hành khác, vì đây là
   nơi duy nhất một người cần nhìn thấy tín hiệu từ **cả 3 mảng** (tài chính, đào tạo, tuyển
   sinh) cùng lúc để ra quyết định điều phối, thay vì phải mở lần lượt 3 Portal:
   - Khoản thu quá hạn (liên kết `/finance?filter=qua_han`)
   - Đơn xin phép chờ duyệt (liên kết `/attendance/xin-phep`)
   - Yêu cầu điều chỉnh tài chính chờ duyệt (liên kết `/finance/dieu-chinh`)
   - Buổi học cần điều chỉnh (nghỉ/hủy chưa xếp bù, liên kết `/schedule`)
   - Học sinh đang bảo lưu (liên kết `/students?trangThai=bao_luu` nếu trang hỗ trợ, tạm thời
     `/students`)
3. **Lối vào nhanh** + **Định hướng portal** — theo đúng khuôn generic đã có sẵn trong
   `PortalLandingPage.tsx` (`portalRole.quickLinks` / `getPortalNextSteps`), không cần code
   riêng.
4. **Ghi chú phạm vi** (`getPortalContext`) — nói rõ quản lý đơn vị thấy **toàn bộ** đơn vị đang
   đứng (không giới hạn theo mảng nghiệp vụ như kế toán/học vụ/tuyển sinh), khác với các vai trò
   chuyên môn.

### Không làm trong đợt này (đề xuất, để sau)

- **Xu hướng doanh thu theo thời gian** (biểu đồ theo tuần/tháng) — cần thêm truy vấn nhóm theo
  ngày, hiện `sumDoanhThuTheoDonVi` chỉ trả tổng theo khoảng ngày, không theo từng điểm thời
  gian. Có giá trị thật cho quản lý đơn vị (so sánh tháng này/tháng trước) nhưng là tính năng
  biểu đồ đầu tiên của cả hệ thống (L01/L04 đều chưa có biểu đồ) — nên làm chung một đợt cho mọi
  báo cáo thay vì làm riêng lẻ ở đây.
- **So sánh với đơn vị khác cùng hệ thống** — quản lý đơn vị chỉ có quyền tại đơn vị mình phụ
  trách (không lan sang đơn vị khác như quản trị hệ thống), nên không có dữ liệu để so sánh; nếu
  cần, phải là một vai trò/quyền mới (VD "giám đốc vùng"), ngoài phạm vi B02 hiện tại.
- **Duyệt trực tiếp ngay trong Portal** (VD nút "Duyệt" cạnh mỗi đơn xin phép) — các trang đích
  (`/attendance/xin-phep`, `/finance/dieu-chinh`) đã có đúng luồng duyệt kèm kiểm tra quyền
  `tai_chinh.duyet` tách biệt khỏi `tai_chinh.quan_ly` (H08); nhân đôi luồng duyệt ngay tại Portal
  sẽ phải chép lại logic đó hai nơi. Portal chỉ nêu số lượng + liên kết, đúng tinh thần các Portal
  khác (VD Portal kế toán cũng chỉ liên kết `/finance/dieu-chinh`, không duyệt tại chỗ).

## 3. Đề xuất thông số báo cáo

Quản lý đơn vị là vai trò duy nhất cần nhìn **báo cáo tổng hợp cả đơn vị**, không chỉ một mảng
nghiệp vụ. Đề xuất theo thứ tự giá trị/chi phí:

| Thông số | Nguồn dữ liệu | Trạng thái |
|---|---|---|
| Doanh thu, công nợ, thu ròng trong khoảng ngày | `taiChinh.repository` (đã có) | Có sẵn ở `/finance/bao-cao` (H09/L04) — quản lý đơn vị đã truy cập được, chỉ thiếu lối vào từ Portal → thêm vào `quickLinks`. |
| Tỷ lệ lấp đầy lớp (sĩ số hiện tại/tối đa) | `listSiSoTheoLop` (đã có) | Đã tính trong `DashboardSummary.siSoTheoLop`, chưa hiển thị ở Portal quản lý đơn vị → thêm bảng thu gọn (top lớp gần đầy/vượt) thay vì bảng đầy đủ như Dashboard cũ. |
| Phễu tuyển sinh (lead mới/đang chăm sóc/tỷ lệ chuyển đổi) | `lead.repository` (đã có) | Đã tính (`leadDangXuLy`, `tyLeChuyenDoiLead`) nhưng chưa hiển thị ngoài Portal tuyển sinh → thêm vào "Cần chú ý" hoặc thẻ phụ. |
| Báo cáo tuyển sinh theo nguồn/thời gian (L02) | Cần thêm — `Lead.nguon`/`trangThai` đã có cột, chưa có trang tổng hợp | **Chưa làm** — đúng mục L02 còn trống trong `docs/00_MASTER_CHECKLIST.md`. Đề xuất trang `/admissions/bao-cao`, cùng khuôn `FinanceReportPage`, đã có phân bổ layout sẵn trong checklist. |
| Báo cáo chuyên cần theo lớp/đơn vị (L03) | Cần thêm — dựa trên `DiemDanh` đã có | **Chưa làm** — mục L03 còn trống. Đề xuất trang `/attendance/bao-cao`. |
| Xu hướng doanh thu theo thời gian (biểu đồ) | Cần thêm truy vấn nhóm theo ngày/tuần | **Chưa làm**, xem mục 2 — gộp chung đợt làm biểu đồ cho L02/L03/L04. |

Trong đợt này chỉ hiện thực **2 dòng đầu** (đã có sẵn dữ liệu, chỉ thiếu chỗ hiển thị) ngay
trong Portal quản lý đơn vị. L02/L03 và biểu đồ xu hướng để lại làm sprint báo cáo riêng — quy mô
đủ lớn (trang mới + truy vấn nhóm mới) để không gộp lẫn vào một lần sửa Portal.

## 4. Đề xuất quản trị (quản trị phạm vi đơn vị)

Quản lý đơn vị đã có đủ công cụ quản trị **con người và cấu hình** trong phạm vi đơn vị của họ:
`/users` (tạo/khoá/reset mật khẩu nhân sự), `/notifications` (thông báo nội bộ). Rà soát thêm các
khoảng trống thật sự (không phải chỉ vì "trang quản trị nên có"):

- **Thông tin đơn vị** (địa chỉ, điện thoại, loại hình đào tạo, sĩ số tối đa mặc định...) —
  hiện chỉ chỉnh được qua `/organizations/:id`, route này có `onlyAtHeThong: true` nên **quản lý
  đơn vị không tự sửa được thông tin đơn vị mình** (chỉ quản trị hệ thống sửa được). Đây là
  khoảng trống thật, nhưng cố ý chưa mở — `DonViDetailPage.tsx` hiện có cả nút xoá/ngừng hoạt
  động đơn vị, mở thẳng route đó cho quản lý đơn vị sẽ cấp nhầm quyền tự ngừng hoạt động chính
  đơn vị mình. Cần tách rõ "xem + sửa thông tin cơ bản" khỏi "ngừng hoạt động/xoá" trước khi mở,
  nên để lại làm riêng, không gộp vào đợt Portal này.
- **Vai trò/phân quyền** — `/roles` đã `onlyAtHeThong: true`, đúng chủ đích (tránh một quản lý
  đơn vị tự đổi ma trận quyền toàn hệ thống). Không đề xuất mở thêm.
- **Nhật ký hệ thống** (`/audit-logs`) — cũng `onlyAtHeThong: true`. Một quản lý đơn vị có lý do
  chính đáng để xem nhật ký thao tác **trong đơn vị mình** (ai đổi gì, khi nào) nhưng nhật ký
  hiện tại không lọc theo đơn vị ở tầng dữ liệu — cần kiểm tra `NhatKyHeThong` có cột đơn vị hay
  không trước khi quyết định mở, để tránh lộ log của đơn vị khác. Đề xuất, chưa làm.

Kết luận: không có hạng mục "quản trị" nào đủ chín để làm ngay trong đợt Portal này mà không kéo
theo rủi ro phân quyền — giữ nguyên phạm vi quản trị hiện có (Người dùng, Thông báo), chỉ thêm
lối vào từ Portal.

## 5. Việc làm trong đợt này

1. Thêm slug `quan-ly-don-vi` vào `PortalRoleSlug`, `portalRoleOrder` (ưu tiên ngay sau
   `parent`, trước các vai trò chuyên môn — nếu một tài khoản có nhiều vai trò, quản lý đơn vị
   nên là Portal mặc định vì phạm vi rộng nhất), `portalRoles` (title/subtitle/quickLinks/stats/
   nextSteps) và `getPortalContext`.
2. `appRoutes.tsx`: thêm route `portal-quan-ly-don-vi` (`roles: ["quan_ly_don_vi"]`); bỏ
   `don_vi.quan_ly` khỏi danh sách `permissions` của route `/dashboard` — quản lý đơn vị dùng
   Portal làm trang chính, đúng cách các vai trò Portal khác (kế toán/học vụ/giáo viên/tuyển
   sinh) không có mục Dashboard song song. `he_thong.quan_tri` vẫn còn nguyên nên quản trị hệ
   thống không bị ảnh hưởng (họ có quyền này sẵn từ seed toàn quyền).
3. `PortalLandingPage.tsx`: nối `workspaceStats` cho slug mới (tái dùng 4 field đã có trong
   `DashboardSummary`) + thêm khối "Cần chú ý" liệt kê ở mục 2.

## 6. Giới hạn đã biết (có chủ đích, chưa xử lý)

- Vai trò `quan_ly_don_vi` về lý thuyết gán được cả ở đơn vị hệ thống
  (`server/domain/role-policy.ts#SYSTEM_ROLES`), nhưng khi đứng ở đó họ không có
  `he_thong.quan_tri` nên `getDashboardSummary` không bật nhánh gộp đa chi nhánh
  (`showTongQuanChiNhanh` chỉ true khi có `he_thong.quan_tri`) — Portal mới sẽ hiện phần lớn số 0
  trong trường hợp hiếm này. Đây là giới hạn có sẵn từ trước (không phát sinh do đợt sửa này),
  không chặn vì trường hợp gán `quan_ly_don_vi` tại đơn vị hệ thống chưa có nghiệp vụ thật nào
  dùng đến (B01 ghi nhận chỉ dùng để tạo "kế toán tổng" qua `ke_toan`, không nhắc tới
  `quan_ly_don_vi`).
- Chưa có test tự động cho Portal mới — theo đúng hiện trạng chung của dự án (K04 trong master
  checklist vẫn "chưa có test tự động"), test tay qua UI thật trước khi tick checklist.
