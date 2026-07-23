# MASTER CHECKLIST

> Đây là checklist tổng toàn dự án (Sprint 0 → Sprint 7). Trạng thái A/B dưới đây được
> đối chiếu lại với code thật ngày 2026-07-20 sau khi phát hiện `PROJECT_SUMMARY.md` và
> `docs/MASTER_CHECKLIST.md` (file khác, dùng để track patch UI) đã bị ghi đè mất nội dung
> Sprint 0. Chi tiết xem `PROJECT_SUMMARY.md` mục "Sprint 0 — Nền tảng đa đơn vị".
>
> Cập nhật 2026-07-21 (sáng): đối chiếu lại C/D với code + `SHOW TABLES` trên DB dev thật —
> Sprint 1 (Tuyển sinh, mục C/D) chưa bắt đầu thật sự, dù đã có scaffold `hocSinh` mồ côi.
>
> Cập nhật 2026-07-21 (chiều): đã hoàn tất D01/D03 (hồ sơ học sinh + phụ huynh, nối lại
> scaffold `hocSinh`). Mục C (Lead/tuyển sinh) và D02/D05/D06 vẫn chưa làm. Chi tiết xem
> `PROJECT_SUMMARY.md` mục "D01/D03 — Hồ sơ học sinh và phụ huynh".
>
> Cập nhật 2026-07-21 (đêm): hoàn tất E05-E08 (lịch học lặp lại, kiểm tra trùng, nghỉ/học
> bù, thời khóa biểu). Chi tiết xem `PROJECT_SUMMARY.md` mục "E05-E08 — Lịch học lặp lại và
> thời khóa biểu".
>
> Cập nhật 2026-07-21 (khuya): chốt phạm vi nghiệp vụ tại đơn vị hệ thống (chỉ quản trị,
> không mở lớp/học viên/lịch) + sinh dữ liệu mẫu lịch học. Xem `docs/analysis/A01_cay_don_vi.md`
> mục 11 và `PROJECT_SUMMARY.md` mục "Phạm vi nghiệp vụ tại đơn vị hệ thống + dữ liệu mẫu
> lịch học".
>
> Cập nhật 2026-07-21 (khuya, tiếp): ẩn form tạo/sửa + xem gộp dữ liệu theo đơn vị (kèm cột
> "Đơn vị") ở 4 trang Học sinh/Lớp học/Giáo viên/Tuyển sinh khi đứng ở đơn vị hệ thống. Phát
> hiện 2 bản ghi dữ liệu thật của người dùng (học sinh "Nguyen Khang", lead "Nguyen Nghia")
> đang nằm nhầm ở đơn vị hệ thống — chưa xử lý, để người dùng tự quyết định. Xem
> `docs/analysis/A01_cay_don_vi.md` mục 11.1.
>
> Cập nhật 2026-07-21 (rạng sáng): đã chuyển học sinh "Nguyen Khang" + phụ huynh + lead
> "Nguyen Nghia" từ đơn vị hệ thống sang Trường Mầm non Hoa Nắng theo yêu cầu người dùng
> (sinh lại mã tránh trùng). Hoàn tất D05/D06 (lịch sử trạng thái học tập, đồng bộ trạng
> thái lớp khi đổi trạng thái tổng thể học sinh). Xem `PROJECT_SUMMARY.md`.
>
> Cập nhật 2026-07-21 (sáng sớm, hôm sau): mở Sprint 3, hoàn tất F01/F02/F04 (điểm danh theo
> buổi học — trang `/attendance`, tích hợp nút điểm danh vào `ClassDetailPage`). F03/F05 để
> sau vì cần Portal/module Thông báo chưa làm; F06 (mầm non đón/trả) để riêng. Xem
> `PROJECT_SUMMARY.md` mục "F01/F02/F04 — Điểm danh theo buổi học".
>
> Cập nhật 2026-07-21 (sáng sớm, tiếp): hoàn tất G01/G02/G03 (báo giảng theo buổi, nhận xét
> giáo viên) — cùng ngày với F. Seed thêm quyền `hoc_tap.xem`/`hoc_tap.ghi_nhan` (khác điểm
> danh, chưa có quyền phù hợp để tái dùng). G04-G07 để sau vì cần mô hình dữ liệu riêng. Xem
> `PROJECT_SUMMARY.md` mục "G01/G02/G03 — Báo giảng theo buổi, nhận xét giáo viên".
>
> Cập nhật 2026-07-21 (tối): phát hiện và sửa lỗi ở A04/A05 — `getOrganizationsForUser`
> trước đây chỉ trả về đơn vị có dòng gán tường minh, kể cả với `he_thong.quan_tri`, nên
> quản trị hệ thống không thấy/chuyển được sang các đơn vị mình chưa từng được gán, và
> không gán được vai trò cho người khác vào các đơn vị đó. Đã sửa để quản trị hệ thống luôn
> thấy và truy cập được toàn bộ đơn vị đang hoạt động. Đã test tay qua trình duyệt (PASS).
> Đồng thời làm lại giao diện sidebar (icon SVG đồng bộ, màu sắc đi qua biến theme, sửa lỗi
> mục menu đang chọn không nổi bật) — không phát sinh mục checklist mới, thuộc K06.
>
> Cập nhật 2026-07-22: thiết kế lại sidebar lần hai (khung nhóm có shadow, điểm nhấn tên
> nhóm, gạch dưới cho chức năng chưa hoàn thiện) — thuộc K06, không phát sinh mục checklist
> mới. Mở Sprint 5 (Tài chính), hoàn tất H01/H02 (danh mục khoản thu, kỳ thu + gán khoản thu
> áp dụng cho kỳ, mở/đóng kỳ), sau đó tiếp H03-H07 (sinh khoản phải thu theo lớp, miễn giảm,
> thu tiền từng phần, công nợ toàn đơn vị, lịch sử phiếu thu), rồi H09 (báo cáo tài chính:
> tổng thu theo khoảng ngày, tổng công nợ, thu theo kỳ thu/đơn vị). Chỉ còn H08 (hoàn
> phí/chuyển phí/bảo lưu) để lại làm bước sau — cần thiết kế riêng phức tạp hơn. Xem
> `PROJECT_SUMMARY.md` mục "H01/H02 — Danh mục khoản thu, Kỳ thu", "H03-H07 — Khoản phải thu,
> miễn giảm, thu tiền, công nợ, biên nhận" và "H09 — Báo cáo tài chính".
>
> Cập nhật 2026-07-22 (rà soát I01-I04 + khung Portal): xác nhận chủ đích "một phụ huynh có
> con học nhiều đơn vị" — D03 đổi sang tái sử dụng hồ sơ phụ huynh theo số điện thoại **toàn
> hệ thống** (trước đây chỉ trong đơn vị), có xác nhận rõ ràng + audit riêng khi dùng chung
> hồ sơ khác đơn vị. Sửa thêm: route mặc định sau đăng nhập không còn ép mọi vai trò nội bộ
> vào Portal (chỉ phụ huynh), 2 quick-link Portal trỏ cứng vào ID bản ghi mẫu, 1 lỗi thứ tự
> hook ở `PortalLandingPage`.
>
> Cập nhật 2026-07-22 (tiếp, sau test tay tài khoản thật): bỏ lại một lớp kiểm tra vừa thêm ở
> `getParentPortalOverview` (yêu cầu có bản ghi phân quyền `phu_huynh` riêng theo từng đơn vị)
> — test tay lộ ra tài khoản phụ huynh thật đang đăng nhập mặc định vào đơn vị hệ thống (do
> lệch dữ liệu từ lần chuyển đơn vị trước đó) vẫn cần xem đúng con ở đơn vị khác. Xác nhận lại
> mô hình đúng: phụ huynh đăng nhập vào một đơn vị neo chung (không mang ý nghĩa nghiệp vụ),
> còn danh sách con luôn nhóm theo đúng đơn vị của từng con (Portal trả thêm `organizations`,
> xử lý đúng cả 3 trường hợp nhiều con/nhiều đơn vị, một con/nhiều đơn vị, nhiều con/một đơn
> vị). Điểm chốt an toàn thực sự là bước xác nhận khi ghép phụ huynh khác đơn vị, không phải
> phân quyền theo từng đơn vị con học. Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`
> mục 11 và `PROJECT_SUMMARY.md`.
>
> Cập nhật 2026-07-22 (đối chiếu tham khảo Easy Edu/CenterOnline/DotB EMS, KidsOnline/OneKids/
> MISA EMIS Kindergarten, FACTS/OpenEduCat với BPD gốc — không sao chép, chỉ rút phần đã có
> trong BPD mà app chưa làm): phát hiện mục **L. Báo cáo & Dashboard** (REP-01..04 trong BPD)
> chưa từng có chỗ đứng ở checklist A-K — bổ sung mới ở dưới. Đánh dấu lại J01 (Portal phụ
> huynh) đã có phần lõi thật (tổng quan chung + nhóm theo đơn vị từng con), không còn trống
> hoàn toàn. Ghi nhận phân bổ luồng/layout cho các mục còn thiếu quan trọng nhất (C05, H08,
> J06, D02/F06/G07 mầm non) ngay tại từng dòng bên dưới — chỉ lên kế hoạch vị trí/luồng, **chưa
> code**. Xem thêm phần trao đổi so sánh trong lịch sử hội thoại (chưa tách file phân tích
> riêng vì còn ở mức rút gọn).
>
> Cập nhật 2026-07-22 (làm 3 việc ưu tiên demo): hoàn tất L01 (dashboard nối dữ liệu thật),
> J06 (học phí trong Portal phụ huynh) và sửa J03 (thông báo mở cho phụ huynh; trao đổi
> chuyển vào hẳn bên trong Portal thay vì mở trang `/communications` — trang đó vốn không an
> toàn để mở cho phụ huynh vì cần `hoc_sinh.xem`/`lop_hoc.xem` mà phụ huynh không có, sẽ lộ
> toàn bộ danh sách học sinh/lớp của đơn vị). Phát hiện thêm và sửa luôn 1 lỗi có sẵn từ trước
> (không thuộc đợt sửa phụ huynh nhiều đơn vị): `traoDoiApi.ts` (client) gộp sai dữ liệu — chỉ
> giữ `traoDoi`, làm rớt mất `hocSinh`/`lopHoc`/`nguoiTao`, khiến trang `/communications` lẽ ra
> sẽ lỗi runtime khi hiển thị bất kỳ dòng trao đổi nào (chưa ai kịp test qua UI thật trước khi
> phát hiện). Xem `PROJECT_SUMMARY.md`.
>
> Cập nhật 2026-07-23: hoàn tất H08 (hoàn phí/chuyển phí/bảo lưu — bảng mới
> `DieuChinhKhoanPhaiThu`, có bước duyệt tách vai trò qua quyền mới `tai_chinh.duyet`). Mục H
> (Tài chính) nay đã đầy đủ H01-H09. Test tay qua UI thật với `demo_ketoan` — PASS cho luồng
> tạo yêu cầu bảo lưu; chưa test được luồng duyệt (cần tài khoản thứ hai có `tai_chinh.duyet`)
> và luồng hoàn phí/chuyển phí có số tiền thật (công cụ test không nhập được `CurrencyInput`
> ổn định). Phát hiện thêm và sửa luôn 1 lỗi có sẵn từ trước (không thuộc H08): trang
> `KyThuDetailPage` gọi `listLopHocApi` không bọc lỗi — vai trò kế toán không có `lop_hoc.xem`
> nên cả trang chi tiết kỳ thu vỡ hoàn toàn khi họ mở, dù họ có đủ quyền tài chính. Xem
> `PROJECT_SUMMARY.md`.
>
> Cập nhật 2026-07-23 (tiếp): hoàn tất F03 (phụ huynh gửi đơn xin phép — bảng mới
> `DonXinPhep`, gửi/xem ngay trong Portal phụ huynh, duyệt/từ chối tại trang mới
> `/attendance/xin-phep`) và F05 (thông báo vắng học cho phụ huynh — không dùng bảng `ThongBao`
> dùng chung vì chưa lọc theo học sinh, thay vào đó tự động hiện banner cảnh báo trong Portal
> dựa trên `DiemDanh` sẵn có, gộp đúng theo từng học sinh nên không lộ dữ liệu chéo). Duyệt đơn
> xin phép tự động ghi `vang_co_phep` vào các buổi học chưa điểm danh trong khoảng ngày xin
> phép, giữ nguyên buổi đã điểm danh tay. Tái dùng đúng quyền `diem_danh.xem`/`diem_danh.thuc_hien`
> đã seed, không seed quyền mới. Nhân tiện tinh chỉnh giao diện: đổi icon Unicode trong Portal
> sang emoji thân thiện hơn, thêm token `--edu-color-danger-hover` + class `.notice-banner*`
> dùng chung cho mọi cảnh báo sau này, sửa 1 chỗ màu hex cứng có sẵn ở `dialog.css`. Xem
> `docs/analysis/F03_F05_xin_phep_thong_bao_vang.md`.
>
> Cập nhật 2026-07-23 (rà soát demo, vai trò quản trị hệ thống): bắt đầu rà soát lại từng vai
> trò để chuẩn bị demo full — bắt đầu với quản trị hệ thống. Sửa 5 điểm: (1) chặn tạo thêm đơn
> vị `loaiDonVi=he_thong` ở server (`donVi.service.ts`) — trước đây chỉ chặn phía client, gọi
> API trực tiếp vẫn tạo được; (2) chặn tạo user vai trò `phu_huynh` qua `/users` ở cả server
> lẫn client (chỉ tạo được từ hồ sơ học sinh, đúng luồng `createGuardianAccount` có sẵn); (3)
> danh sách vai trò khi tạo user nay lọc theo đơn vị đang đứng — ở hệ thống chỉ
> `quan_ly_don_vi`/`ke_toan` (không tạo vai trò mới, gán `ke_toan` tại hệ thống tự nhiên có
> nghĩa "kế toán tổng" nhờ các trang tài chính đã xem gộp sẵn), ở đơn vị con đủ vai trò vận
> hành; (4) `OrganizationTreePage.tsx` đổi từ bảng phẳng sang cây thụt lề thể hiện đúng cấu
> trúc cha-con nhiều cấp; (5) `SchedulePage.tsx` thêm thông báo "xem gộp, đơn vị hệ thống
> không tổ chức lớp" khi đứng ở hệ thống (trang duy nhất trong nhóm Đào tạo còn thiếu kiểu này
> so với Học sinh/Giáo viên/Lớp học); (6) sidebar ẩn "Lịch học"/"Điểm danh" khi đứng ở hệ thống
> (đơn vị hệ thống không tổ chức lớp nên 2 mục này luôn trống, không còn ý nghĩa hiện ra); (7)
> `/dashboard` ở hệ thống thêm khối "Lối vào nhanh cho quản trị" (Cây đơn vị/Người dùng/Vai
> trò/Nhật ký). Nhân tiện tick lại B04/B05/B07/J04 trong checklist — đã xong từ trước (H, F/G,
> J01, F03) nhưng bị sót không cập nhật dấu tick khi các mục đó hoàn tất. Xem
> `docs/analysis/QUAN_TRI_HE_THONG_UX.md`.
>
> Cập nhật 2026-07-23 (tiếp, sau khi xem qua UI thật): 5 điểm bổ sung cho vai trò quản trị hệ
> thống — style lại scrollbar sidebar khớp tông xanh; bỏ "Hệ thống" khỏi dropdown "Đơn vị cha"
> khi tạo đơn vị mới (chọn "Không có" nay tự gán đúng id đơn vị hệ thống thay vì NULL, khớp dữ
> liệu thật thay vì tạo gốc rời rạc); ẩn cả nhóm menu "Hệ thống" (Cây đơn vị, Vai trò·Phân
> quyền, Nhật ký, Cấu hình) khi đứng ở đơn vị con, chỉ giữ "Quản lý người dùng" hiện mọi nơi;
> ẩn "Trao đổi phụ huynh" khỏi menu ở hệ thống và chuyển hẳn UI ghi/xem vào trong từng lớp
> (`ClassDetailPage.tsx`), giữ nguyên `/communications` cho nhu cầu xem gộp. Xem
> `docs/analysis/QUAN_TRI_HE_THONG_UX.md`.

## A. Nền tảng và đa đơn vị
- [x] A01 Tạo cây đơn vị trường/trung tâm/cơ sở. (2026-07-21: có API + trang `/organizations` tạo/sửa/ngừng hoạt động đơn vị, chỉ `he_thong.quan_tri`. Xem `docs/analysis/A01_cay_don_vi.md`.)
- [x] A02 Chọn đơn vị sau đăng nhập.
- [x] A03 Lưu đơn vị đang làm việc trong session/token. (`PhienDangNhap.donViHienTaiId`.)
- [x] A04 Phân quyền người dùng theo từng đơn vị. (`NguoiDungVaiTroDonVi` + middleware `requirePermission`.)
- [x] A05 Chuyển đơn vị không cần đăng xuất nếu có quyền. (`POST /api/organizations/select`.)
- [x] A06 Nhật ký thay đổi đơn vị và thao tác quan trọng. (`NhatKyHeThong` ghi login/logout/select-org/user/role.)

## B. Người dùng và phân quyền
- [ ] B01 Quản trị nền tảng. (Vai trò `quan_tri_he_thong` vẫn chỉ gán được qua seed, chưa có UI
      gán vai trò phạm vi hệ thống — có chủ đích để tránh leo thang quyền, giữ nguyên giới hạn
      này. 2026-07-23: bổ sung phần còn thiếu của B01 — màn hình Quản lý người dùng nay hạn chế
      đúng theo ngữ cảnh đơn vị đang đứng: ở đơn vị hệ thống chỉ tạo được vai trò
      `quan_ly_don_vi`/`ke_toan` (gán `ke_toan` tại đây đóng vai "kế toán tổng" nhờ các trang
      tài chính đã xem gộp sẵn), ở đơn vị con tạo được mọi vai trò vận hành; không đơn vị nào
      cho tạo `phu_huynh` qua màn hình này (chặn cả client lẫn server), chỉ xem/reset mật khẩu
      tài khoản phụ huynh sẵn có. Xem `docs/analysis/QUAN_TRI_HE_THONG_UX.md`.)
- [x] B02 Quản lý đơn vị. (Vai trò `quan_ly_don_vi` gán được qua Quản lý người dùng.)
- [x] B03 Tuyển sinh/tư vấn. (Có màn hình Lead/CRM đầy đủ từ 2026-07-21 — xem mục C.)
- [x] B04 Kế toán. (Vai trò đã seed; màn hình nghiệp vụ tài chính đầy đủ H01-H09 — xem mục H.
      Checklist trước để sót, chưa tick lại khi H hoàn tất.)
- [x] B05 Giáo viên. (Có hồ sơ + phân công lớp từ 2026-07-21; màn hình giảng dạy thật (điểm
      danh/báo giảng) xong từ F01/F02/F04, G01-G03 — xem mục F/G. Checklist trước để sót, chưa
      tick lại khi F/G hoàn tất.)
- [x] B06 Nhân viên học vụ. (Có màn hình chương trình/lớp/xếp lớp đầy đủ từ 2026-07-21 — xem mục E.)
- [x] B07 Phụ huynh/người giám hộ. (Vai trò đã seed; Portal phụ huynh thật xong từ J01 (2026-07-22)
      — xem mục J. Checklist trước để sót, chưa tick lại khi J01 hoàn tất.)
- [x] B08 Chính sách khóa/mở tài khoản. (Khóa/mở tay qua Quản lý người dùng; khóa tạm tự động sau 5 lần đăng nhập sai liên tiếp, tự mở sau 15 phút.)

## C. Tuyển sinh
- [x] C01 Tiếp nhận khách hàng tiềm năng. (2026-07-21: API `/api/leads` + trang `/admissions`. Mã lead tự sinh. Xem `docs/analysis/C01_C03_C06_lead_tuyen_sinh.md`.)
- [x] C02 Ghi nhận nhu cầu khóa học/lớp. (Trường `nhuCau`, `doTuoiHoacTrinhDo` trên Lead — ghi chú tự do, chưa gắn cứng vào chương trình đào tạo vì Sprint 2 chưa làm.)
- [x] C03 Lịch sử tư vấn và chăm sóc. (`LeadHoatDong` append-only, có thể kèm đổi trạng thái lead cùng lúc.)
- [x] C04 Hồ sơ đăng ký nhập học. (Qua form "Xác nhận đăng ký" trong trang chi tiết lead.)
- [ ] C05 Kiểm tra đầu vào/xếp trình độ cho trung tâm ngoại ngữ. (Để Sprint 7. **Phân bổ luồng/layout dự kiến**: luồng — Lead → (tuỳ chọn) tạo bản ghi kiểm tra đầu vào → nhập kết quả/trình độ → dùng kết quả này khi xác nhận đăng ký C04 để gợi ý chương trình/lớp phù hợp. Layout — không cần route riêng, thêm 1 `SectionCard` "Kiểm tra đầu vào" ngay trong `LeadDetailPage`, chỉ hiện khi đơn vị có `loaiHinhDaoTao = ngoai_ngu`.)
- [x] C06 Xác nhận nhập học và sinh mã học sinh. (Tái sử dụng `createHocSinhMoi`/`addGuardianToStudent`; một lead chỉ chuyển đổi đúng một lần.)
- [x] C07 Tạo tài khoản phụ huynh. (2026-07-21: API `POST /api/hoc-sinh/:id/phu-huynh/:linkId/tai-khoan`, không tạo trùng theo guardian-person. 2026-07-23: xác nhận qua UI thật (`StudentDetailPage`) — bấm "Tạo tài khoản đăng nhập" tạo đúng tài khoản, hiện tên đăng nhập/mật khẩu tạm một lần, dòng chuyển "Đã có tài khoản". Xem `docs/analysis/C07_tai_khoan_phu_huynh.md`.)

## D. Học sinh và phụ huynh
- [x] D01 Hồ sơ học sinh. (2026-07-21: API `/api/hoc-sinh` + trang `/students`, `/students/:id`. Mã học sinh tự sinh. Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md`.)
- [ ] D02 Hồ sơ sức khỏe mầm non. (Để Sprint 7. **Gộp chung phân bổ với F06/G07** — xem ghi chú
      "Nhật ký ngày mầm non" ở mục F06.)
- [x] D03 Quan hệ phụ huynh/người giám hộ. (2026-07-21: `PhuHuynh` + `HocSinhPhuHuynh`, một liên hệ chính tại một thời điểm. Cập nhật 2026-07-22: tái sử dụng phụ huynh theo số điện thoại **toàn hệ thống**, không chỉ trong đơn vị — hỗ trợ phụ huynh có con học nhiều đơn vị; nếu khớp hồ sơ ở đơn vị khác, bắt buộc xác nhận qua `ConfirmDialog` trước khi dùng chung, có audit riêng `hoc_sinh.add_guardian_cross_org`. Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md` mục 11.)
- [x] D04 Người liên hệ chính và người đón trẻ. (`laLienHeChinh`, `duocDonTre` trên `HocSinhPhuHuynh`; chưa có UI ghi nhận người đón thực tế theo buổi — để Sprint 3/7.)
- [x] D05 Lịch sử trạng thái học tập. (2026-07-21: `HocSinhTrangThaiLichSu` — ghi 1 dòng mỗi lần đổi `HocSinh.trangThai`, không ghi đè. Xem `docs/analysis/D05_D06_lich_su_trang_thai_hoc_tap.md`.)
- [x] D06 Chuyển lớp/ngừng học/bảo lưu. (Chuyển lớp đã có từ E03. Bổ sung 2026-07-21: đổi trạng thái tổng thể học sinh sang `ngung_hoc`/`hoan_thanh`/`bao_luu` tự động đồng bộ tất cả `HocSinhLopHoc` đang hoạt động — trước đây 2 tầng trạng thái có thể lệch nhau.)

## E. Lớp học và lịch học
- [x] E01 Tạo chương trình/khóa học. (2026-07-21: API `/api/chuong-trinh` + section trong `/classes`. Mã tự đặt (không tự sinh). Xem `docs/analysis/E01_E04_chuong_trinh_lop_hoc.md`.)
- [x] E02 Tạo lớp học. (API `/api/lop-hoc` + trang `/classes`, `/classes/:id`. Bao gồm hồ sơ giáo viên `/api/giao-vien` + trang `/teachers`.)
- [x] E03 Xếp học sinh vào lớp. (Chặn vượt sĩ số, chặn học sinh ngừng học/hoàn thành, chuyển lớp giữ lịch sử — không ghi đè.)
- [x] E04 Phân công giáo viên. (Chỉ một giáo viên chính hoạt động một lúc cho một lớp; giáo viên hỗ trợ không giới hạn.)
- [x] E05 Tạo lịch học lặp lại. (2026-07-21: `LichHoc` (quy tắc theo tuần) + sinh `BuoiHoc` theo khoảng ngày, tách 2 bước lưu quy tắc/sinh buổi. Xem `docs/analysis/E05_E08_lich_hoc.md`.)
- [x] E06 Kiểm tra trùng giáo viên/phòng/lớp. (Chặn cứng toàn bộ khi sinh buổi/tạo buổi bù nếu trùng phòng hoặc giáo viên trong cùng đơn vị.)
- [x] E07 Lịch nghỉ và học bù. (Đánh dấu `nghi` (mở lại được), tạo `BuoiHoc` độc lập `loaiBuoi=bu`.)
- [x] E08 Thời khóa biểu giáo viên, học sinh, phụ huynh. (Theo lớp trong `ClassDetailPage`, theo giáo viên/đơn vị ở trang `/schedule`. **Chưa** làm theo học sinh/phụ huynh — thuộc Portal, module J.)

## F. Điểm danh và xin phép
- [x] F01 Điểm danh theo buổi học. (2026-07-21: trang `/attendance` + nút "Điểm danh" ngay trong `ClassDetailPage`. Xem `docs/analysis/F01_F02_F04_diem_danh.md`.)
- [x] F02 Có mặt/vắng có phép/vắng không phép/đi trễ/về sớm. (Bảng `DiemDanh`, 5 trạng thái, mặc định "Có mặt" cho buổi chưa điểm danh.)
- [x] F03 Phụ huynh gửi đơn xin phép. (2026-07-23: bảng mới `DonXinPhep`, gửi/xem ngay trong
      Portal phụ huynh (`PortalLandingPage.tsx`), duyệt/từ chối tại trang mới
      `/attendance/xin-phep` (`LeaveRequestsPage.tsx`) — chỉ ai có `diem_danh.thuc_hien` mới
      duyệt được, giữ đúng ma trận quyền F04. Duyệt đơn tự động ghi `vang_co_phep` vào các
      buổi học chưa điểm danh trong khoảng ngày xin phép. Xem
      `docs/analysis/F03_F05_xin_phep_thong_bao_vang.md`.)
- [x] F04 Giáo viên/học vụ duyệt hoặc ghi nhận. (Giáo viên ghi nhận qua `diem_danh.thuc_hien` đã seed sẵn từ Sprint 0; học vụ xem qua `diem_danh.xem` — đúng ma trận quyền có sẵn, không đổi.)
- [x] F05 Thông báo vắng học cho phụ huynh. (2026-07-23: không dùng bảng `ThongBao` dùng
      chung — chưa lọc theo học sinh (I05), rủi ro lộ dữ liệu chéo. Thay vào đó tự động hiện
      banner cảnh báo trong Portal phụ huynh dựa trên `DiemDanh` sẵn có
      (`listDiemDanhGanDayByHocSinh`), gộp đúng theo từng học sinh. Xem
      `docs/analysis/F03_F05_xin_phep_thong_bao_vang.md`.)
- [ ] F06 Mầm non: giờ đón/trả và người đón. (Để bước riêng, chưa cấp thiết cho MVP điểm danh
      chung. **"Nhật ký ngày mầm non" — phân bổ luồng/layout dự kiến (gộp D02+F06+G07 thành 1
      tính năng nhỏ, theo tinh thần KidsOnline/OneKids nhưng bỏ phần AI/camera/dinh dưỡng
      chi tiết)**: luồng — giáo viên ghi 1 dòng/học sinh/buổi: giờ đón, giờ trả, người đón,
      ăn/ngủ, sức khỏe/dặn thuốc, hoạt động trong ngày; phụ huynh chỉ xem qua Portal, không
      sửa. Layout — mở rộng ngay `/attendance` (đã có luồng theo buổi học sẵn), thêm panel
      "Nhật ký ngày" chỉ hiện khi đơn vị có `loaiHinhDaoTao = mam_non` (đúng nguyên tắc "cấu
      hình theo `UnitType`, không tách flow" của BPD mục 16); không tạo trang mới.)

## G. Học tập
- [x] G01 Báo giảng theo buổi. (2026-07-21: bảng `BaoGiang`, 1 dòng/buổi, ghi ngay trong trang `/attendance`. Xem `docs/analysis/G01_G02_G03_bao_giang.md`.)
- [x] G02 Nội dung bài học và bài tập. (2 trường tự do `noiDungBaiHoc`/`baiTap` trong `BaoGiang`.)
- [x] G03 Nhận xét giáo viên. (Cột `nhanXet` thêm vào `DiemDanh` có sẵn — nhận xét riêng từng học sinh, lưu cùng lúc với điểm danh.)
- [ ] G04 Kết quả kiểm tra/đánh giá. (Cần mô hình bài kiểm tra/điểm số riêng, để sau.)
- [ ] G05 Tiến độ theo chương trình. (Cần cấu trúc chương/bài trong `ChuongTrinhDaoTao`, chưa có.)
- [ ] G06 Ngoại ngữ: kỹ năng nghe/nói/đọc/viết. (Nghiệp vụ chuyên biệt theo loại hình, để sau.)
- [ ] G07 Mầm non: phát triển thể chất/nhận thức/ngôn ngữ/tình cảm-xã hội/thẩm mỹ. (Nghiệp vụ
      chuyên biệt theo loại hình, để sau. Gộp chung phân bổ với D02/F06 — xem "Nhật ký ngày
      mầm non" ở mục F06; phần "phát triển" ở đây chính là trường `hoatDongTrongNgay`/nhận
      xét tự do trong nhật ký, chưa cần mô hình 5 lĩnh vực phát triển riêng.)

## H. Tài chính
- [x] H01 Danh mục khoản thu. (2026-07-22: API `/api/tai-chinh/khoan-thu` + trang `/finance`. Mã tự đặt như chương trình/lớp. Xem `docs/analysis/H01_H02_khoan_thu_ky_thu.md`.)
- [x] H02 Tạo kỳ thu. (2026-07-22: API `/api/tai-chinh/ky-thu` + trang `/finance`, `/finance/ky-thu/:id`. Gán khoản thu áp dụng cho kỳ (`KyThuKhoanThu`), tách 2 trạng thái nháp/mở để khoá sửa sau khi mở — tương tự cách tách bước ở E05-E08.)
- [x] H03 Áp dụng khoản thu cho lớp/học sinh. (2026-07-22: nút "Sinh khoản phải thu" trong chi tiết kỳ thu, chọn lớp → tạo `KhoanPhaiThu` cho từng học sinh đang học, bỏ qua học sinh đã có sẵn (idempotent). Xem `docs/analysis/H03_H07_khoan_phai_thu_thu_tien.md`.)
- [x] H04 Khoản phải thu và miễn giảm. (Form "Miễn giảm" theo từng khoản phải thu, chặn giảm trừ vượt tổng tiền.)
- [x] H05 Thu từng phần/nhiều lần. (Form "Thu tiền" tạo `PhieuThu`, cho phép nhiều phiếu thu trên cùng một khoản phải thu tới khi thu đủ; trạng thái tự suy ra chưa_thu/thu_một_phần/đã_thu_đủ.)
- [x] H06 Công nợ phụ huynh. (Mục "Công nợ" trong trang `/finance` — toàn bộ khoản phải thu còn nợ trên toàn đơn vị, liên kết sang đúng kỳ thu. Chưa gộp theo phụ huynh, xem theo học sinh.)
- [x] H07 Biên nhận thu. (Mục "Lịch sử thu" theo từng khoản phải thu — số phiếu tự sinh `PT<năm><5 số>`, ngày/số tiền/phương thức/ghi chú. Chưa có bản in/PDF riêng.)
- [x] H08 Hoàn phí/chuyển phí/bảo lưu. (2026-07-23: bảng mới `DieuChinhKhoanPhaiThu` — yêu cầu
      hoàn phí/chuyển phí/bảo lưu gắn với một `KhoanPhaiThu`, trạng thái `cho_duyet` khi tạo,
      chỉ thật sự tác động `daThu`/`trangThai` sau khi được **duyệt** bởi một tài khoản khác
      người lập, có quyền `tai_chinh.duyet` (quyền mới, tách riêng khỏi `tai_chinh.quan_ly` —
      đúng BPD 7.6 "quy trình phê duyệt"). UI gộp trong `KyThuDetailPage` (nút "Điều chỉnh"
      cạnh Thu tiền/Miễn giảm/Lịch sử thu, không tách trang duyệt riêng). Hoàn phí/chuyển phí
      giới hạn theo `daThu` hiện tại (không hoàn/chuyển vượt số đã thu); chuyển phí thêm giới
      hạn theo "còn phải thu" của khoản đích. Bảo lưu chỉ là quyết định ghi nhận (chưa đổi
      trạng thái `KhoanPhaiThu` — xem giới hạn trong `docs/analysis`). Test tay qua UI thật với
      tài khoản `demo_ketoan` (có `tai_chinh.quan_ly`, không có `tai_chinh.duyet`) — PASS: tạo
      yêu cầu bảo lưu thành công, không thấy cột "Thao tác" duyệt (đúng phân quyền). Phát hiện
      và sửa luôn 1 lỗi có sẵn từ trước (không thuộc H08): `KyThuDetailPage` gọi `listLopHocApi`
      không bọc lỗi, vai trò kế toán không có `lop_hoc.xem` nên trang vỡ hoàn toàn — đã sửa
      thành không chặn cả trang.)
- [x] H09 Báo cáo doanh thu, công nợ, thu theo đơn vị. (2026-07-22: trang `/finance/bao-cao` — tổng thu trong khoảng ngày lọc được, tổng công nợ hiện tại, bảng thu theo từng kỳ thu (đơn vị hệ thống xem gộp kèm cột "Đơn vị"). Chưa có biểu đồ.)

## I. Thông báo và trao đổi
- [x] I01 Thông báo toàn trường/theo lớp/cá nhân. (2026-07-22: API `/api/thong-bao` + trang `/notifications`, lưu phạm vi `toan_truong` / `theo_lop` / `ca_nhan`, đơn vị hệ thống xem gộp theo đơn vị đang hoạt động. I02-I05 còn để sau.)
- [x] I02 Đính kèm tài liệu/hình ảnh. (2026-07-22: thêm một slot đính kèm duy nhất cho thông báo nội bộ — tên + liên kết; chưa làm upload đa tệp riêng.)
- [x] I03 Xác nhận đã đọc. (2026-07-22: thêm bảng `ThongBaoDaDoc` theo từng người dùng, nút "Xác nhận đã đọc" ngay trên trang `/thong-bao`, badge trạng thái theo từng dòng.)
- [x] I04 Trao đổi phụ huynh – giáo viên theo học sinh/lớp. (2026-07-22: API `/api/trao-doi` + trang `/communications`, ghi nhận trao đổi theo học sinh/lớp, xem gộp đơn vị hệ thống và lưu `trao_doi.create` vào nhật ký hệ thống.)
- [ ] I05 Kiểm soát phạm vi và lưu lịch sử.

## J. Portal
- [x] J01 Portal phụ huynh. (2026-07-22: trang `/portal/parent` — tổng quan chung không gắn
      đơn vị cụ thể, danh sách con nhóm theo từng đơn vị (`organizations`), đúng cả 3 trường
      hợp nhiều con/nhiều đơn vị. Xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md` mục
      11. Portal giáo viên/kế toán/tuyển sinh/hệ thống (`/portal/:roleSlug` khác) vẫn là khung
      tĩnh — xem J02.)
- [ ] J02 Portal giáo viên. (Khung tĩnh có sẵn (`config/portal.ts`), chưa nối dữ liệu thật.)
- [x] J03 Lịch học và thông báo. (2026-07-22: Lịch học — đã có trong J01 (buổi sắp tới theo
      từng con). Thông báo — mở quyền xem/xác nhận đã đọc cho vai trò `phu_huynh` qua
      `requireAnyPermissionOrRole` (`thongBao.router.ts`), không cấp thêm quyền quản lý; danh
      sách gộp đúng theo các đơn vị con đang học (`listThongBaoByDonViIds`), không lệ thuộc
      đơn vị "đang chọn" của phiên đăng nhập. Trao đổi — **không** mở trang `/communications`
      cho phụ huynh (trang đó cần `hoc_sinh.xem`/`lop_hoc.xem` để tải danh sách lọc, phụ huynh
      không có — sẽ vỡ hoặc lộ toàn bộ học sinh/lớp của đơn vị); thay vào đó hiển thị trao đổi
      gần đây của từng con ngay trong J01, chỉ xem. Giới hạn còn lại: thông báo chưa lọc đúng
      theo lớp/con (I05 chưa làm) — phụ huynh tạm thời thấy toàn bộ thông báo của đơn vị con.)
- [x] J04 Xin phép nghỉ. (Xong qua F03, 2026-07-23 — gửi/xem đơn ngay trong Portal phụ huynh,
      xem `docs/analysis/F03_F05_xin_phep_thong_bao_vang.md`. Checklist trước để sót, chưa tick
      lại khi F03 hoàn tất.)
- [ ] J05 Tiến độ và kết quả học tập. (J01 đã có placeholder "Điểm số chưa có nguồn dữ liệu" —
      đúng thực tế, chưa có mô hình điểm/kết quả — xem G04/G05.)
- [x] J06 Học phí và biên nhận. (2026-07-22: thêm block "Học phí" chỉ đọc vào mỗi thẻ con
      trong `PortalLandingPage.tsx` — danh sách khoản phải thu theo kỳ thu, tổng tiền, trạng
      thái, số còn lại (`getParentPortalOverview` gọi thêm `listKhoanPhaiThuByHocSinh`). Có chủ
      đích **chưa** làm phần "biên nhận" (link xem chi tiết `PhieuThuDetailPage`) — trang đó
      đang khoá theo `tai_chinh.xem`/`tai_chinh.quan_ly`, mở cho phụ huynh cần thêm một vòng
      kiểm tra "đúng chủ khoản phải thu", để bước sau.)

## K. Tài liệu và chất lượng
- [ ] K01 Cập nhật BPD sau mỗi quyết định nghiệp vụ.
- [x] K02 Cập nhật PROJECT_SUMMARY.md. (Khôi phục 2026-07-20 sau khi phát hiện bị ghi đè mất nội dung Sprint 0 — xem `PROJECT_SUMMARY.md`.)
- [x] K03 Cập nhật checklist sprint. (`docs/SPRINT_0_CHECKLIST.md`, `docs/UI_SHELL_CHECKLIST.md` đối chiếu lại với code thật 2026-07-20.)
- [ ] K04 Test multi-tenant và phân quyền. (Đã review code và test tay luồng khóa đăng nhập; chưa có test tự động.)
- [ ] K05 Test timezone Asia/Ho_Chi_Minh.
- [ ] K06 Test regression module đã hoàn thành.

## L. Báo cáo & Dashboard

> Bổ sung 2026-07-22 — tương ứng M15/REP-01..04 trong BPD gốc, trước đây không có chữ cái
> riêng trong checklist A-K nên bị rơi mất dấu vết. Đối chiếu CenterOnline/FACTS đều coi đây
> là 1 trong các module chính (không phải phụ), nên tách riêng thay vì gộp mờ vào mục H.

- [x] L01 Dashboard vận hành. (2026-07-22: `GET /api/dashboard/summary` (`dashboard.service.ts`,
      `dashboard.repository.ts`) — học sinh đang học, lớp đang học, công nợ hiện tại, lead mới
      trong tháng, kèm lịch học hôm nay (tái dùng `listThoiKhoaBieu` như Portal). Đơn vị hệ
      thống xem gộp toàn bộ đơn vị đang hoạt động (riêng lịch học hôm nay trả rỗng — đơn vị hệ
      thống không tổ chức lớp/lịch riêng, đúng phạm vi đã chốt ở A01). `DashboardPage.tsx` bỏ
      hẳn số liệu cứng `"486"`/`"28"` và danh sách lớp giả lập trước đây.)
- [ ] L02 Báo cáo tuyển sinh. (**Phân bổ dự kiến**: luồng — lead theo nguồn/trạng thái, tỷ lệ
      chuyển đổi lead→học sinh trong khoảng ngày. Layout — trang mới `/admissions/bao-cao`,
      cùng khuôn mẫu với `FinanceReportPage`/`/finance/bao-cao` đã có (bộ lọc ngày + card tổng
      hợp + bảng chi tiết), nút vào từ header `LeadsPage`.)
- [ ] L03 Báo cáo chuyên cần/học tập. (**Phân bổ dự kiến**: luồng — tỷ lệ đi học theo lớp/đơn
      vị trong khoảng ngày, dựa trên `DiemDanh` đã có sẵn. Layout — trang mới
      `/attendance/bao-cao`, cùng khuôn mẫu `FinanceReportPage`, nút vào từ header
      `AttendancePage`.)
- [x] L04 Báo cáo tài chính. (Đã làm — xem H09, trang `/finance/bao-cao`. Dùng làm khuôn mẫu
      layout cho L02/L03 ở trên để giữ nhất quán, không phát minh lại layout báo cáo mới.)
