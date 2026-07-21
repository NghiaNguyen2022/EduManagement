# Phân tích chi tiết — E01/E02/E03/E04: Chương trình, giáo viên, lớp học, xếp lớp

> Theo khung checklist mục 14 của BPD. Module liên quan: M05 — Chương trình & khóa học
> (P0), M06 — Lớp học & xếp lớp (P0). Phạm vi: chương trình đào tạo, hồ sơ giáo viên, lớp
> học, xếp học sinh vào lớp, phân công giáo viên. **Chưa** gồm E05-E08 (lịch học, kiểm tra
> xung đột, nghỉ/học bù, thời khóa biểu) — để bước riêng tiếp theo vì đó là một mạch dữ
> liệu khác (`LichHoc`/`BuoiHoc`) với logic kiểm tra thời gian phức tạp hơn.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu: quản lý chương trình đào tạo, hồ sơ giáo viên, tạo lớp và xếp học sinh vào lớp
  — làm nền cho lịch học (E05-E08), điểm danh (F) và học phí theo lớp (H).
- Actor chính: **Nhân viên học vụ** (`hoc_vu`). Vai trò này đã seed sẵn quyền
  `lop_hoc.xem`/`lop_hoc.quan_ly` từ Sprint 0 nhưng chưa từng dùng tới (module E chưa tồn
  tại) — không cần seed thêm quyền mới.

**Quyết định:** BPD mục 5 (vai trò) có nhắc "Quản lý chuyên môn" như vai trò riêng cho
chương trình/lớp/phân công/duyệt bài giảng, nhưng vai trò này **chưa từng được seed** vào
`VaiTro`. Ở MVP này, dùng vai trò `hoc_vu` (Nhân viên học vụ) đã có sẵn, đủ quyền
(`lop_hoc.xem`/`lop_hoc.quan_ly`) — không tạo vai trò mới khi chưa có nhu cầu tách bạch
thật (ví dụ duyệt bài giảng — thuộc module G, chưa làm). Sẽ xem xét tách "Quản lý chuyên
môn" thành vai trò riêng khi làm tới G (báo giảng/duyệt kết quả).

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Luồng chính — Tạo chương trình đào tạo (E01):**
1. Nhập mã chương trình (tự đặt, có ý nghĩa — khác `maHocSinh`/`maLead` chỉ cần duy nhất),
   tên, cấp độ (tuỳ chọn, ví dụ "A1", "Mầm"), tổng số buổi/giờ (tuỳ chọn), mô tả.
2. Không bắt buộc chọn loại hình đào tạo riêng cho chương trình — chương trình luôn thuộc
   đơn vị, đã có `loaiHinhDaoTao` từ `DonVi` (tránh trùng lặp dữ liệu).

**Luồng chính — Tạo hồ sơ giáo viên (E02, phần hồ sơ):**
1. Nhập họ tên, số điện thoại, email, chuyên môn, trình độ.
2. Mã giáo viên tự sinh (giống mã học sinh/phụ huynh — giáo viên không cần mã gợi nhớ).
3. **Không** làm cơ chế tạo tài khoản đăng nhập riêng cho giáo viên ở bước này (khác phụ
   huynh ở C07) — nhân viên đã có sẵn tài khoản qua Quản lý người dùng (vai trò `giao_vien`
   đã seed từ Sprint 0) thì có thể liên kết `GiaoVien.nguoiDungId` sau; hồ sơ giáo viên vẫn
   hữu ích và tra cứu được kể cả khi chưa có tài khoản.

**Luồng chính — Tạo lớp học (E02, phần lớp):**
1. Chọn chương trình (tuỳ chọn — cho phép lớp không gắn chương trình cụ thể ở giai đoạn
   đầu), nhập mã lớp (tự đặt), tên lớp, cấp độ, ngày bắt đầu/kết thúc dự kiến, sĩ số tối
   đa, phòng học.
2. Trạng thái mặc định `chuan_bi`.

**Luồng chính — Phân công giáo viên (E04):**
1. Từ lớp → chọn giáo viên, vai trò (giáo viên chính/hỗ trợ/chủ nhiệm), ngày hiệu lực.
2. Chỉ một giáo viên chính đang hoạt động tại một thời điểm cho một lớp; giáo viên hỗ trợ
   không giới hạn số lượng.

**Luồng chính — Xếp học sinh vào lớp (E03):**
1. Từ lớp hoặc từ hồ sơ học sinh → chọn học sinh, ngày vào lớp.
2. Kiểm tra sĩ số, ngày nhập học, trạng thái học sinh (mục 8).
3. Ghi `HocSinhLopHoc` mới.

**Luồng chính — Chuyển lớp:**
1. Đóng bản ghi `HocSinhLopHoc` hiện tại: `ngayRoiLop` = ngày chuyển, `lyDoRoiLop`,
   `trangThai = chuyen_lop`.
2. Tạo bản ghi `HocSinhLopHoc` mới cho lớp đích — **không update đè** bản ghi cũ (giữ lịch
   sử, đúng nguyên tắc BPD 7.2).

**Luồng ngoại lệ:**
- Xếp lớp khi lớp đã đủ sĩ số tối đa → chặn cứng (MVP chưa làm cơ chế "phê duyệt vượt sĩ
  số" — ghi lại làm quyết định giản lược, xem mục 3 BPD update).
- Xếp lớp khi học sinh đang `ngung_hoc`/`hoan_thanh` → chặn.
- Xếp lớp với `ngayVaoLop` trước `HocSinh.ngayNhapHoc` (nếu có) → chặn.
- Phân công giáo viên chính thứ hai khi đã có giáo viên chính đang hoạt động → chặn (phải
  kết thúc phân công cũ trước).
- Học sinh có thể xếp nhiều lớp cùng lúc (không unique constraint 1 học sinh - 1 lớp) —
  đúng BPD 7.2 "trung tâm có thể cho phép học viên học nhiều lớp/kỹ năng".

**Kết quả:** Lớp sẵn sàng với chương trình, giáo viên phụ trách và danh sách học sinh; mọi
thay đổi lớp/giáo viên giữ lịch sử.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- `LopHoc.trangThai`: `chuan_bi` → `dang_hoc` → (`tam_dung` ↔ `dang_hoc`) → `ket_thuc` /
  `huy`.
- `HocSinhLopHoc.trangThai`: `dang_hoc` → (`bao_luu` ↔ `dang_hoc`) → `chuyen_lop` /
  `ngung_hoc` / `hoan_thanh`.
- `LopHocGiaoVien.trangThai`: `hoat_dong` → `ngung_hoat_dong` (kết thúc phân công).

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `ChuongTrinhDaoTao.donViId`, `GiaoVien.donViId`, `LopHoc.donViId` bắt buộc.
- `LopHocGiaoVien`, `HocSinhLopHoc` không có `donViId` riêng — suy ra qua `lopHocId`
  (ràng buộc ở tầng service, cùng đơn vị với `giaoVienId`/`hocSinhId`).
- Có thời gian hiệu lực: `LopHocGiaoVien.tuNgay/denNgay`, `HocSinhLopHoc.ngayVaoLop/ngayRoiLop`.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `lop_hoc.xem` | `lop_hoc.quan_ly` |
| --- | --- | --- |
| Xem chương trình/giáo viên/lớp/danh sách học sinh trong lớp | Có | Có |
| Tạo/sửa chương trình, giáo viên, lớp | Không | Có |
| Phân công giáo viên, xếp/chuyển lớp học sinh | Không | Có |

## 6. Thông báo phát sinh và đối tượng nhận

- Chưa có (module Thông báo chưa triển khai).

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `ChuongTrinhDaoTao`: `maChuongTrinh` (nhập tay), `tenChuongTrinh` bắt buộc; unique
  `(donViId, maChuongTrinh)`.
- `GiaoVien`: `hoTen` bắt buộc; `maGiaoVien` tự sinh `GV<6 số>`; unique
  `(donViId, maGiaoVien)`.
- `LopHoc`: `maLop` (nhập tay), `tenLop` bắt buộc; unique `(donViId, maLop)`; nếu có
  `siSoToiDa` phải > 0.
- `LopHocGiaoVien`: không cho hai phân công `giao_vien_chinh` cùng hoạt động một lúc cho
  một lớp.
- `HocSinhLopHoc`: không cho xếp lớp nếu học sinh `ngung_hoc`/`hoan_thanh`; không cho vượt
  sĩ số; không cho `ngayVaoLop` trước `HocSinh.ngayNhapHoc` khi có.
- Audit log bắt buộc: tạo/sửa chương trình, giáo viên, lớp; phân công/kết thúc phân công
  giáo viên; xếp lớp/chuyển lớp/rời lớp.

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng ở bước này. `capDo` trên `ChuongTrinhDaoTao`/`LopHoc` dùng chung
  (mầm non ghi "Lá 1", ngoại ngữ ghi "A1/B2"...) — đủ linh hoạt mà không cần cấu hình theo
  loại hình.

## 10. Checklist test runtime và regression trước khi đóng task

- [ ] Tạo chương trình, giáo viên, lớp — đủ CRUD cơ bản.
- [ ] Xếp học sinh vào lớp đủ sĩ số tối đa → bị chặn ở học sinh tiếp theo.
- [ ] Xếp học sinh đang `ngung_hoc` → bị chặn.
- [ ] Xếp học sinh với ngày vào lớp trước ngày nhập học → bị chặn.
- [ ] Chuyển lớp: bản ghi cũ đóng đúng (`chuyen_lop`), bản ghi mới tạo riêng, không mất
      lịch sử.
- [ ] Học sinh xếp được 2 lớp cùng lúc (không bị chặn bởi ràng buộc 1-học sinh-1-lớp).
- [ ] Phân công giáo viên chính thứ hai khi đã có giáo viên chính hoạt động → bị chặn.
- [ ] `lop_hoc.xem` (không có `quan_ly`) gọi API tạo/sửa → 403.
- [ ] Dữ liệu đơn vị A không lọt sang đơn vị B.
- [ ] `pnpm typecheck` và `pnpm build` pass.
