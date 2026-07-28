# Danh mục tài liệu dự án

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

Trang này là điểm bắt đầu của bộ tài liệu. Nội dung được chia theo nhu cầu để người đọc không
phải tìm trong các nhật ký kỹ thuật cũ.

## Mục lục

- [Bắt đầu sử dụng](#bắt-đầu-sử-dụng)
- [Quy chuẩn phát triển](#quy-chuẩn-phát-triển)
- [Kiến trúc và bảo mật](#kiến-trúc-và-bảo-mật)
- [Nghiệp vụ](#nghiệp-vụ)
- [Tiến độ dự án](#tiến-độ-dự-án)
- [Thuật ngữ dùng chung](#thuật-ngữ-dùng-chung)

## Bắt đầu sử dụng

| Tài liệu | Dành cho | Nội dung |
| --- | --- | --- |
| [README dự án](../README.md) | Mọi người | Tổng quan, cài đặt và chạy ứng dụng |
| [Chạy và triển khai](RUN_AND_DEPLOY.md) | Kỹ thuật triển khai | Môi trường phát triển, vận hành thật và hạ tầng |
| [Cấu hình cổng](PORT_CONFIGURATION.md) | Kỹ thuật triển khai | Cổng giao diện, API và kết nối chuyển tiếp |

## Quy chuẩn phát triển

| Tài liệu | Nội dung |
| --- | --- |
| [Phương án thực thi](01_EXECUTION_PLAN.md) | Cách triển khai theo từng luồng nghiệp vụ |
| [Quy ước đặt tên](02_NAMING_CONVENTION.md) | Tên bảng, cột, mã nghiệp vụ và code |
| [Quy chuẩn giao diện](DESIGN_SYSTEM_RULES.md) | Thành phần giao diện và cách sử dụng |

## Kiến trúc và bảo mật

| Tài liệu | Nội dung |
| --- | --- |
| [Nguồn schema chính thức](SCHEMA_SOURCE_OF_TRUTH.md) | Quy tắc cập nhật cấu trúc dữ liệu |
| [Xác thực và phân quyền](AUTH_DATABASE_NOTE.md) | Session, vai trò và cách ly đơn vị |
| [Ma trận vai trò](analysis/ROLE_ORG_EDUCATION_MATRIX.md) | Quyền theo vai trò và loại đơn vị |

## Nghiệp vụ

Các tài liệu trong thư mục [`analysis`](analysis/) mô tả quy trình, quy tắc dữ liệu, quyền và
kịch bản kiểm thử cho từng nhóm chức năng:

- Tuyển sinh, học sinh và phụ huynh.
- Chương trình, lớp học và lịch học.
- Điểm danh, xin phép và báo giảng.
- Khoản thu, công nợ, hoàn phí và báo cáo tài chính.
- Thông báo, trao đổi và portal theo vai trò.

Tên file có mã như `C01`, `E05`, `H08` tương ứng với mã chức năng trong checklist tổng.

## Tiến độ dự án

| Tài liệu | Nội dung |
| --- | --- |
| [Checklist tổng](00_MASTER_CHECKLIST.md) | Trạng thái chức năng theo nhóm nghiệp vụ |
| [Tóm tắt dự án](../PROJECT_SUMMARY.md) | Phạm vi và hiện trạng hệ thống |

Checklist là tài liệu quản lý nội bộ. Người sử dụng thông thường không cần đọc các chi tiết
triển khai trong tài liệu này.

## Thuật ngữ dùng chung

| Thuật ngữ | Cách hiểu |
| --- | --- |
| Đơn vị | Trường, trung tâm hoặc cơ sở đang vận hành |
| Đơn vị hệ thống | Phạm vi tổng hợp và quản trị toàn hệ thống |
| Portal | Trang làm việc theo đúng vai trò của người đăng nhập |
| Kỳ thu | Khoảng thời gian hoặc khóa học dùng để lập các khoản phải thu |
| Khoản phải thu | Số tiền một học sinh cần thanh toán trong một kỳ thu |
| Thu ròng | Tổng tiền đã thu trừ hoàn phí đã được duyệt |
| Lead | Người quan tâm hoặc hồ sơ tuyển sinh chưa chuyển thành học sinh |
| Multi-tenant | Cách ly dữ liệu giữa các đơn vị trong cùng hệ thống |
| BPD | Tài liệu mô tả quy trình nghiệp vụ |
