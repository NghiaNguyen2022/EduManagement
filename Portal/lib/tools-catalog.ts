export const toolsCatalog = [
  { slug: 'excel', name: 'Excel Rescue', subtitle: 'Xử lý Excel', icon: '▦', description: 'Tìm dòng trùng, ghép nhiều file và đối chiếu hai bảng. Nhận lại Excel kèm báo cáo thay đổi.', features: ['Loại trùng theo cột khóa', 'Ghép theo tên cột', 'Đối chiếu dữ liệu A / B'], color: 'green' },
  { slug: 'billscan', name: 'BillScan', subtitle: 'Đọc chứng từ', icon: '▤', description: 'Đưa thông tin từ hóa đơn, chứng từ vào một bảng Excel để bạn kiểm tra và hoàn thiện.', features: ['Ảnh và PDF chứng từ', 'Kiểm tra trường cần xác nhận', 'Xuất bảng tổng hợp'], color: 'blue' },
  { slug: 'sitereport', name: 'SiteReport', subtitle: 'Báo cáo ảnh', icon: '▧', description: 'Sắp xếp ảnh hiện trường cùng vị trí, ghi chú thành báo cáo có cấu trúc.', features: ['Ảnh kèm ghi chú', 'Thông tin theo vị trí', 'Báo cáo PDF / Word'], color: 'orange' },
  { slug: 'quotecompare', name: 'QuoteCompare', subtitle: 'So sánh báo giá', icon: '⇄', description: 'Đặt các báo giá cạnh nhau, xác nhận mặt hàng tương ứng và kiểm tra chênh lệch.', features: ['Ánh xạ mặt hàng', 'Giá, thuế và điều kiện', 'Bảng đối chiếu Excel'], color: 'purple' },
] as const;
