# Phân tích — Vòng 2: sửa lỗi UI Portal quản lý đơn vị + đề xuất quyền duyệt và báo cáo mở rộng

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [1. Lỗi đã sửa](#1-lỗi-đã-sửa)
- [2. Rà soát quyền duyệt hiện có (trước khi đề xuất thêm)](#2-rà-soát-quyền-duyệt-hiện-có-trước-khi-đề-xuất-thêm)
- [3. Đề xuất quyền hạn mới cho Quản lý đơn vị](#3-đề-xuất-quyền-hạn-mới-cho-quản-lý-đơn-vị)
- [4. Đề xuất báo cáo chi tiết](#4-đề-xuất-báo-cáo-chi-tiết)
- [5. Việc cần quyết định trước khi code tiếp](#5-việc-cần-quyết-định-trước-khi-code-tiếp)

> Tiếp theo `docs/analysis/QUAN_LY_DON_VI_PORTAL.md` (2026-07-27), sau khi người dùng test tay
> qua ảnh chụp màn hình thật và phản hồi 5 điểm: (1) menu bị "dính" khi chọn, (2) layout "Cần chú
> ý"/"Tuyển sinh trong tháng" không cân đối, (3) cần thao tác "xem chi tiết" ở các mục xin
> phép/điểm danh/phê duyệt, (4) bổ sung quyền duyệt ngân sách/chi/giảm giá/chương trình dạy, (5)
> báo cáo chi tiết ngân sách/số lượng học sinh/chất lượng học tập. Mục 1-3 đã sửa trong đợt này;
> mục 4-5 là đề xuất, chưa code — ghi rõ lý do ở mục tương ứng.

## 1. Lỗi đã sửa

### 1.1 Menu sidebar "dính" khi chọn nhiều mục cùng lúc

**Nguyên nhân**: `Sidebar.tsx` dùng `NavLink` với prop `isActive` mặc định của react-router —
mặc định coi `to` là active khi pathname hiện tại **chứa nó làm tiền tố** (không truyền `end`).
Đứng ở `/finance/bao-cao`, cả "Học phí · Công nợ" (`/finance`, vì `/finance/bao-cao` bắt đầu bằng
`/finance`) lẫn "Báo cáo tài chính" (`/finance/bao-cao`) cùng nhận `isActive = true` → cả 2 mục
cùng hiện style "đang chọn" (khối trắng), đúng như ảnh chụp gửi kèm (2 mục "Đơn xin phép"/"Điểm
danh" và "Học phí · Công nợ"/"Báo cáo tài chính" cùng sáng).

**Sửa**: Tái dùng đúng `findRouteByPath` (thuật toán khớp tiền tố dài nhất, đã dùng để đặt tiêu đề
tab trình duyệt ở `AppShell.tsx`) để xác định đúng **một** route khớp sâu nhất với pathname hiện
tại, chỉ tô sáng đúng route đó thay vì để mỗi `NavLink` tự quyết theo prefix match riêng lẻ. Test
tay: đứng ở `/finance/bao-cao` → chỉ "Báo cáo tài chính" sáng; đứng ở `/attendance/xin-phep` → chỉ
"Đơn xin phép" sáng (trước đó "Điểm danh" cũng sáng theo).

### 1.2 Layout "Cần chú ý"/"Tuyển sinh trong tháng" không cân đối

**Nguyên nhân**: Class `section-card--wide` gắn trên "Cần chú ý" **không có định nghĩa CSS nào cả**
(kiểm tra toàn bộ `styles.css` và `user-management.css`) — mọi nơi khác trong code "wide" có
hiệu lực chỉ vì `SectionCard` đó đứng **một mình**, không nằm trong `<section className="dashboard-
grid">` (grid 2 cột tỉ lệ `1.65fr / 0.85fr`). Portal quản lý đơn vị đặt "Cần chú ý" (class wide,
nhưng vẫn nằm trong `dashboard-grid`) cạnh "Tuyển sinh trong tháng" — class "wide" không có tác
dụng, "Cần chú ý" chỉ chiếm đúng cột 1 (66%), trong khi 5 dòng của nó cao hơn hẳn 1 hàng thẻ nhỏ
của "Tuyển sinh trong tháng" ở cột 2 (34%) → khoảng trắng lớn, nhìn lệch.

**Sửa**: Bỏ wrapper `dashboard-grid`, để 2 `SectionCard` đứng độc lập full-width theo đúng cách
"Tổng quan theo đơn vị"/"Lịch chung hôm nay theo đơn vị" đã làm ở `DashboardPage.tsx` — không phụ
thuộc vào một class CSS không tồn tại.

### 1.3 Thao tác "xem chi tiết" ở các dòng "Cần chú ý"

Rà soát các trang đích (`LeaveRequestsPage.tsx`, `DieuChinhListPage.tsx`) cho thấy **đã** hiển thị
đầy đủ thông tin từng dòng (học sinh, lớp, lý do, người tạo...) và nút Duyệt/Từ chối ngay trong
bảng — không có trang "chi tiết" tách riêng, và cũng không cần thiết (dữ liệu không bị cắt bớt).
Cái thiếu thật sự chỉ là **tín hiệu thị giác**: dòng "Cần chú ý" trong Portal chỉ là một khối có
thể bấm, không có chữ nào gợi ý "bấm vào sẽ thấy gì" — khác với "Lối vào nhanh" đã có sẵn "Đi tới
→". Đã thêm "Xem chi tiết →" vào mọi dòng `attention-row--link` (Portal quản lý đơn vị + Portal kế
toán, dùng chung 1 class) để nhất quán.

Nếu ý bạn là "xem chi tiết" khác — VD mở nhanh 1 modal xem đúng 1 đơn xin phép mà không rời khỏi
Portal, hoặc thêm cột thông tin đang thiếu ở bảng — nói cụ thể hơn để làm đúng, tránh đoán sai.

## 2. Rà soát quyền duyệt hiện có (trước khi đề xuất thêm)

Đối chiếu CSDL thật (không chỉ file seed tĩnh `database/008_seed_default_role_permissions.sql` —
file này **đã lệch**, thiếu `tai_chinh.duyet` so với dữ liệu thật, có thể do cấp tay sau khi làm
H08 mà quên cập nhật lại file seed): vai trò `quan_ly_don_vi` hiện có đủ
`tai_chinh.xem/quan_ly/duyet`, `hoc_sinh.*`, `lop_hoc.*`, `tuyen_sinh.*`, `diem_danh.*`,
`hoc_tap.*`, `nguoi_dung.*`, `don_vi.*`, `phan_quyen.xem`. Nghĩa là **quản lý đơn vị đã duyệt được
hoàn phí/chuyển phí/bảo lưu (H08)** — xác nhận qua UI thật với `demo_quanly_nn`, thấy đúng nút
"Duyệt"/"Từ chối" ở `/finance/dieu-chinh`. Phần này của mục (4) đã có sẵn, không cần làm thêm.

*Việc nhỏ nên làm riêng (không thuộc đợt này)*: cập nhật lại `008_seed_default_role_permissions.sql`
cho khớp CSDL thật, để lần seed lại từ đầu (VD môi trường mới) không bị thiếu quyền này.

## 3. Đề xuất quyền hạn mới cho Quản lý đơn vị

### 3.1 Duyệt ngân sách (ngân sách) — **chưa có khái niệm này trong hệ thống**

Không có bảng `NganSach` hay tương đương ở bất kỳ đâu trong `drizzle/schemas/`. Đây là module mới
hoàn toàn, không phải "bổ sung quyền" cho cái đã có. Đề xuất tối thiểu (nếu làm):
- Bảng `NganSach`: `donViId`, kỳ (tháng/quý/năm, tái dùng cấu trúc `tuNgay/denNgay` như `KyThu`),
  `danhMucChiPhiId` (tùy chọn — ngân sách theo từng loại chi phí hoặc tổng), `soTienDuKien`,
  `trangThai` (`nhap` / `da_duyet`), người lập, người duyệt — mô phỏng đúng khuôn `KyThu`
  (nháp/mở) và `DieuChinhKhoanPhaiThu` (tạo → chờ duyệt → duyệt bởi người khác).
- Kế toán lập ngân sách (nháp) → Quản lý đơn vị duyệt (`ngan_sach.duyet`, quyền mới, tách khỏi
  `tai_chinh.quan_ly` giống cách H08 tách `tai_chinh.duyet`).
- Báo cáo so sánh thực chi (`ChiPhi` đã có) với ngân sách theo danh mục — chính là mục (5) phần
  "báo cáo ngân sách".

Đây là module đủ lớn (bảng mới + quyền mới + report mới) để làm riêng một đợt, không lồng vào sửa
UI Portal.

### 3.2 Duyệt chi — **ĐÃ LÀM (2026-07-27), đảo lại quyết định thiết kế cũ theo phản hồi người dùng**

Bản ghi cũ ở mục này coi việc thêm duyệt là "đi ngược quyết định thiết kế đã ghi rõ trong code"
(`drizzle/schemas/taiChinh.ts`: *"Chi phí — ghi nhận trực tiếp... khác H08 vì chi phí không đảo
ngược một khoản thu đã có"*) — và đề xuất cân nhắc thêm trước khi đổi. Người dùng phản hồi lý do so
sánh đó sai ngay từ đầu: **chi phí (dịch vụ, mua sắm...) không liên quan gì đến việc "đảo ngược
khoản thu"** — đó là tiền CHI RA, nên cần duyệt TRƯỚC khi ghi nhận, không phải sau. Đã sửa lại
đúng theo hướng đó, không làm theo phương án "duyệt theo ngưỡng" (không cần thiết một khi đã xác
định lại đúng bản chất nghiệp vụ).

**Đã làm**:
- `ChiPhi` thêm `trangThai` (`cho_duyet`/`da_duyet`/`tu_choi`), `nguoiDuyetId`, `ghiChuDuyet`,
  `duyetAt` — copy nguyên khuôn `DieuChinhKhoanPhaiThu` (H08): tạo ở `cho_duyet`, một actor KHÁC
  người lập (có `tai_chinh.duyet` — quyền có sẵn từ H08, không tạo quyền mới) mới duyệt được.
  Migration `database/028_add_chi_phi.sql` (nhân tiện ghi lại luôn phần tạo bảng `ChiPhi`/
  `DanhMucChiPhi` — tính năng này trước đó đã có trong CSDL dev qua `drizzle-kit push` nhưng chưa
  từng có file migration, một khoảng trống có sẵn không liên quan đợt sửa này).
- `sumChiPhiTrongKhoang`/`sumChiPhiAllDonViTrongKhoang`/`sumChiPhiTheoDonVi` (dùng cho "Tổng chi"/
  "Lãi lỗ ròng" ở báo cáo tài chính) chỉ tính chi phí **đã duyệt** — đề xuất chờ duyệt không còn
  làm sai lệch số liệu báo cáo trước khi được duyệt.
- `ChiPhiPage.tsx`: đổi ngôn ngữ "Ghi nhận chi phí" → "Đề xuất chi", mặc định lọc "Chờ duyệt" (như
  `DieuChinhListPage`), thêm cột Trạng thái/Người tạo/Người duyệt + nút Duyệt/Từ chối (ẩn nếu tự
  duyệt đề xuất của mình).
- Portal quản lý đơn vị: thêm dòng "Đề xuất chi chờ duyệt" vào "Cần chú ý" (dùng
  `chiPhiChoDuyet` mới trong `DashboardSummary`) + link "Chi phí" vào "Lối vào nhanh".
- Test tay qua API thật (không qua UI vì `DateField`/`CurrencyInput` khó lái bằng công cụ test tự
  động — giới hạn có sẵn từ trước, xem ghi chú trong `PROJECT_SUMMARY.md` về H08): tạo đề xuất chi
  500.000đ với `demo_quanly_nn` → đúng `trangThai=cho_duyet`; tự duyệt bằng chính tài khoản đó bị
  chặn đúng thông báo "Người duyệt phải khác người lập đề xuất."; duyệt bằng một tài khoản khác
  (`demo_ketoan_nn`, gọi thẳng service layer vì tài khoản kế toán không có `tai_chinh.duyet` qua
  route — chỉ dùng để xác nhận logic "khác người lập" hoạt động đúng ở tầng service) → thành công,
  `trangThai=da_duyet`. Báo cáo tài chính (`/api/tai-chinh/bao-cao`) tính lại đúng: `tongChiPhi`
  tăng từ 2.000.000 lên 2.500.000, `laiLoRong` giảm tương ứng — đúng dữ liệu chỉ tính chi phí đã
  duyệt.

### 3.3 Duyệt giảm giá — **miễn giảm (H04) hiện KHÔNG qua duyệt, khác hẳn 3 loại điều chỉnh còn lại**

Sự bất nhất đã có sẵn: `KhoanPhaiThu.giamTru` (miễn giảm, H04) là thao tác **tức thời** của kế toán
(`tai_chinh.quan_ly`), trong khi hoàn phí/chuyển phí/bảo lưu (H08, cùng nhóm "giảm số tiền phải
thu") đều phải qua `DieuChinhKhoanPhaiThu` với bước duyệt tách vai trò. Đề xuất: gộp miễn giảm
thành `loaiDieuChinh` thứ 4 trong `DieuChinhKhoanPhaiThu` (VD `mien_giam`) — tái dùng nguyên hạ
tầng duyệt đã có (kể cả quyền `tai_chinh.duyet` quản lý đơn vị đã có sẵn từ mục 2), không cần bảng
hay quyền mới. Rủi ro: đổi luồng H04 hiện có (từ tức thời sang phải chờ duyệt) — ảnh hưởng thao
tác hằng ngày của kế toán, nên xác nhận trước khi đổi thay vì âm thầm chặn thêm một bước.

### 3.4 Duyệt chương trình dạy — **`ChuongTrinhDaoTao` (E01) hiện không có trạng thái nháp/duyệt**

Tạo chương trình hiện có hiệu lực ngay khi lưu (không có bước duyệt), khác `KyThu` (đã tách
nháp/mở). Đề xuất: thêm `trangThai` (`nhap` / `da_duyet`) vào `ChuongTrinhDaoTao`, chặn xếp lớp
mới theo chương trình chưa duyệt (giống cách `KyThu` khoá sửa sau khi mở). Quyền duyệt: quản lý
đơn vị đã có `lop_hoc.quan_ly` (không có quyền `dao_tao.*` riêng vì hệ thống hiện dùng chung
`lop_hoc.*` cho cả chương trình lẫn lớp) — nên hoặc tái dùng `lop_hoc.quan_ly` (không tách riêng
người tạo/người duyệt), hoặc thêm quyền mới nếu cần bắt buộc 2 người khác nhau như H08. Cần quyết
định mức độ nghiêm ngặt trước khi chọn hướng.

## 4. Đề xuất báo cáo chi tiết

| Báo cáo | Hiện trạng | Đề xuất |
|---|---|---|
| Ngân sách | Không có dữ liệu (mục 3.1 chưa làm) | Chặn cứng tới khi có `NganSach` — không thể báo cáo trên dữ liệu chưa tồn tại. |
| Số lượng học sinh | Đã có rải rác: `hocSinhDangHoc`, `hocSinhBaoLuu`, sĩ số theo lớp (Dashboard/Portal), lịch sử trạng thái (D05) | Có thể ghép thành 1 trang nhỏ "học sinh theo trạng thái/lớp/thời gian nhập học" — chi phí thấp vì dữ liệu đã có sẵn, chỉ thiếu chỗ tổng hợp. Có thể làm ngay nếu bạn muốn ưu tiên mục này. |
| Chất lượng kết quả học tập | **Chưa có mô hình dữ liệu** — G04 (kết quả kiểm tra/đánh giá) và G05 (tiến độ chương trình) đều còn trống trong `docs/00_MASTER_CHECKLIST.md`, xác nhận không có bảng điểm/đánh giá nào trong schema | Chặn cứng tới khi có G04 (tối thiểu: bảng `KetQuaKiemTra` — học sinh, môn/kỹ năng, điểm, ngày). Không thể "báo cáo chất lượng" khi hệ thống chưa từng ghi nhận một điểm số nào. |

## 5. Việc cần quyết định trước khi code tiếp

Mục 3.2 (duyệt chi) đã làm xong — xem cập nhật ở mục đó. 3 hạng mục còn lại trong mục 3 và mục 4
(báo cáo ngân sách/chất lượng) vẫn là module mới, không phải chỉnh sửa nhỏ — mỗi mục kéo theo ít
nhất 1 quyết định thiết kế (bảng mới hoặc quyền mới). Thứ tự ưu tiên còn lại theo chi phí/giá trị
(rẻ nhất lên trước):
1. **3.3 Giảm giá qua duyệt** — rẻ nhất (tái dùng hạ tầng H08 sẵn có), nhưng đổi hành vi H04 hiện
   tại, cần xác nhận.
2. **Báo cáo số lượng học sinh** (mục 4, dòng 2) — rẻ, không đổi hành vi gì, có thể làm ngay.
3. **3.4 Duyệt chương trình dạy** — vừa, thêm 1 trạng thái mới, có tiền lệ rõ (`KyThu`).
4. **3.1 Ngân sách** — module lớn nhất, nên làm sau khi các mục trên ổn định.
5. **Báo cáo chất lượng học tập** — chặn cứng, phải làm G04 trước, ngoài phạm vi "báo cáo".
