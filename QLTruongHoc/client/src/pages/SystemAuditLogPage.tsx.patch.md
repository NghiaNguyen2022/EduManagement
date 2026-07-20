# Điều chỉnh nhỏ trong `SystemAuditLogPage.tsx`

Để phần bộ lọc gọn hơn, bỏ `helpText` ở hai DateField:

```tsx
<DateField
  label="Từ ngày"
  value={fromDate}
  max={toDate || undefined}
  onChange={setFromDate}
/>

<DateField
  label="Đến ngày"
  value={toDate}
  min={fromDate || undefined}
  onChange={setToDate}
/>
```

Không cần dòng:

```tsx
helpText="Định dạng dd/mm/yyyy"
```

vì placeholder đã thể hiện định dạng.
