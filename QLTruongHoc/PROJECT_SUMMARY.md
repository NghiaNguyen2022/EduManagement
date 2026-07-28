# Tóm tắt dự án QLTruongHoc

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 0.4.0
**Cập nhật:** 28/07/2026

## Mục lục

- [Mục tiêu](#mục-tiêu)
- [Phạm vi hiện tại](#phạm-vi-hiện-tại)
- [Kiến trúc](#kiến-trúc)
- [Vai trò người dùng](#vai-trò-người-dùng)
- [Nguyên tắc dữ liệu](#nguyên-tắc-dữ-liệu)
- [Chất lượng và kiểm thử](#chất-lượng-và-kiểm-thử)
- [Phần việc tiếp theo](#phần-việc-tiếp-theo)

## Mục tiêu

QLTruongHoc là nền tảng quản lý dùng chung cho trường mầm non và trung tâm đào tạo. Hệ thống
cho phép một người dùng làm việc ở nhiều đơn vị nhưng chỉ sử dụng vai trò, quyền và dữ liệu
của đơn vị đang được chọn.

## Phạm vi hiện tại

Các nhóm chức năng chính đã có:

- Quản lý cây đơn vị, tài khoản, vai trò và quyền.
- Tuyển sinh, lịch chăm sóc và chuyển đổi thành học sinh.
- Hồ sơ học sinh, phụ huynh và tài khoản phụ huynh.
- Giáo viên, chương trình, lớp học, xếp lớp và lịch học.
- Điểm danh, xin phép nghỉ, báo giảng và nhận xét.
- Danh mục khoản thu, kỳ thu, công nợ, phiếu thu và điều chỉnh tài chính.
- Báo cáo thu, hoàn phí, thu ròng, chi phí và công nợ.
- Thông báo, trao đổi và portal theo vai trò.

Các nghiệp vụ chuyên sâu như sức khỏe mầm non, đón trả trẻ, kiểm tra đầu vào và đánh giá kỹ
năng ngoại ngữ vẫn thuộc giai đoạn tiếp theo.

## Kiến trúc

```text
React/Vite
    ↓ /api
Express Router
    ↓
Service nghiệp vụ
    ↓
Repository
    ↓
Drizzle ORM / MySQL
```

- Frontend không truy cập trực tiếp cơ sở dữ liệu.
- Router kiểm tra đăng nhập, đơn vị hiện tại và quyền trước khi gọi service.
- Service chịu trách nhiệm cho quy tắc nghiệp vụ.
- Repository là lớp duy nhất truy vấn dữ liệu.

## Vai trò người dùng

- Quản trị hệ thống.
- Quản lý đơn vị.
- Tuyển sinh và tư vấn.
- Học vụ.
- Kế toán.
- Giáo viên.
- Phụ huynh hoặc người giám hộ.

Mỗi vai trò có portal và menu phù hợp. Quản trị hệ thống dùng dashboard tổng hợp làm trang
chính; các vai trò nghiệp vụ sử dụng portal theo phạm vi công việc.

## Nguyên tắc dữ liệu

- Mọi dữ liệu nghiệp vụ phải thuộc một đơn vị cụ thể.
- Backend lấy đơn vị hiện tại từ phiên đăng nhập, không tin `donViId` do frontend tự gửi.
- Dữ liệu của hai đơn vị phải được cách ly ở repository hoặc service.
- Phụ huynh có thể theo dõi nhiều con ở nhiều đơn vị qua cùng một tài khoản.
- Các thao tác quan trọng được lưu vào nhật ký hệ thống.
- Điều chỉnh tài chính cần tách người lập và người duyệt.

## Chất lượng và kiểm thử

Trước khi bàn giao thay đổi, chạy:

```powershell
pnpm typecheck
pnpm test
pnpm build
```

Kiểm thử nghiệp vụ cần bao gồm quyền, cách ly đơn vị, trạng thái dữ liệu và trường hợp thao tác
lặp lại.

## Phần việc tiếp theo

Ưu tiên tiếp theo được quản lý trong [Checklist tổng](docs/00_MASTER_CHECKLIST.md), tập trung vào:

- Nghiệp vụ chuyên biệt theo loại hình đào tạo.
- Báo cáo quản trị và biểu đồ xu hướng.
- Mở rộng kiểm thử tự động cho các luồng API và giao diện.
- Thiết lập baseline migration chính thức.
