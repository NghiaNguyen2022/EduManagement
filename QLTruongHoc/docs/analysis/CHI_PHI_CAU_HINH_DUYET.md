# Phân tích — Cấu hình duyệt chi theo đơn vị

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [1. Thiết kế](#1-thiết-kế)
- [2. Việc đã làm](#2-việc-đã-làm)
- [3. Test tay qua API/service thật (đơn vị TTNN-Q8)](#3-test-tay-qua-apiservice-thật-đơn-vị-ttnn-q8)

> 2026-07-27, theo yêu cầu mục 4: *"Danh mục chi cố định do kế toán tạo và quản trị đơn vị duyệt;
> Đề xuất chi cũng thế; chi đột xuất cũng vậy; ba phần này phải được cấu hình trong quyền quản
> trị đơn vị, để cho phép kế toán thao tác không cần duyệt."* Làm rõ qua hỏi đáp trước khi code:
> "Danh mục chi cố định" = danh mục chi phí hiện có (không phải khái niệm mới); "Chi đột xuất"
> không phải luồng riêng — chỉ là nhãn phân loại khi tạo đề xuất chi; cấu hình là 3 công tắc
> riêng biệt (không phải 1 công tắc chung).

## 1. Thiết kế

Bảng mới `CauHinhTaiChinhDonVi` (1 dòng/đơn vị, tạo lười — đơn vị chưa cấu hình dùng mặc định qua
code, không cần seed trước): `duyetDanhMucChiPhi`, `duyetChiDinhKy`, `duyetChiDotXuat` (đều mặc
định `true` — khớp hành vi "luôn cần duyệt" đã có từ đợt trước, đơn vị tự nới lỏng khi tin tưởng
kế toán, không đổi mặc định cho đơn vị chưa từng cấu hình).

- **Danh mục chi phí**: thêm `trangThaiDuyet` (`khong_can_duyet`/`cho_duyet`/`da_duyet`/`tu_choi`)
  — tách khỏi `trangThai` (bật/tắt sử dụng) vì là 2 trục khác nhau. Danh mục cũ (tạo trước đợt
  này) backfill về `khong_can_duyet` — không hồi tố yêu cầu duyệt cho dữ liệu đã có sẵn.
- **Đề xuất chi**: thêm `loaiDeXuat` (`dinh_ky`/`dot_xuat`), chọn khi tạo. Quyết định `trangThai`
  ban đầu (`cho_duyet` hay `da_duyet` thẳng) tra theo cấu hình tương ứng loại đó tại thời điểm tạo
  — không phải luồng riêng, tái dùng nguyên `ghiNhanChiPhi`/`duyetChiPhi` đã có.
- Cấu hình chỉ **quản lý đơn vị/quản trị hệ thống** sửa được (`don_vi.quan_ly`/`he_thong.quan_tri`)
  — kế toán chỉ xem, không tự cấp quyền tự chủ cho chính mình.
- Duyệt danh mục dùng lại đúng quyền `tai_chinh.duyet` (không tạo quyền mới) và quy tắc "người
  duyệt khác người lập" giống H08/Chi phí.

## 2. Việc đã làm

- Schema: `CauHinhTaiChinhDonVi` (mới), `DanhMucChiPhi.trangThaiDuyet/nguoiTaoId/nguoiDuyetId/
  ghiChuDuyet/duyetAt`, `ChiPhi.loaiDeXuat`. Migration `database/030_add_cau_hinh_tai_chinh_don_vi.sql`.
- Repository: `getCauHinhTaiChinhDonVi`/`upsertCauHinhTaiChinhDonVi` (đơn vị chưa cấu hình trả về
  mặc định qua code, không đọc từ bảng rỗng); `updateDanhMucChiPhiQuyetDinh`,
  `listDanhMucChiPhiChoDuyet`, `countDanhMucChiPhiChoDuyet`; `createChiPhi`/`createDanhMucChiPhi`
  nhận thêm `loaiDeXuat`/`trangThaiDuyet`.
- Service: `createDanhMucChiPhiMoi` tra cấu hình → `cho_duyet` hoặc `khong_can_duyet`;
  `ghiNhanChiPhi` tra cấu hình theo `loaiDeXuat` → `cho_duyet` hoặc `da_duyet` thẳng; thêm
  `duyetDanhMucChiPhi`, `getCauHinhTaiChinh`/`updateCauHinhTaiChinh`.
- Router: `GET`/`PATCH /api/tai-chinh/cau-hinh-don-vi`, `GET /api/tai-chinh/danh-muc-chi-phi/
  cho-duyet`, `POST /api/tai-chinh/danh-muc-chi-phi/:id/duyet`; `POST /chi-phi` nhận `loaiDeXuat`.
- `ChiPhiPage.tsx`: khối "Cấu hình duyệt chi" (3 công tắc, chỉ quản lý đơn vị/quản trị hệ thống
  thấy); bảng Danh mục chi phí thêm cột "Duyệt" + nút Duyệt/Từ chối; form Đề xuất chi thêm chọn
  "Loại đề xuất"; dropdown danh mục trong form chỉ hiện danh mục đã dùng được (`khong_can_duyet`
  hoặc `da_duyet`, không phải `cho_duyet`/`tu_choi`).

## 3. Test tay qua API/service thật (đơn vị TTNN-Q8)

- Cấu hình mặc định (chưa từng chỉnh) → cả 3 đều `true`, khớp thiết kế.
- Tắt `duyetChiDinhKy` → tạo đề xuất "định kỳ" ra thẳng `da_duyet`; tạo đề xuất "đột xuất" (cấu
  hình vẫn `true`) vẫn ra `cho_duyet` — đúng 2 công tắc độc lập nhau.
- Tạo danh mục mới (cấu hình `duyetDanhMucChiPhi=true`) → `trangThaiDuyet=cho_duyet`; tự duyệt bị
  chặn đúng thông báo; duyệt bởi tài khoản khác → `da_duyet`.
- Dữ liệu test đã xoá, cấu hình khôi phục về mặc định (`true` cả 3) sau khi xác nhận xong. `tsc`
  sạch cả client/server; UI thật không lỗi console.
