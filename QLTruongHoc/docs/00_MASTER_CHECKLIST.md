# MASTER CHECKLIST

> Đây là checklist tổng toàn dự án (Sprint 0 → Sprint 7). Trạng thái A/B dưới đây được
> đối chiếu lại với code thật ngày 2026-07-20 sau khi phát hiện `PROJECT_SUMMARY.md` và
> `docs/MASTER_CHECKLIST.md` (file khác, dùng để track patch UI) đã bị ghi đè mất nội dung
> Sprint 0. Chi tiết xem `PROJECT_SUMMARY.md` mục "Sprint 0 — Nền tảng đa đơn vị".
>
> Cập nhật 2026-07-21 (sáng): đối chiếu lại C/D với code + `SHOW TABLES` trên DB dev thật —
> Sprint 1 (Tuyển sinh, mục C/D) chưa bắt đầu thật sự, dù đã có scaffold `hocSinh` mồ côi.
>
> Cập nhật 2026-07-21 (chiều): đã hoàn tất D01/D03 (hồ sơ học sinh + phụ huynh, nối lại
> scaffold `hocSinh`). Mục C (Lead/tuyển sinh) và D02/D05/D06 vẫn chưa làm. Chi tiết xem
> `PROJECT_SUMMARY.md` mục "D01/D03 — Hồ sơ học sinh và phụ huynh".
>
> Cập nhật 2026-07-21 (đêm): hoàn tất E05-E08 (lịch học lặp lại, kiểm tra trùng, nghỉ/học
> bù, thời khóa biểu). Chi tiết xem `PROJECT_SUMMARY.md` mục "E05-E08 — Lịch học lặp lại và
> thời khóa biểu".
>
> Cập nhật 2026-07-21 (khuya): chốt phạm vi nghiệp vụ tại đơn vị hệ thống (chỉ quản trị,
> không mở lớp/học viên/lịch) + sinh dữ liệu mẫu lịch học. Xem `docs/analysis/A01_cay_don_vi.md`
> mục 11 và `PROJECT_SUMMARY.md` mục "Phạm vi nghiệp vụ tại đơn vị hệ thống + dữ liệu mẫu
> lịch học".
>
> Cập nhật 2026-07-21 (khuya, tiếp): ẩn form tạo/sửa + xem gộp dữ liệu theo đơn vị (kèm cột
> "Đơn vị") ở 4 trang Học sinh/Lớp học/Giáo viên/Tuyển sinh khi đứng ở đơn vị hệ thống. Phát
> hiện 2 bản ghi dữ liệu thật của người dùng (học sinh "Nguyen Khang", lead "Nguyen Nghia")
> đang nằm nhầm ở đơn vị hệ thống — chưa xử lý, để người dùng tự quyết định. Xem
> `docs/analysis/A01_cay_don_vi.md` mục 11.1.
>
> Cập nhật 2026-07-21 (rạng sáng): đã chuyển học sinh "Nguyen Khang" + phụ huynh + lead
> "Nguyen Nghia" từ đơn vị hệ thống sang Trường Mầm non Hoa Nắng theo yêu cầu người dùng
> (sinh lại mã tránh trùng). Hoàn tất D05/D06 (lịch sử trạng thái học tập, đồng bộ trạng
> thái lớp khi đổi trạng thái tổng thể học sinh). Xem `PROJECT_SUMMARY.md`.
>
> Cập nhật 2026-07-21 (sáng sớm, hôm sau): mở Sprint 3, hoàn tất F01/F02/F04 (điểm danh theo
> buổi học — trang `/attendance`, tích hợp nút điểm danh vào `ClassDetailPage`). F03/F05 để
> sau vì cần Portal/module Thông báo chưa làm; F06 (mầm non đón/trả) để riêng. Xem
> `PROJECT_SUMMARY.md` mục "F01/F02/F04 — Điểm danh theo buổi học".
>
> Cập nhật 2026-07-21 (sáng sớm, tiếp): hoàn tất G01/G02/G03 (báo giảng theo buổi, nhận xét
> giáo viên) — cùng ngày với F. Seed thêm quyền `hoc_tap.xem`/`hoc_tap.ghi_nhan` (khác điểm
> danh, chưa có quyền phù hợp để tái dùng). G04-G07 để sau vì cần mô hình dữ liệu riêng. Xem
> `PROJECT_SUMMARY.md` mục "G01/G02/G03 — Báo giảng theo buổi, nhận xét giáo viên".
>
> Cập nhật 2026-07-21 (tối): phát hiện và sửa lỗi ở A04/A05 — `getOrganizationsForUser`
> trước đây chỉ trả về đơn vị có dòng gán tường minh, kể cả với `he_thong.quan_tri`, nên
> quản trị hệ thống không thấy/chuyển được sang các đơn vị mình chưa từng được gán, và
> không gán được vai trò cho người khác vào các đơn vị đó. Đã sửa để quản trị hệ thống luôn
> thấy và truy cập được toàn bộ đơn vị đang hoạt động. Đã test tay qua trình duyệt (PASS).
> Đồng thời làm lại giao diện sidebar (icon SVG đồng bộ, màu sắc đi qua biến theme, sửa lỗi
> mục menu đang chọn không nổi bật) — không phát sinh mục checklist mới, thuộc K06.

## A. Nền tảng và đa đơn vị
- [x] A01 Tạo cây đơn vị trường/trung tâm/cơ sở. (2026-07-21: có API + trang `/organizations` tạo/sửa/ngừng hoạt động đơn vị, chỉ `he_thong.quan_tri`. Xem `docs/analysis/A01_cay_don_vi.md`.)
- [x] A02 Chọn đơn vị sau đăng nhập.
- [x] A03 Lưu đơn vị đang làm việc trong session/token. (`PhienDangNhap.donViHienTaiId`.)
- [x] A04 Phân quyền người dùng theo từng đơn vị. (`NguoiDungVaiTroDonVi` + middleware `requirePermission`.)
- [x] A05 Chuyển đơn vị không cần đăng xuất nếu có quyền. (`POST /api/organizations/select`.)
- [x] A06 Nhật ký thay đổi đơn vị và thao tác quan trọng. (`NhatKyHeThong` ghi login/logout/select-org/user/role.)

## B. Người dùng và phân quyền
- [ ] B01 Quản trị nền tảng. (Vai trò `quan_tri_he_thong` chỉ gán được qua seed, chưa có UI gán vai trò phạm vi hệ thống — có chủ đích để tránh leo thang quyền.)
- [x] B02 Quản lý đơn vị. (Vai trò `quan_ly_don_vi` gán được qua Quản lý người dùng.)
- [x] B03 Tuyển sinh/tư vấn. (Có màn hình Lead/CRM đầy đủ từ 2026-07-21 — xem mục C.)
- [ ] B04 Kế toán. (Vai trò đã seed; chưa có màn hình nghiệp vụ tài chính — xem mục H.)
- [ ] B05 Giáo viên. (Có hồ sơ + được phân công lớp từ 2026-07-21, nhưng chưa có màn hình giảng dạy thật (báo giảng/điểm danh) — xem mục F/G.)
- [x] B06 Nhân viên học vụ. (Có màn hình chương trình/lớp/xếp lớp đầy đủ từ 2026-07-21 — xem mục E.)
- [ ] B07 Phụ huynh/người giám hộ. (Vai trò đã seed; chưa có Portal phụ huynh thật — xem mục J.)
- [x] B08 Chính sách khóa/mở tài khoản. (Khóa/mở tay qua Quản lý người dùng; khóa tạm tự động sau 5 lần đăng nhập sai liên tiếp, tự mở sau 15 phút.)

## C. Tuyển sinh
- [x] C01 Tiếp nhận khách hàng tiềm năng. (2026-07-21: API `/api/leads` + trang `/admissions`. Mã lead tự sinh. Xem `docs/analysis/C01_C03_C06_lead_tuyen_sinh.md`.)
- [x] C02 Ghi nhận nhu cầu khóa học/lớp. (Trường `nhuCau`, `doTuoiHoacTrinhDo` trên Lead — ghi chú tự do, chưa gắn cứng vào chương trình đào tạo vì Sprint 2 chưa làm.)
- [x] C03 Lịch sử tư vấn và chăm sóc. (`LeadHoatDong` append-only, có thể kèm đổi trạng thái lead cùng lúc.)
- [x] C04 Hồ sơ đăng ký nhập học. (Qua form "Xác nhận đăng ký" trong trang chi tiết lead.)
- [ ] C05 Kiểm tra đầu vào/xếp trình độ cho trung tâm ngoại ngữ. (Để Sprint 7.)
- [x] C06 Xác nhận nhập học và sinh mã học sinh. (Tái sử dụng `createHocSinhMoi`/`addGuardianToStudent`; một lead chỉ chuyển đổi đúng một lần.)
- [x] C07 Tạo tài khoản phụ huynh. (2026-07-21: API `POST /api/hoc-sinh/:id/phu-huynh/:linkId/tai-khoan`, không tạo trùng theo guardian-person. Test qua API PASS; chưa xác nhận UI thật trên trình duyệt. Xem `docs/analysis/C07_tai_khoan_phu_huynh.md`.)

## D. Học sinh và phụ huynh
- [x] D01 Hồ sơ học sinh. (2026-07-21: API `/api/hoc-sinh` + trang `/students`, `/students/:id`. Mã học sinh tự sinh. Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`.)
- [ ] D02 Hồ sơ sức khỏe mầm non. (Để Sprint 7.)
- [x] D03 Quan hệ phụ huynh/người giám hộ. (2026-07-21: `PhuHuynh` + `HocSinhPhuHuynh`, tái sử dụng phụ huynh theo số điện thoại trong đơn vị, một liên hệ chính tại một thời điểm.)
- [x] D04 Người liên hệ chính và người đón trẻ. (`laLienHeChinh`, `duocDonTre` trên `HocSinhPhuHuynh`; chưa có UI ghi nhận người đón thực tế theo buổi — để Sprint 3/7.)
- [x] D05 Lịch sử trạng thái học tập. (2026-07-21: `HocSinhTrangThaiLichSu` — ghi 1 dòng mỗi lần đổi `HocSinh.trangThai`, không ghi đè. Xem `docs/analysis/D05_D06_lich_su_trang_thai_hoc_tap.md`.)
- [x] D06 Chuyển lớp/ngừng học/bảo lưu. (Chuyển lớp đã có từ E03. Bổ sung 2026-07-21: đổi trạng thái tổng thể học sinh sang `ngung_hoc`/`hoan_thanh`/`bao_luu` tự động đồng bộ tất cả `HocSinhLopHoc` đang hoạt động — trước đây 2 tầng trạng thái có thể lệch nhau.)

## E. Lớp học và lịch học
- [x] E01 Tạo chương trình/khóa học. (2026-07-21: API `/api/chuong-trinh` + section trong `/classes`. Mã tự đặt (không tự sinh). Xem `docs/analysis/E01_E04_chuong_trinh_lop_hoc.md`.)
- [x] E02 Tạo lớp học. (API `/api/lop-hoc` + trang `/classes`, `/classes/:id`. Bao gồm hồ sơ giáo viên `/api/giao-vien` + trang `/teachers`.)
- [x] E03 Xếp học sinh vào lớp. (Chặn vượt sĩ số, chặn học sinh ngừng học/hoàn thành, chuyển lớp giữ lịch sử — không ghi đè.)
- [x] E04 Phân công giáo viên. (Chỉ một giáo viên chính hoạt động một lúc cho một lớp; giáo viên hỗ trợ không giới hạn.)
- [x] E05 Tạo lịch học lặp lại. (2026-07-21: `LichHoc` (quy tắc theo tuần) + sinh `BuoiHoc` theo khoảng ngày, tách 2 bước lưu quy tắc/sinh buổi. Xem `docs/analysis/E05_E08_lich_hoc.md`.)
- [x] E06 Kiểm tra trùng giáo viên/phòng/lớp. (Chặn cứng toàn bộ khi sinh buổi/tạo buổi bù nếu trùng phòng hoặc giáo viên trong cùng đơn vị.)
- [x] E07 Lịch nghỉ và học bù. (Đánh dấu `nghi` (mở lại được), tạo `BuoiHoc` độc lập `loaiBuoi=bu`.)
- [x] E08 Thời khóa biểu giáo viên, học sinh, phụ huynh. (Theo lớp trong `ClassDetailPage`, theo giáo viên/đơn vị ở trang `/schedule`. **Chưa** làm theo học sinh/phụ huynh — thuộc Portal, module J.)

## F. Điểm danh và xin phép
- [x] F01 Điểm danh theo buổi học. (2026-07-21: trang `/attendance` + nút "Điểm danh" ngay trong `ClassDetailPage`. Xem `docs/analysis/F01_F02_F04_diem_danh.md`.)
- [x] F02 Có mặt/vắng có phép/vắng không phép/đi trễ/về sớm. (Bảng `DiemDanh`, 5 trạng thái, mặc định "Có mặt" cho buổi chưa điểm danh.)
- [ ] F03 Phụ huynh gửi đơn xin phép. (Cần Portal phụ huynh — module J, chưa làm.)
- [x] F04 Giáo viên/học vụ duyệt hoặc ghi nhận. (Giáo viên ghi nhận qua `diem_danh.thuc_hien` đã seed sẵn từ Sprint 0; học vụ xem qua `diem_danh.xem` — đúng ma trận quyền có sẵn, không đổi.)
- [ ] F05 Thông báo vắng học cho phụ huynh. (Cần module Thông báo — M11, chưa làm.)
- [ ] F06 Mầm non: giờ đón/trả và người đón. (Để bước riêng, chưa cấp thiết cho MVP điểm danh chung.)

## G. Học tập
- [x] G01 Báo giảng theo buổi. (2026-07-21: bảng `BaoGiang`, 1 dòng/buổi, ghi ngay trong trang `/attendance`. Xem `docs/analysis/G01_G02_G03_bao_giang.md`.)
- [x] G02 Nội dung bài học và bài tập. (2 trường tự do `noiDungBaiHoc`/`baiTap` trong `BaoGiang`.)
- [x] G03 Nhận xét giáo viên. (Cột `nhanXet` thêm vào `DiemDanh` có sẵn — nhận xét riêng từng học sinh, lưu cùng lúc với điểm danh.)
- [ ] G04 Kết quả kiểm tra/đánh giá. (Cần mô hình bài kiểm tra/điểm số riêng, để sau.)
- [ ] G05 Tiến độ theo chương trình. (Cần cấu trúc chương/bài trong `ChuongTrinhDaoTao`, chưa có.)
- [ ] G06 Ngoại ngữ: kỹ năng nghe/nói/đọc/viết. (Nghiệp vụ chuyên biệt theo loại hình, để sau.)
- [ ] G07 Mầm non: phát triển thể chất/nhận thức/ngôn ngữ/tình cảm-xã hội/thẩm mỹ. (Nghiệp vụ chuyên biệt theo loại hình, để sau.)

## H. Tài chính
- [ ] H01 Danh mục khoản thu.
- [ ] H02 Tạo kỳ thu.
- [ ] H03 Áp dụng khoản thu cho lớp/học sinh.
- [ ] H04 Khoản phải thu và miễn giảm.
- [ ] H05 Thu từng phần/nhiều lần.
- [ ] H06 Công nợ phụ huynh.
- [ ] H07 Biên nhận thu.
- [ ] H08 Hoàn phí/chuyển phí/bảo lưu.
- [ ] H09 Báo cáo doanh thu, công nợ, thu theo đơn vị.

## I. Thông báo và trao đổi
- [ ] I01 Thông báo toàn trường/theo lớp/cá nhân.
- [ ] I02 Đính kèm tài liệu/hình ảnh.
- [ ] I03 Xác nhận đã đọc.
- [ ] I04 Trao đổi phụ huynh – giáo viên theo học sinh/lớp.
- [ ] I05 Kiểm soát phạm vi và lưu lịch sử.

## J. Portal
- [ ] J01 Portal phụ huynh.
- [ ] J02 Portal giáo viên.
- [ ] J03 Lịch học và thông báo.
- [ ] J04 Xin phép nghỉ.
- [ ] J05 Tiến độ và kết quả học tập.
- [ ] J06 Học phí và biên nhận.

## K. Tài liệu và chất lượng
- [ ] K01 Cập nhật BPD sau mỗi quyết định nghiệp vụ.
- [x] K02 Cập nhật PROJECT_SUMMARY.md. (Khôi phục 2026-07-20 sau khi phát hiện bị ghi đè mất nội dung Sprint 0 — xem `PROJECT_SUMMARY.md`.)
- [x] K03 Cập nhật checklist sprint. (`docs/SPRINT_0_CHECKLIST.md`, `docs/UI_SHELL_CHECKLIST.md` đối chiếu lại với code thật 2026-07-20.)
- [ ] K04 Test multi-tenant và phân quyền. (Đã review code và test tay luồng khóa đăng nhập; chưa có test tự động.)
- [ ] K05 Test timezone Asia/Ho_Chi_Minh.
- [ ] K06 Test regression module đã hoàn thành.
