# Checklist chức năng tổng

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [A. Nền tảng và đa đơn vị](#a-nền-tảng-và-đa-đơn-vị)
- [B. Người dùng và phân quyền](#b-người-dùng-và-phân-quyền)
- [C. Tuyển sinh](#c-tuyển-sinh)
- [D. Học sinh và phụ huynh](#d-học-sinh-và-phụ-huynh)
- [E. Lớp học và lịch học](#e-lớp-học-và-lịch-học)
- [F. Điểm danh và xin phép](#f-điểm-danh-và-xin-phép)
- [G. Học tập](#g-học-tập)
- [H. Tài chính](#h-tài-chính)
- [I. Thông báo và trao đổi](#i-thông-báo-và-trao-đổi)
- [J. Portal](#j-portal)
- [K. Tài liệu và chất lượng](#k-tài-liệu-và-chất-lượng)
- [L. Báo cáo & Dashboard](#l-báo-cáo-dashboard)

Tài liệu theo dõi trạng thái các nhóm chức năng từ nền tảng đến portal và báo cáo.

## A. Nền tảng và đa đơn vị
- [x] A01 Tạo Danh mục đơn vị trường/trung tâm/cơ sở.
- [x] A02 Chọn đơn vị sau đăng nhập.
- [x] A03 Lưu đơn vị đang làm việc trong session/token.
- [x] A04 Phân quyền người dùng theo từng đơn vị.
- [x] A05 Chuyển đơn vị không cần đăng xuất nếu có quyền.
- [x] A06 Nhật ký thay đổi đơn vị và thao tác quan trọng.

## B. Người dùng và phân quyền
- [ ] B01 Quản trị nền tảng.
- [x] B02 Quản lý đơn vị.
- [x] B03 Tuyển sinh/tư vấn.
- [x] B04 Kế toán.
- [x] B05 Giáo viên.
- [x] B06 Nhân viên học vụ.
- [x] B07 Phụ huynh/người giám hộ.
- [x] B08 Chính sách khóa/mở tài khoản.

## C. Tuyển sinh
- [x] C01 Tiếp nhận khách hàng tiềm năng.
- [x] C02 Ghi nhận nhu cầu khóa học/lớp.
- [x] C03 Lịch sử tư vấn và chăm sóc.
- [x] C04 Hồ sơ đăng ký nhập học.
- [ ] C05 Kiểm tra đầu vào/xếp trình độ cho trung tâm ngoại ngữ.
- [x] C06 Xác nhận nhập học và sinh mã học sinh.
- [x] C07 Tạo tài khoản phụ huynh.

## D. Học sinh và phụ huynh
- [x] D01 Hồ sơ học sinh.
- [x] D02 Hồ sơ sức khỏe mầm non.
- [x] D03 Quan hệ phụ huynh/người giám hộ.
- [x] D04 Người liên hệ chính và người đón trẻ.
- [x] D05 Lịch sử trạng thái học tập.
- [x] D06 Chuyển lớp/ngừng học/bảo lưu.

## E. Lớp học và lịch học
- [x] E01 Tạo chương trình/khóa học.
- [x] E02 Tạo lớp học.
- [x] E03 Xếp học sinh vào lớp.
- [x] E04 Phân công giáo viên.
- [x] E05 Tạo lịch học lặp lại.
- [x] E06 Kiểm tra trùng giáo viên/phòng/lớp/học sinh.
- [x] E07 Lịch nghỉ và học bù.
- [x] E08 Thời khóa biểu giáo viên, học sinh, phụ huynh.

## F. Điểm danh và xin phép
- [x] F01 Điểm danh theo buổi học.
- [x] F02 Có mặt/vắng có phép/vắng không phép/đi trễ/về sớm.
- [x] F03 Phụ huynh gửi đơn xin phép.
- [x] F04 Giáo viên/học vụ duyệt hoặc ghi nhận.
- [x] F05 Thông báo vắng học cho phụ huynh.
- [ ] F06 Mầm non: giờ đón/trả và người đón.

## G. Học tập
- [x] G01 Báo giảng theo buổi.
- [x] G02 Nội dung bài học và bài tập.
- [x] G03 Nhận xét giáo viên.
- [ ] G04 Kết quả kiểm tra/đánh giá.
- [ ] G05 Tiến độ theo chương trình.
- [ ] G06 Ngoại ngữ: kỹ năng nghe/nói/đọc/viết.
- [x] G07 Mầm non: phát triển thể chất/nhận thức/ngôn ngữ/tình cảm-xã hội/thẩm mỹ.

## H. Tài chính
- [x] H01 Danh mục khoản thu.
- [x] H02 Tạo kỳ thu.
- [x] H03 Áp dụng khoản thu cho lớp/học sinh.
- [x] H04 Khoản phải thu và miễn giảm.
- [x] H05 Thu từng phần/nhiều lần.
- [x] H06 Công nợ phụ huynh.
- [x] H07 Biên nhận thu.
- [x] H08 Hoàn phí/chuyển phí/bảo lưu.
- [x] H09 Báo cáo doanh thu, công nợ, thu theo đơn vị.

## I. Thông báo và trao đổi
- [x] I01 Thông báo toàn trường/theo lớp/cá nhân.
- [x] I02 Đính kèm tài liệu/hình ảnh.
- [x] I03 Xác nhận đã đọc.
- [x] I04 Trao đổi phụ huynh – giáo viên theo học sinh/lớp.
- [x] I05 Kiểm soát phạm vi và lưu lịch sử.

## J. Portal
- [x] J01 Portal phụ huynh.
- [x] J02 Portal giáo viên.
- [x] J03 Lịch học và thông báo.
- [x] J04 Xin phép nghỉ.
- [x] J05 Tiến độ và kết quả học tập.
- [x] J06 Học phí và biên nhận.

## K. Tài liệu và chất lượng
- [ ] K01 Cập nhật BPD sau mỗi quyết định nghiệp vụ.
- [x] K02 Cập nhật PROJECT_SUMMARY.md.
- [x] K03 Cập nhật checklist sprint.
- [ ] K04 Test multi-tenant và phân quyền.
- [ ] K05 Test timezone Asia/Ho_Chi_Minh.
- [ ] K06 Test regression module đã hoàn thành.

## L. Báo cáo & Dashboard
- [x] L01 Dashboard vận hành.
- [ ] L02 Báo cáo tuyển sinh.
- [ ] L03 Báo cáo chuyên cần/học tập.
- [x] L04 Báo cáo tài chính.
