# Fix Date + Number Format v0.1

## Chuẩn mới

```text
Ngày hiển thị: dd/mm/yyyy
Ngày truyền API: yyyy-mm-dd

Số: 1.000.000
Tiền: 1.000.000 ₫
```

## Áp dụng

Chép đè toàn bộ patch vào project rồi chạy:

```powershell
pnpm typecheck
pnpm dev
```

## Ví dụ sử dụng DateField

```tsx
const [ngaySinh, setNgaySinh] = useState("");

<DateField
  label="Ngày sinh"
  value={ngaySinh}
  onChange={setNgaySinh}
/>
```

Người dùng nhìn thấy:

```text
20/07/2026
```

State nhận:

```text
2026-07-20
```

## Ví dụ NumberInput

```tsx
const [soLuong, setSoLuong] = useState<number | null>(null);

<NumberInput
  label="Số lượng"
  value={soLuong}
  onChange={setSoLuong}
/>
```

## Ví dụ CurrencyInput

```tsx
const [hocPhi, setHocPhi] = useState<number | null>(null);

<CurrencyInput
  label="Học phí"
  value={hocPhi}
  onChange={setHocPhi}
/>
```
