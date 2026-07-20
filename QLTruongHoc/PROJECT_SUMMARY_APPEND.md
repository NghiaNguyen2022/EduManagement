# Date and Number Format Standard

## DateField
- Hiển thị và nhập `dd/mm/yyyy`.
- Giá trị trong state/API vẫn là ISO `yyyy-mm-dd`.
- Không dùng native `input type=date` vì không kiểm soát được định dạng hiển thị.
- Có kiểm tra ngày hợp lệ, min và max.

## NumberInput
- Số nguyên hiển thị `1.000.000`.
- Hỗ trợ số thập phân kiểu Việt Nam khi bật `allowDecimal`.
- Giá trị truyền giữa component và nghiệp vụ vẫn là number.

## CurrencyInput
- Tiền VND hiển thị `1.000.000 ₫`.
- Không lưu chuỗi có dấu phân cách vào database.
- Giá trị trả về luôn là number hoặc null.
