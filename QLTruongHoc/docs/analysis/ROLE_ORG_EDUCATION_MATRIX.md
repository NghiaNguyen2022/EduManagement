# Ma trận vai trò × cấp đơn vị × loại hình đào tạo

## Nguyên tắc

- Quyền luôn gắn với một đơn vị cụ thể.
- Đơn vị `he_thong` chỉ tổng hợp/quản trị, không tổ chức lớp hoặc phát sinh
  nghiệp vụ học sinh.
- `phu_huynh` chỉ được tạo từ hồ sơ học sinh.
- `quan_tri_he_thong` chỉ được cấp qua seed/quy trình quản trị nền tảng.
- Portal không cấp thêm quyền; chỉ tổ chức các chức năng mà API đã cho phép.

## Vai trò tại đơn vị hệ thống

| Vai trò | Cho phép | Phạm vi |
|---|---:|---|
| Quản trị hệ thống | Có, chỉ qua seed | Toàn bộ đơn vị, người dùng, quyền, audit |
| Quản lý đơn vị | Có | Quản lý/tổng hợp vận hành được ủy quyền |
| Kế toán | Có | Xem gộp tài chính toàn hệ thống; không lập nghiệp vụ tại node hệ thống |
| Tư vấn/tuyển sinh | Không | Phải làm tại trường/trung tâm cụ thể |
| Học vụ | Không | Node hệ thống không có lớp/lịch |
| Giáo viên | Không | Node hệ thống không tổ chức giảng dạy |
| Phụ huynh | Không | Phiên có thể neo tại hệ thống cũ, nhưng không được gán mới tại đây |

## Vai trò tại trường/trung tâm/cơ sở

| Vai trò | Chức năng chính |
|---|---|
| Quản lý đơn vị | Điều hành người dùng, học sinh, lớp, tài chính, tuyển sinh |
| Kế toán | Khoản thu, kỳ thu, công nợ, phiếu thu, điều chỉnh, báo cáo đơn vị |
| Tư vấn/tuyển sinh | Lead, chăm sóc, đăng ký, chuyển đổi thành học sinh |
| Học vụ | Hồ sơ học sinh, chương trình, lớp, lịch, xếp/chuyển lớp |
| Giáo viên | Lớp/lịch được phân công, điểm danh, báo giảng, nhận xét |
| Phụ huynh | Dữ liệu đúng con/lớp qua Portal |

## Khác biệt giáo viên theo loại hình

### Mầm non

Đã có:

- lớp và lịch được phân công;
- điểm danh, xin phép/vắng học;
- báo giảng và nhận xét từng trẻ;
- trao đổi và thông báo.

Còn cần module chuyên biệt:

- hồ sơ sức khỏe;
- giờ đón/trả và người đón thực tế;
- đánh giá phát triển thể chất, nhận thức, ngôn ngữ, tình cảm–xã hội, thẩm mỹ.

### Ngoại ngữ

Đã có:

- lớp và lịch dạy được phân công;
- điểm danh;
- báo giảng, nội dung bài học, bài tập;
- trao đổi và thông báo.

Còn cần module chuyên biệt:

- kiểm tra đầu vào/xếp trình độ;
- bài kiểm tra và điểm;
- đánh giá nghe, nói, đọc, viết;
- tiến độ theo chương/bài của chương trình.

## Khác biệt kế toán

### Kế toán hệ thống

- xem gộp danh mục khoản thu, kỳ thu, công nợ và báo cáo;
- theo dõi số liệu theo đơn vị;
- không tạo kỳ thu/phiếu thu/điều chỉnh tại node hệ thống;
- chuyển sang đơn vị cụ thể để thao tác.

### Kế toán đơn vị

- tạo và mở/đóng kỳ thu;
- sinh khoản phải thu;
- miễn giảm và thu nhiều lần;
- lập/duyệt điều chỉnh theo phân tách quyền;
- báo cáo trong đơn vị.

## Quy tắc đã được cưỡng chế trong code

- API tạo tài khoản và API gán thêm vai trò cùng dùng `role-policy.ts`.
- Không thể gọi API trực tiếp để gán giáo viên/học vụ/tuyển sinh tại node hệ thống.
- Không thể tạo quản trị hệ thống qua màn hình nhân sự.
- Không thể tạo phụ huynh ngoài luồng hồ sơ học sinh.
- Portal hiển thị mô tả phạm vi theo cấp đơn vị và loại hình đào tạo.
