# Frontend modules

Mỗi module:

```
<module>/
  pages/
  components/
  hooks/
  api/
  types/
  constants/
```

Quy tắc UI kế thừa App Lưu Xá:
- Header trang đúng 2 dòng, title và subtitle căn giữa.
- Action chính đặt bên phải, không bọc header trong card.
- Dùng shared appearance và component chung.
- Trang không nhồi quá nhiều card điều hướng nội bộ.
- Danh sách có filter rõ, trạng thái dễ hiểu, thao tác chính nổi bật.
- Dùng DatePicker/TimePicker; timezone Asia/Ho_Chi_Minh.
