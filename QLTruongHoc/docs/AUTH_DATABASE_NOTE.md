# Auth Database Note

## Quyết định hiện tại

Sprint 0B dùng mô hình session lưu database:

```text
PhienDangNhap
```

Lý do:

- Có thể logout và vô hiệu hóa phiên ngay.
- Dễ kiểm soát user bị khóa.
- Dễ ghi nhận đơn vị hiện tại.
- Phù hợp hệ thống quản trị nghiệp vụ.
- Có thể mở rộng cookie httpOnly ở bước API login.

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

Mỗi request nghiệp vụ phải xác định:

```text
nguoiDungId
donViHienTaiId
danhSachQuyen
```

Backend không được tin `donViId` do frontend tự truyền.
