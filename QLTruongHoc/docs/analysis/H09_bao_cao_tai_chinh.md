# Phân tích chi tiết — H09: Báo cáo doanh thu, công nợ, thu theo đơn vị

> Tiếp H03-H07. Phạm vi: báo cáo tổng hợp tài chính — tổng thu trong một khoảng ngày, tổng
> công nợ hiện tại, và bảng chi tiết theo từng kỳ thu (đơn vị hệ thống xem gộp kèm cột "Đơn
> vị"). **Chưa** có biểu đồ trực quan hay xuất file — để lại làm bước sau nếu cần.

## 1. Mục tiêu và actor

- Mục tiêu: cho kế toán/quản lý đơn vị cái nhìn tổng quan nhanh về tình hình thu tiền, không
  phải đi từng kỳ thu để cộng tay.
- Actor: **Kế toán**, **Quản lý đơn vị** — tái dùng `tai_chinh.xem`, không cần quyền mới.

## 2. Quyết định phạm vi số liệu — cái gì lọc theo ngày, cái gì không

Đây là quyết định quan trọng nhất của module này:

- **Tổng thu trong khoảng** (card đầu tiên): lọc theo `PhieuThu.ngayThu` trong khoảng
  [tuNgay, denNgay] người dùng chọn — đúng nghĩa "tiền mặt vào trong giai đoạn này".
- **Tổng công nợ hiện tại** (card thứ hai): **không lọc theo ngày** — luôn là số dư hiện tại
  (tổng còn lại của mọi khoản phải thu trong đơn vị), vì công nợ là một *số dư tại một thời
  điểm*, không phải một *dòng chảy trong khoảng thời gian*. Lọc theo ngày ở đây sẽ cho một
  con số không có ý nghĩa nghiệp vụ rõ ràng.
- **Bảng "Thu theo kỳ thu"**: cũng **không lọc theo ngày** — hiển thị luỹ kế toàn bộ
  (phải thu/đã thu/còn lại) của từng kỳ thu, không phải chỉ phần thu trong khoảng đã chọn.
  Lý do: kỳ thu tự nó đã là một khoảng thời gian có ranh giới rõ (`tuNgay`-`denNgay` của kỳ);
  ghép thêm một khoảng ngày lọc thứ hai (ngày thu tiền) sẽ tạo ra numbers khó diễn giải (một
  kỳ thu có thể được thu rải rác qua nhiều tháng). Nếu sau này cần "thu trong tháng X, theo
  từng kỳ thu", sẽ làm ở bước riêng với UI rõ ràng hơn về việc đang lọc theo trục thời gian
  nào.

## 3. Luồng chính

1. Mở trang từ nút "Báo cáo tài chính" trên header trang `/finance`.
2. Mặc định hiển thị từ đầu tháng hiện tại đến hôm nay.
3. Đổi khoảng ngày → bấm "Xem báo cáo" → chỉ card "Tổng thu trong khoảng" đổi theo; công nợ
   và bảng theo kỳ thu giữ nguyên (đúng như quyết định ở mục 2).
4. Đơn vị hệ thống: toàn bộ số liệu gộp tất cả đơn vị đang hoạt động, bảng theo kỳ thu có
   thêm cột "Đơn vị".

## 4. Mô hình dữ liệu

Không thêm bảng mới — chỉ thêm truy vấn tổng hợp (SUM/COUNT/GROUP BY) trên các bảng đã có từ
H01-H07 (`PhieuThu`, `KhoanPhaiThu`, `KyThu`). Xem các hàm mới trong
`server/db/taiChinh.repository.ts` (`sumPhieuThuTrongKhoang`, `sumCongNoByDonVi`,
`listKyThuBaoCaoByDonVi`, `listKyThuBaoCaoAllDonVi`) và
`server/services/taiChinh.service.ts` (`getBaoCaoTaiChinh`).
