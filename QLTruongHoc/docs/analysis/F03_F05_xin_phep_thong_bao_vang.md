# Phân tích chi tiết — F03/F05: Đơn xin phép nghỉ và thông báo vắng học

> Theo khung checklist mục 14 của BPD. Module liên quan: M07 — Điểm danh (P0), phần còn lại
> sau F01/F02/F04 (xem `docs/analysis/F01_F02_F04_diem_danh.md`). Lúc đó F03 (phụ huynh gửi
> đơn xin phép) và F05 (thông báo vắng học cho phụ huynh) phải để sau vì Portal phụ huynh
> (J01) và module Thông báo (I01) chưa tồn tại. Cả hai đã hoàn tất từ 2026-07-22 nên triển
> khai tiếp ở đây. F06 (mầm non: giờ đón/trả) vẫn để riêng như đã ghi chú trước.
>
> Cập nhật (cùng ngày, sau phản hồi giao diện): bổ sung `lopHocId` **bắt buộc** vào
> `DonXinPhep` — một học sinh ở trung tâm ngoại ngữ có thể học nhiều lớp cùng lúc, xin phép
> phải rõ đúng lớp nào thay vì áp dụng mơ hồ lên mọi lớp đang học. Duyệt đơn nay chỉ cập nhật
> điểm danh của đúng lớp đã chọn (đơn giản hơn bản đầu — không còn phải lặp qua mọi lớp đang
> học của học sinh). Sửa lại layout phiếu trong Portal: bản đầu lỡ dùng nhầm class
> `.user-create-form` (grid 5-6 cột dành cho trang rộng, khoá theo bề rộng màn hình) nhét vào
> thẻ con hẹp (~400px) trong Portal, gây vỡ layout — đổi sang class riêng `.portal-leave-form`
> xếp dọc từng trường, an toàn với khung cha hẹp. Nhân tiện bổ sung nhập tắt cho mọi
> `DateField` dùng chung toàn hệ thống (`client/src/components/form/dateUtils.ts`): gõ
> `t`/`d` = hôm nay; 1-2 số = ngày (tháng/năm hiện tại); 3-5 số = ngày+tháng (năm hiện tại); 6
> số = 2 số cuối là năm (tự thêm `20` phía trước); 7-8 số = năm đầy đủ như gõ tay bình thường.

## 1. Mục tiêu nghiệp vụ và actor chính

- Mục tiêu F03: cho phép phụ huynh chủ động báo nghỉ cho con qua Portal, thay vì chỉ báo
  miệng/điện thoại cho giáo viên — giảm vắng "không phép" oan do thiếu kênh báo trước.
- Mục tiêu F05: khi một buổi học được ghi nhận "vắng không phép", tự động làm nổi bật thông
  tin này cho phụ huynh ngay trong Portal — không cần nhân viên gọi điện báo riêng.
- Actor chính F03: **Phụ huynh** (`phu_huynh`) — gửi đơn ngay trong Portal, chỉ thao tác được
  với đúng con của mình (xác thực qua liên kết `PhuHuynh`/`HocSinhPhuHuynh`, không dựa vào
  đơn vị đang chọn của phiên đăng nhập — xem mục 4).
- Actor phụ F03: **Giáo viên** (`giao_vien`, có `diem_danh.thuc_hien`) — duyệt/từ chối đơn.
  **Nhân viên học vụ** (`hoc_vu`, chỉ có `diem_danh.xem`) — xem danh sách đơn, không duyệt
  được, đúng ma trận quyền đã có từ F01/F02/F04 (chỉ ai có `diem_danh.thuc_hien` mới được ghi
  đè dữ liệu điểm danh).
- F05 không có actor thao tác — là hệ quả tự động của việc điểm danh (F02), hiển thị thụ động
  cho phụ huynh.

## 2. Điểm bắt đầu, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả

**Luồng chính — Gửi và duyệt đơn xin phép (F03):**
1. Phụ huynh vào Portal (`/portal/parent`), ở thẻ con muốn xin phép, bấm "+ Gửi đơn xin phép
   mới" → chọn từ ngày, đến ngày, nhập lý do → gửi. Đơn tạo ở trạng thái `cho_duyet`.
2. Nhân viên có `diem_danh.xem` mở `/attendance/xin-phep` (vào từ nút "Đơn xin phép" trên
   trang Điểm danh), thấy danh sách đơn của đơn vị đang chọn.
3. Nhân viên có `diem_danh.thuc_hien` bấm "Duyệt" hoặc "Từ chối" (qua `ConfirmDialog`).
4. Nếu **duyệt**: hệ thống tự tìm mọi buổi học của các lớp học sinh đang học/bảo lưu, trong
   đúng khoảng ngày xin phép (giao với khoảng ngày ghi danh), loại buổi `nghi`/`huy`. Với mỗi
   buổi **chưa có bản ghi `DiemDanh`**, tự tạo dòng `vang_co_phep` kèm ghi chú tham chiếu số
   đơn. Buổi đã điểm danh trước đó (nhân viên đã ghi tay) — **giữ nguyên**, không ghi đè.
5. Nếu **từ chối**: chỉ đổi trạng thái đơn, không đụng tới điểm danh.

**Luồng chính — Cảnh báo vắng học (F05):**
1. Giáo viên/học vụ điểm danh một buổi (F02), đánh dấu một học sinh `vang_khong_phep`.
2. Lần tiếp theo phụ huynh của học sinh đó mở Portal, thẻ con hiện banner cảnh báo đỏ ngay
   sau phần thông tin cơ bản, liệt kê tối đa 5 buổi vắng không phép trong 30 ngày gần nhất.
3. Không có luồng "xác nhận đã đọc" — đây là dữ liệu chỉ xem, tự làm mới mỗi lần tải Portal.

**Luồng ngoại lệ:**
- Phụ huynh gửi đơn cho một học sinh không phải con của mình (thao tác trực tiếp API) →
  chặn, báo lỗi "Không tìm thấy học sinh trong danh sách con của bạn."
- Ngày bắt đầu sau ngày kết thúc, hoặc thiếu lý do → chặn ở tầng service.
- Duyệt một đơn đã `da_duyet`/`tu_choi` → chặn, báo lỗi "Đơn đã được xử lý."
- `diem_danh.xem` (không có `diem_danh.thuc_hien`) gọi API duyệt đơn → 403.
- Học sinh không còn ghi danh lớp nào còn hiệu lực trong khoảng ngày xin phép → đơn vẫn duyệt
  được (đổi trạng thái đơn), chỉ là không có buổi nào để tự động cập nhật điểm danh.

**Kết quả:** Đơn xin phép có đầy đủ vòng đời `cho_duyet → da_duyet|tu_choi`; nếu duyệt, các
buổi học chưa điểm danh trong khoảng ngày tự chuyển `vang_co_phep`. Phụ huynh luôn thấy ngay
tình trạng vắng không phép của con mà không cần nhân viên chủ động liên hệ.

## 3. Danh sách trạng thái và quy tắc chuyển trạng thái

- `DonXinPhep.trangThai`: `cho_duyet` → `da_duyet` | `tu_choi` — một chiều, không chuyển
  ngược (giống `DieuChinhKhoanPhaiThu` ở H08 — đơn đã xử lý không sửa lại được, phải tạo đơn
  mới nếu cần điều chỉnh tiếp).
- `DiemDanh.trangThai` khi được tạo tự động từ việc duyệt đơn: luôn là `vang_co_phep`, dùng
  đúng cơ chế "một dòng duy nhất mỗi (buổi học, học sinh)" đã có từ F01/F02/F04 — không tạo
  cơ chế lưu trữ song song.
- F05 không có bảng/trạng thái riêng — chỉ đọc lại `DiemDanh.trangThai` đã có.

## 4. Phạm vi dữ liệu theo tenant và thời gian hiệu lực

- `DonXinPhep.donViId` lấy từ `HocSinh.donViId` thật của học sinh khi tạo đơn — **không** lấy
  từ `donViId` đang chọn trong phiên đăng nhập của phụ huynh, vì đó chỉ là nơi neo phiên
  (đúng nguyên tắc đã chốt ở D01/D03 mục 11 và tái dùng ở J01/J06).
- Xác thực "đúng con của phụ huynh này" bằng cách duyệt qua mọi hồ sơ `PhuHuynh` gắn với tài
  khoản (`listPhuHuynhByNguoiDungId`), tìm học sinh trong danh sách con của từng hồ sơ
  (`listHocSinhByPhuHuynhId`) — giống hệt cách `getParentPortalOverview` đã gộp dữ liệu nhiều
  đơn vị cho phụ huynh có con học nhiều nơi.
- F05: cửa sổ 30 ngày gần nhất tính tới ngày hiện tại, gộp đúng theo `hocSinhId` — không lệ
  thuộc đơn vị đang chọn.

## 5. Vai trò được xem/tạo/sửa/hủy

| Thao tác | `phu_huynh` (vai trò) | `diem_danh.xem` | `diem_danh.thuc_hien` |
| --- | --- | --- | --- |
| Gửi đơn xin phép cho con mình | Có | — | — |
| Xem đơn của con mình (qua Portal) | Có | — | — |
| Xem danh sách đơn trong đơn vị | — | Có | Có |
| Duyệt/từ chối đơn | — | Không | Có |
| Xem cảnh báo vắng học của con mình | Có | — | — |

Không seed quyền mới — tái dùng đúng `diem_danh.xem`/`diem_danh.thuc_hien` (đã seed từ Sprint
0) và bypass theo vai trò `phu_huynh` (giống cách `thongBaoRouter`/`portalRouter` đã làm).

## 6. Thông báo phát sinh và đối tượng nhận

- F05 chính là "thông báo" duy nhất phát sinh ở đây: banner cảnh báo tự động trong Portal
  phụ huynh, chỉ hiển thị cho đúng phụ huynh của học sinh liên quan. **Không** dùng bảng
  `ThongBao` dùng chung (đã có từ I01) vì bảng đó chưa lọc theo đúng học sinh (I05 chưa làm)
  — tái dùng sẽ lộ tình trạng vắng học của một em cho phụ huynh của các em khác trong cùng
  đơn vị. Quyết định này ưu tiên an toàn dữ liệu hơn là tái dùng hạ tầng có sẵn.
- Không có kênh gửi thật (SMS/email/push) — đúng giới hạn hiện tại của hệ thống, ghi nhận lại
  để không hiểu nhầm là đã có thông báo chủ động gửi ra ngoài ứng dụng.

## 7. Chứng từ/báo cáo cần in/xuất

- Chưa có ở bước này. Đơn xin phép chưa có bản in/xuất PDF riêng.

## 8. Dữ liệu bắt buộc, uniqueness, validation, audit log

- `DonXinPhep`: `hocSinhId`, `tuNgay`, `denNgay`, `lyDo` bắt buộc; `tuNgay <= denNgay`. Không
  có ràng buộc unique — một học sinh có thể có nhiều đơn xin phép ở các khoảng ngày khác
  nhau, kể cả trùng ngày (nhân viên tự đánh giá khi duyệt).
- Audit log: `xin_phep.create` (khi gửi đơn), `xin_phep.duyet`/`xin_phep.tu_choi` (khi xử lý,
  ghi kèm số buổi đã tự động cập nhật điểm danh nếu duyệt — không ghi từng dòng điểm danh
  riêng, giống cách F01/F02/F04 đã làm).
- F05 không phát sinh dữ liệu/audit log mới — chỉ đọc lại `DiemDanh` đã có.

## 9. Trường riêng theo loại hình mầm non/ngoại ngữ/tin học

- Không thêm trường riêng ở bước này. Giữ đúng tinh thần MVP — mầm non (giờ đón/trả) vẫn để
  riêng ở F06.

## 10. Checklist test runtime và regression trước khi đóng task

- [x] Phụ huynh gửi đơn xin phép cho đúng con của mình — thành công, trạng thái "Chờ duyệt".
      (Test tay qua UI thật với tài khoản `0933444555`/Phạm Gia Bảo — PASS.)
- [x] Phụ huynh thử gửi đơn cho một `hocSinhId` không phải con mình (gọi API trực tiếp) — bị
      chặn. (Test qua `curl` — trả đúng lỗi "Không tìm thấy học sinh trong danh sách con của
      bạn.")
- [x] Nhân viên có `diem_danh.xem` (không có `thuc_hien`) mở `/attendance/xin-phep` — xem
      được danh sách, không thấy nút Duyệt/Từ chối, gọi API duyệt trực tiếp → 403. (Test qua
      `curl` với `demo_hocvu` — GET 200, POST duyệt 403.)
- [x] Nhân viên có `diem_danh.thuc_hien` duyệt đơn — các buổi học chưa điểm danh trong khoảng
      ngày của lớp học sinh tự chuyển `vang_co_phep`; buổi đã điểm danh trước đó giữ nguyên.
      (Test tay với `demo_giaovien` — buổi đã điểm danh `vang_khong_phep` giữ nguyên, buổi
      chưa điểm danh tự chuyển `vang_co_phep` kèm ghi chú số đơn — PASS, xác nhận qua truy vấn
      DB trực tiếp.)
- [x] Duyệt lại một đơn đã xử lý — bị chặn ("Đơn đã được xử lý"). (Test qua `curl` — PASS.)
- [ ] Điểm danh một buổi đánh dấu học sinh `vang_khong_phep` — phụ huynh của đúng học sinh đó
      thấy banner cảnh báo trong Portal; phụ huynh của học sinh khác (kể cả cùng lớp) **không**
      thấy thông tin này. (Chưa test được qua UI thật vì dữ liệu mẫu điểm danh chỉ có ở buổi
      học tương lai — cửa sổ cảnh báo chỉ nhìn về quá khứ nên chưa kích hoạt được trên UI.
      Đã xác nhận đúng logic truy vấn/join qua gọi trực tiếp
      `listDiemDanhGanDayByHocSinh` — trả đúng dữ liệu mong đợi.)
- [ ] Đổi đơn vị ở Topbar khi đang ở `/attendance/xin-phep` → danh sách tải lại đúng đơn vị.
      (Chưa test tay.)
- [x] `pnpm typecheck` pass.
