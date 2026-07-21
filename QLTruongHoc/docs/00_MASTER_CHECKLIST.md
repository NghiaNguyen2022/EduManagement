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
- [ ] B03 Tuyển sinh/tư vấn. (Vai trò đã seed, gán được, nhưng chưa có màn hình nghiệp vụ tuyển sinh — xem mục C.)
- [ ] B04 Kế toán. (Vai trò đã seed; chưa có màn hình nghiệp vụ tài chính — xem mục H.)
- [ ] B05 Giáo viên. (Vai trò đã seed; chưa có màn hình giảng dạy — xem mục G.)
- [ ] B06 Nhân viên học vụ. (Vai trò đã seed; chưa có màn hình lớp/lịch — xem mục E.)
- [ ] B07 Phụ huynh/người giám hộ. (Vai trò đã seed; chưa có Portal phụ huynh thật — xem mục J.)
- [x] B08 Chính sách khóa/mở tài khoản. (Khóa/mở tay qua Quản lý người dùng; khóa tạm tự động sau 5 lần đăng nhập sai liên tiếp, tự mở sau 15 phút.)

## C. Tuyển sinh
- [x] C01 Tiếp nhận khách hàng tiềm năng. (2026-07-21: API `/api/leads` + trang `/admissions`. Mã lead tự sinh. Xem `docs/analysis/C01_C03_C06_lead_tuyen_sinh.md`.)
- [x] C02 Ghi nhận nhu cầu khóa học/lớp. (Trường `nhuCau`, `doTuoiHoacTrinhDo` trên Lead — ghi chú tự do, chưa gắn cứng vào chương trình đào tạo vì Sprint 2 chưa làm.)
- [x] C03 Lịch sử tư vấn và chăm sóc. (`LeadHoatDong` append-only, có thể kèm đổi trạng thái lead cùng lúc.)
- [x] C04 Hồ sơ đăng ký nhập học. (Qua form "Xác nhận đăng ký" trong trang chi tiết lead.)
- [ ] C05 Kiểm tra đầu vào/xếp trình độ cho trung tâm ngoại ngữ. (Để Sprint 7.)
- [x] C06 Xác nhận nhập học và sinh mã học sinh. (Tái sử dụng `createHocSinhMoi`/`addGuardianToStudent`; một lead chỉ chuyển đổi đúng một lần.)
- [ ] C07 Tạo tài khoản phụ huynh. (Bước tiếp theo — phụ thuộc C06 vừa xong.)

## D. Học sinh và phụ huynh
- [x] D01 Hồ sơ học sinh. (2026-07-21: API `/api/hoc-sinh` + trang `/students`, `/students/:id`. Mã học sinh tự sinh. Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`.)
- [ ] D02 Hồ sơ sức khỏe mầm non. (Để Sprint 7.)
- [x] D03 Quan hệ phụ huynh/người giám hộ. (2026-07-21: `PhuHuynh` + `HocSinhPhuHuynh`, tái sử dụng phụ huynh theo số điện thoại trong đơn vị, một liên hệ chính tại một thời điểm.)
- [x] D04 Người liên hệ chính và người đón trẻ. (`laLienHeChinh`, `duocDonTre` trên `HocSinhPhuHuynh`; chưa có UI ghi nhận người đón thực tế theo buổi — để Sprint 3/7.)
- [ ] D05 Lịch sử trạng thái học tập.
- [ ] D06 Chuyển lớp/ngừng học/bảo lưu.

## E. Lớp học và lịch học
- [ ] E01 Tạo chương trình/khóa học.
- [ ] E02 Tạo lớp học.
- [ ] E03 Xếp học sinh vào lớp.
- [ ] E04 Phân công giáo viên.
- [ ] E05 Tạo lịch học lặp lại.
- [ ] E06 Kiểm tra trùng giáo viên/phòng/lớp.
- [ ] E07 Lịch nghỉ và học bù.
- [ ] E08 Thời khóa biểu giáo viên, học sinh, phụ huynh.

## F. Điểm danh và xin phép
- [ ] F01 Điểm danh theo buổi học.
- [ ] F02 Có mặt/vắng có phép/vắng không phép/đi trễ/về sớm.
- [ ] F03 Phụ huynh gửi đơn xin phép.
- [ ] F04 Giáo viên/học vụ duyệt hoặc ghi nhận.
- [ ] F05 Thông báo vắng học cho phụ huynh.
- [ ] F06 Mầm non: giờ đón/trả và người đón.

## G. Học tập
- [ ] G01 Báo giảng theo buổi.
- [ ] G02 Nội dung bài học và bài tập.
- [ ] G03 Nhận xét giáo viên.
- [ ] G04 Kết quả kiểm tra/đánh giá.
- [ ] G05 Tiến độ theo chương trình.
- [ ] G06 Ngoại ngữ: kỹ năng nghe/nói/đọc/viết.
- [ ] G07 Mầm non: phát triển thể chất/nhận thức/ngôn ngữ/tình cảm-xã hội/thẩm mỹ.

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
