# QUY ƯỚC ĐẶT TÊN

## Database
- Bảng: tiếng Việt không dấu, PascalCase, số ít: `HocSinh`, `PhuHuynh`, `LopHoc`.
- Bảng liên kết: ghép hai thực thể: `HocSinhPhuHuynh`, `LopHocGiaoVien`.
- Cột: camelCase: `donViId`, `hoTen`, `ngaySinh`, `trangThai`.
- Khóa chính: `id` kiểu BIGINT UNSIGNED.
- Khóa ngoại: `<tenBangCamelCase>Id`.
- Thời gian: `createdAt`, `updatedAt`, `deletedAt`.
- Trạng thái lưu bằng varchar/enum ứng dụng, không dùng số khó đọc.

## Mã nghiệp vụ
- Đơn vị: `DV0001`.
- Học sinh: `HS20260001`.
- Phụ huynh: `PH000001`.
- Lớp học: cấu hình theo đơn vị, ví dụ `EN-KID-A1-2601`.
- Phiếu thu: `PT-<DonVi>-<YYYYMM>-<STT>`.

## Code TypeScript
- Type/interface: PascalCase tiếng Anh hoặc tên miền chuẩn hóa.
- API route: tiếng Anh, ngắn và ổn định: `/api/students`, `/api/classes`.
- Nhãn UI: tiếng Việt chuẩn giáo dục.
- Enum nội bộ: tiếng Anh để code gọn; mapping nhãn tiếng Việt tập trung.
