# Rà soát full quy trình tại đơn vị — đối chiếu BPD cho 3 luồng: kế toán, tuyển sinh, đào tạo/giáo vụ

**Tác giả:** Nhóm phát triển QLTruongHoc
**Phiên bản:** 1.0
**Cập nhật:** 28/07/2026

## Mục lục

- [1. Đã sửa trong đợt này (nhóm b)](#1-đã-sửa-trong-đợt-này-nhóm-b)
- [2. Đối chiếu chi tiết theo từng flow (đã đúng + còn thiếu)](#2-đối-chiếu-chi-tiết-theo-từng-flow-đã-đúng-còn-thiếu)
- [3. Đề xuất (nhóm c — phạm vi lớn hoặc cần quyết định, chưa code)](#3-đề-xuất-nhóm-c-phạm-vi-lớn-hoặc-cần-quyết-định-chưa-code)
- [4. Không phát hiện thêm ở đợt này](#4-không-phát-hiện-thêm-ở-đợt-này)

> Bắt đầu 2026-07-27, theo yêu cầu "đi full quy trình tại đơn vị, học từ các hệ thống khác, nắm
> bắt nghiệp vụ thật chuẩn". Nguồn chuẩn dùng để đối chiếu: `extracted.txt` (nội dung trích từ
> `BPD_App_Quan_Ly_Truong_Hoc_Trung_Tam_v0.1.docx`, mục 7 "Quy trình nghiệp vụ cốt lõi" — đây là
> tài liệu yêu cầu nghiệp vụ gốc của dự án, không phải hệ thống ngoài). Với từng flow, đối chiếu
> đúng câu "Quy tắc trọng yếu" trong BPD với code thật (đọc service/repository, không đoán), phân
> vào 3 nhóm: (a) đã đúng, (b) sai/thiếu — sửa ngay nếu phạm vi nhỏ + rủi ro thấp, (c) sai/thiếu
> nhưng phạm vi lớn hoặc cần quyết định nghiệp vụ — chỉ ghi nhận, không tự ý code.

## 1. Đã sửa trong đợt này (nhóm b)

### 1.1 Sĩ số lớp — thiếu đường "vượt sĩ số có phê duyệt" (E03)

BPD 7.2: *"Không vượt sĩ số nếu không có quyền phê duyệt."* Câu này ngụ ý PHẢI có một đường vượt
được cho vai trò đủ thẩm quyền — code cũ (`lopHoc.service.ts#validateXepLop`) chặn cứng
`throw new Error("Lớp đã đủ sĩ số tối đa.")` cho MỌI vai trò, kể cả quản lý đơn vị/quản trị hệ
thống. Đã sửa: thêm `coQuyenVuotSiSo` (do router tính từ `don_vi.quan_ly`/`he_thong.quan_tri`,
không mở cho `lop_hoc.quan_ly` thường), audit log ghi rõ khi có vượt. Test tay qua service layer
thật: dựng lớp đủ sĩ số → chặn đúng khi không có quyền, vượt được khi có quyền, dữ liệu test dọn
sạch sau khi xong.

### 1.2 Xung đột lịch học — thiếu chiều "học viên" (E06)

BPD 7.3: *"Kiểm tra xung đột giáo viên, phòng và học viên."* Code cũ
(`findConflictingBuoiHoc`) chỉ kiểm tra phòng học và giáo viên — hoàn toàn không kiểm tra một học
sinh có bị xếp lịch chồng giờ giữa 2 lớp họ cùng theo học hay không. Vì BPD 7.2 cũng nói rõ
*"trung tâm có thể cho phép học viên học nhiều lớp/kỹ năng"* nên không thể chặn "học 2 lớp" —
chỉ cần chặn khi 2 buổi học CHỒNG GIỜ thật. Đã thêm `findHocSinhConflictingBuoiHoc`
(`lichHoc.repository.ts`) — join `HocSinhLopHoc` (sĩ số lớp đang lên lịch) với chính học sinh đó
ở MỘT lớp khác đang theo học, kiểm tra buổi học của lớp kia có chồng giờ trong cùng ngày không.
Áp dụng ở cả 3 điểm tạo/sửa buổi (`sinhBuoiHoc`, `taoBuoiHocBu`, `suaBuoiHoc`), thông báo nêu rõ
tên học sinh + lớp gây trùng, cùng phong cách với thông báo trùng phòng/giáo viên đã có.

## 2. Đối chiếu chi tiết theo từng flow (đã đúng + còn thiếu)

### 2.1 Kế toán — 7.6 "Kỳ thu và thu học phí"

| Quy tắc BPD | Hiện trạng |
|---|---|
| Tách "định nghĩa kỳ thu" và "khoản phải thu thật" | ✅ Đúng — `KyThu` (định nghĩa) tách khỏi `KhoanPhaiThu` (thật), đúng kiến trúc BPD yêu cầu. |
| Mỗi khoản phải thu phải truy về học viên, kỳ, **lớp/chương trình**, loại phí | ⚠️ Thiếu một phần — `KhoanPhaiThu` không có cột `lopHocId`/`chuongTrinhId`. "Sinh khoản phải thu" nhận `lopHocId` chỉ để lấy danh sách học sinh (roster), không lưu lại — sau khi tạo, không thể báo cáo "công nợ/doanh thu theo lớp". Đã kiểm tra kỹ mô hình: một kỳ thu áp dụng CÙNG một bộ khoản thu cho mọi lớp trong roster được chọn (không phải mỗi lớp một mức phí khác nhau trong cùng kỳ thu), nên **không phải lỗi mất tiền** (không có chuyện học sinh học 2 lớp bị thiếu phí) — chỉ là thiếu một chiều dữ liệu cho báo cáo. Xem mục 3.1 (đề xuất, chưa làm).|
| Không xóa giao dịch đã thu; dùng hủy/hoàn/điều chỉnh có chứng từ | ✅ Đúng — `PhieuThu` không có API xóa; hoàn/chuyển/bảo lưu qua `DieuChinhKhoanPhaiThu` (H08) có chứng từ + duyệt. |
| Phân quyền người lập, người thu, người duyệt | ⚠️ Một phần — đã tách "lập/thu" (`tai_chinh.quan_ly`) khỏi "duyệt" (`tai_chinh.duyet`, dùng cho H08 và Chi phí mới làm), nhưng "lập kỳ thu" và "thu tiền" vẫn dùng chung một quyền `tai_chinh.quan_ly`, chưa tách thành 3 tầng như BPD liệt kê. Xem mục 3.2 (đề xuất, chưa làm). |
| Hoàn/hủy/điều chỉnh theo quy trình phê duyệt | ✅ Đúng — H08 đã có; Chi phí cũng đã chuyển sang có duyệt (đợt trước, 2026-07-27). |

**Học phí vs Chi phí** (người dùng nhấn mạnh cần phân biệt rõ): `KhoanPhaiThu`/`PhieuThu` (tiền
THU từ học viên — học phí, tiền ăn, tài liệu...) và `ChiPhi` (tiền CHI ra vận hành — lương, mặt
bằng, điện nước...) là hai luồng **hoàn toàn tách biệt** trong code, đúng yêu cầu — không có chỗ
nào lẫn lộn hai khái niệm này.

### 2.2 Tuyển sinh — 7.1 "Tuyển sinh và chuyển đổi thành học viên"

| Quy tắc BPD | Hiện trạng |
|---|---|
| Lead không tự động thành học viên nếu chưa xác nhận đăng ký | ✅ Đúng — C06 yêu cầu xác nhận rõ ràng qua form riêng. |
| Một học viên nhiều người giám hộ, phải có người liên hệ chính | ✅ Đúng — `laLienHeChinh` (D03). |
| Tài khoản phụ huynh liên kết theo guardian-person, không trùng | ✅ Đúng — dedup theo số điện thoại toàn hệ thống (D03), có xác nhận khi ghép khác đơn vị. |
| Lịch sử chăm sóc lưu, không ghi đè | ✅ Đúng — `LeadHoatDong` append-only (C03). |
| Tổ chức kiểm tra đầu vào/tham quan nếu cần | ❌ Chưa có — đúng khoảng trống đã biết từ trước (C05, để Sprint 7 theo `docs/00_MASTER_CHECKLIST.md`), không phát hiện mới. |
| Chọn chương trình/lớp dự kiến; tạo khoản phải thu hoặc **yêu cầu đặt cọc** | ❌ Chưa có — xác nhận đăng ký (C04/C06) hiện KHÔNG tạo khoản phải thu/đặt cọc nào; việc sinh khoản phải thu là một bước tài chính riêng, tách rời, do kế toán làm sau khi học sinh đã vào lớp. Xem mục 3.3 (đề xuất, chưa làm). |

### 2.3 Đào tạo/giáo vụ — 7.2 "Tạo lớp và xếp học viên", 7.3 "Lịch học"

| Quy tắc BPD | Hiện trạng |
|---|---|
| Không vượt sĩ số nếu không có quyền phê duyệt | ✅ Đã sửa ở mục 1.1. |
| Không xếp học viên trước ngày nhập học/sau ngày kết thúc | ✅ Đúng — chặn ngày vào lớp trước `ngayNhapHoc`. |
| Mọi chuyển lớp giữ lịch sử, ngày hiệu lực | ✅ Đúng — E03/D06, không ghi đè. |
| Mầm non ưu tiên lớp cố định; trung tâm cho học nhiều lớp/kỹ năng | ✅ Đúng về mặt dữ liệu — không có ràng buộc "một học sinh một lớp" cứng, phù hợp mô hình nhiều lớp. |
| Kiểm tra xung đột giáo viên, phòng, **học viên** | ✅ Đã sửa ở mục 1.2 (thiếu chiều học viên). |
| Ngày nghỉ không xóa buổi đã có điểm danh, phải đổi trạng thái | ✅ Đúng — theo `docs/analysis/E05_E08_lich_hoc.md`, buổi nghỉ đổi `trangThai='nghi'`, không xóa. |
| Chỉ một giáo viên chính hoạt động một lúc cho một lớp | ✅ Đúng — E04. |

## 3. Đề xuất (nhóm c — phạm vi lớn hoặc cần quyết định, chưa code)

### 3.1 Công nợ/doanh thu theo lớp

Thêm `lopHocId` (nullable — vì một kỳ thu có thể áp dụng chung nhiều lớp) vào `KhoanPhaiThu`, ghi
lại đúng lớp đã dùng để sinh khoản phải thu đó (`sinhKhoanPhaiThuChoLop` đã có sẵn tham số này,
chỉ thiếu lưu). Mở khả năng báo cáo "công nợ/doanh thu theo lớp" — hữu ích cho quản lý chuyên môn
đối chiếu lớp nào đóng góp doanh thu nhiều. Rủi ro thấp (thêm cột nullable, không đổi luồng hiện
có), nhưng cần quyết định: học sinh học nhiều lớp trong cùng kỳ thu thì gán khoản phải thu cho
lớp nào (lớp đầu tiên sinh ra, hay để NULL "dùng chung nhiều lớp")?

### 3.2 Tách quyền "người thu" khỏi "người lập" (kế toán) — **ĐÃ QUYẾT ĐỊNH: không làm**

Người dùng xác nhận (2026-07-27): mỗi đơn vị chỉ cần một vai trò kế toán duy nhất, lập và thu làm
chung — đúng thực tế trung tâm nhỏ (một người kế toán làm cả hai việc). Giữ nguyên
`tai_chinh.quan_ly` gộp lập+thu như hiện tại, không tách thêm quyền `tai_chinh.thu`. Đóng đề xuất
này, không cần xác nhận lại.

### 3.3 Đặt cọc/khoản phải thu ngay khi xác nhận đăng ký (tuyển sinh) — **ĐÃ LÀM (2026-07-27)**

Câu hỏi mở: người "lập" khoản phải thu/đặt cọc lúc xác nhận đăng ký có nên là tư vấn/tuyển sinh
không? Đã thống nhất: **không** — giữ đúng nguyên tắc "kế toán là nơi duy nhất tạo dữ liệu tài
chính" vừa chốt ở mục 3.2, không mở quyền `tai_chinh.*` cho vai trò `tuyen_sinh`/`tu_van`. Thay vào
đó, làm đúng tinh thần BPD 7.1 (kế toán là một actor của luồng tuyển sinh, không phải actor duy
nhất chủ động) bằng cách **tự động nhắc kế toán** thay vì để tuyển sinh tự tạo:

- `taiChinh.repository.ts#countHocSinhChuaCoKhoanPhaiThu`/`...AllDonVi` — đếm học sinh còn
  `tiep_nhan`/`dang_hoc` mà **chưa từng** có `KhoanPhaiThu` nào (không dùng mốc "N ngày gần đây"
  vì dễ lệch — học sinh cũ đã có lịch sử thu sẽ không bị tính nhầm dù đang giữa 2 kỳ thu).
- Thêm `hocSinhChuaCoKhoanPhaiThu` vào `DashboardSummary`, hiển thị ở "Cần chú ý" của **cả 2**
  Portal kế toán và quản lý đơn vị (quản lý đơn vị cần thấy vì họ giám sát toàn đơn vị, không chỉ
  kế toán).
- Test tay qua UI thật (`demo_ketoan_nn` và `demo_quanly_nn`, cùng đơn vị TTNN-Q8): cả 2 Portal
  đều hiện đúng "3 học sinh" — khớp dữ liệu mẫu thật, không lỗi console.

Không thêm bảng/quyền mới, không đổi luồng C04/C06 hiện có — kế toán vẫn tự quyết định tạo kỳ thu/
khoản phải thu như cũ, chỉ được nhắc sớm hơn thay vì phải tự nhớ rà soát học sinh mới.

## 4. Không phát hiện thêm ở đợt này

Đối chiếu xong toàn bộ "Quy tắc trọng yếu" trong BPD mục 7.1 (tuyển sinh), 7.2 (tạo lớp/xếp học
viên), 7.3 (lịch học), 7.6 (kỳ thu/thu học phí) — các mục còn lại của 3 flow này đều khớp code
thật, không phát hiện sai lệch mới ngoài 2 mục đã sửa (1.1, 1.2) và 3 đề xuất (3.1-3.3). Các
khoảng trống đã biết từ trước (C05 kiểm tra đầu vào, G04-G07 kết quả/tiến độ/kỹ năng/phát triển
mầm non, L02/L03 báo cáo) không lặp lại ở đây — đã có trong `docs/00_MASTER_CHECKLIST.md` và
`docs/analysis/QUAN_LY_DON_VI_PORTAL.md`.
