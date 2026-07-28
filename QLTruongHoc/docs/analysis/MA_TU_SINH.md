# Mã tự sinh — bỏ nhập tay ở 5 danh mục nội bộ

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [1. Phạm vi rà soát](#1-phạm-vi-rà-soát)
- [2. Cách sinh mã](#2-cách-sinh-mã)
- [3. Thay đổi ở từng lớp](#3-thay-đổi-ở-từng-lớp)
- [4. Seed script](#4-seed-script)
- [5. Kiểm thử](#5-kiểm-thử)

> Theo yêu cầu người dùng (2026-07-27): "rà soát lại các data, mã sẽ tự sinh, người dùng k nhập
> mã". Rà soát toàn bộ ứng dụng tìm các trường "Mã ..." còn cho người dùng gõ tay ở form tạo mới.

## 1. Phạm vi rà soát

Tìm mọi `TextField label="Mã ..."` không `disabled` ở client, đối chiếu với hàm `createXMoi` phía
server và `uniqueIndex` trên `maX` ở `drizzle/schemas/*.ts`. Kết quả: 6 danh mục có mã nội bộ do hệ
thống định danh, trong đó 5 đang cho nhập tay và 2 đã tự sinh sẵn từ trước (tham khảo để theo đúng
pattern).

| Thực thể | Mã | Trạng thái trước | Đã sửa |
| --- | --- | --- | --- |
| Lead (tuyển sinh) | `maLead` | Tự sinh sẵn (`sinhMaLead`, `LD<năm><stt>`) | — (mẫu tham khảo) |
| Giáo viên | `maGiaoVien` | Tự sinh sẵn (`sinhMaGiaoVien`, `GV<stt>`) | — (mẫu tham khảo) |
| Danh mục khoản thu | `maKhoanThu` | Nhập tay | ✅ `KT<stt 3 số>` |
| Kỳ thu | `maKyThu` | Nhập tay | ✅ `KY<năm><stt 4 số>` |
| Chương trình đào tạo | `maChuongTrinh` | Nhập tay | ✅ `CT<stt 3 số>` |
| Lớp học | `maLop` | Nhập tay | ✅ `LOP<stt 4 số>` |
| Danh mục chi phí | `maChiPhi` | Nhập tay | ✅ `CP<stt 3 số>` |

**Ngoại lệ có chủ đích — `DonVi.maDonVi` vẫn để nhập tay.** Khác về bản chất với 5 mục trên: (1) mã
đơn vị **duy nhất toàn hệ thống** (không theo phạm vi 1 đơn vị như các mã còn lại, nên không thể
đếm-theo-tiền-tố-trong-đơn-vị đơn giản như cách đang dùng), (2) mã có ý nghĩa gợi nhớ do con người
đặt (`TTNN-Q8`, `MN-HOA-NANG`) dùng để tra cứu nhanh giữa nhiều đơn vị — khác các mã tuần tự vô
nghĩa còn lại, (3) tần suất tạo đơn vị mới rất thấp (thao tác quản trị hệ thống, không phải nghiệp
vụ hằng ngày) nên rủi ro gõ sai/trùng thấp và không đáng để đánh đổi tính gợi nhớ. Nếu người dùng
vẫn muốn tự sinh luôn mã đơn vị, cần xác nhận thêm quy tắc đặt tên (vì không thể suy ra từ tên đơn
vị một cách tự động đáng tin cậy).

Hai trường "Mã số thuế"/"Mã giấy phép" ở `DonViDetailPage.tsx`/`OrganizationTreePage.tsx` cũng để
nhập tay nhưng **không thuộc phạm vi rà soát này** — đó là mã số do cơ quan nhà nước cấp (thuế, giấy
phép kinh doanh), không phải mã định danh nội bộ do hệ thống quản lý.

## 2. Cách sinh mã

Mỗi hàm `sinhMaX(donViId)` đếm số bản ghi hiện có của đơn vị có `maX` bắt đầu bằng tiền tố cố định
(`like(table.maX, "PREFIX%")`), rồi ghép `PREFIX + (đếm + 1)` (đệm 0 theo độ dài quy ước). Mẫu này
giữ nguyên cách `sinhMaLead`/`sinhMaGiaoVien` đã làm trước đó — không đổi kiến trúc, chỉ áp dụng
thêm cho 5 danh mục còn lại.

- `sinhMaKhoanThu` — `server/services/taiChinh.service.ts`, đếm qua
  `countDanhMucKhoanThuTheoMaPrefix` (`server/db/taiChinh.repository.ts`).
- `sinhMaKyThu` — cùng file, tiền tố gồm cả năm hiện tại (`KY<năm>`) để mã không dài vô hạn qua các
  năm, đếm qua `countKyThuTheoMaPrefix`.
- `sinhMaChuongTrinh` — `server/services/chuongTrinh.service.ts`, đếm qua
  `countChuongTrinhTheoMaPrefix` (`server/db/chuongTrinh.repository.ts`).
- `sinhMaLopHoc` — `server/services/lopHoc.service.ts`, đếm qua `countLopHocTheoMaPrefix`
  (`server/db/lopHoc.repository.ts`).
- `sinhMaChiPhi` — `server/services/chiPhi.service.ts`, đếm qua `countDanhMucChiPhiTheoMaPrefix`
  (`server/db/chiPhi.repository.ts`).

Vì đếm theo tiền tố trong phạm vi 1 đơn vị (`donViId`), mã không bị trùng giữa các đơn vị khác nhau
dù cùng số thứ tự (ví dụ 2 đơn vị có thể cùng có `LOP0001`) — đúng với việc mỗi mã chỉ có ý nghĩa
tra cứu nội bộ trong đơn vị đó.

## 3. Thay đổi ở từng lớp

- **Server (service)**: bỏ tham số `maX` khỏi input của `createXMoi`, bỏ luôn bước validate
  "không được để trống"/kiểm tra trùng mã thủ công (không còn cần vì hệ thống tự đảm bảo duy nhất
  theo cách đếm ở trên); gọi `sinhMaX(donViId)` trước khi insert.
- **Server (router)**: bỏ dòng đọc `maX` từ `req.body`.
- **Client (types)**: bỏ trường `maX` khỏi các `XFormInput` type; các `XItem` type (hiển thị, chỉ
  đọc) vẫn giữ `maX` vì đây là dữ liệu server trả về sau khi tạo.
- **Client (api)**: đơn giản hoá vài chỗ trước đó dùng `Omit<FormInput, "maX">` cho hàm update (giờ
  update dùng thẳng `FormInput` vì `maX` không còn là 1 field của form).
- **Client (pages)**: bỏ `maX: ""` khỏi state khởi tạo form rỗng, xoá hẳn khối `<TextField
  label="Mã ...">` tương ứng ở form tạo mới. Các chỗ hiển thị mã (bảng danh sách, tiêu đề trang chi
  tiết, kết quả tìm kiếm) giữ nguyên vì vẫn đọc từ dữ liệu server, chỉ khác là không còn ô nhập.

## 4. Seed script

`sinhMaX` sinh mã không đoán trước được (phụ thuộc số bản ghi đã có tại thời điểm chạy), nên 2 seed
script trước đó dùng `findXByMa(donViId, "MA_CO_DINH")` để kiểm tra "đã seed chưa" (idempotency)
không còn dùng được. Sửa sang tra theo tên (`listXByDonVi(donViId).find(item => item.tenX ===
"...")`):

- `server/scripts/seedMamNonTeacherTest.ts` — khoản thu, kỳ thu, chương trình, lớp học.
- `server/scripts/seedSampleData.ts` — chương trình (dùng làm điều kiện chặn chạy lại toàn bộ khối
  seed, nên các lớp học tạo sau đó trong cùng khối không cần thêm điều kiện riêng).

## 5. Kiểm thử

Gọi trực tiếp 5 hàm service (`createDanhMucKhoanThuMoi`, `createKyThuMoi`, `createChuongTrinhMoi`,
`createLopHocMoi`, `createDanhMucChiPhiMoi`) qua script tạm cho đơn vị `TTNN-Q8`, dọn dữ liệu test
ngay sau đó. Kết quả mã sinh ra đúng định dạng kỳ vọng:

```
KT001        (danh mục khoản thu)
KY20260001   (kỳ thu — năm 2026)
CT001        (chương trình đào tạo)
LOP0001      (lớp học)
CP001        (danh mục chi phí)
```

`npx tsc --noEmit` (cả `tsconfig.json` và `tsconfig.server.json`) sạch sau mỗi bước sửa — dùng để
tìm toàn bộ nơi gọi còn truyền `maX` cũ (router, seed script, client form) thay vì chỉ dựa vào
grep thủ công.
