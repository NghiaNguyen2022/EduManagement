# Xác thực và phân quyền theo cơ sở dữ liệu

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [Quyết định hiện tại](#quyết-định-hiện-tại)
- [Vai trò ban đầu](#vai-trò-ban-đầu)
- [Quy tắc đa đơn vị](#quy-tắc-đa-đơn-vị)

## Quyết định hiện tại

Hệ thống dùng phiên đăng nhập lưu trong cơ sở dữ liệu:

```text
PhienDangNhap
```

Lý do:

- Có thể đăng xuất và vô hiệu hóa phiên ngay.
- Dễ kiểm soát tài khoản bị khóa.
- Dễ ghi nhận đơn vị hiện tại.
- Phù hợp hệ thống quản trị nghiệp vụ.
- Cookie đăng nhập dùng `httpOnly` để giảm nguy cơ bị đọc từ mã JavaScript trên trình duyệt.

## Vai trò ban đầu

- Quản trị hệ thống
- Quản lý đơn vị
- Nhân viên tuyển sinh
- Nhân viên tư vấn
- Nhân viên học vụ
- Kế toán
- Giáo viên
- Phụ huynh

## Quy tắc đa đơn vị

Quyền của người dùng không gắn trực tiếp với tài khoản toàn hệ thống.

Quan hệ:

```text
NguoiDung
  → NguoiDungVaiTroDonVi
  → VaiTro
  → VaiTroQuyen
  → Quyen
```

Mỗi yêu cầu nghiệp vụ phải xác định:

```text
nguoiDungId
donViHienTaiId
danhSachQuyen
```

Máy chủ không được tin `donViId` do giao diện tự truyền.
