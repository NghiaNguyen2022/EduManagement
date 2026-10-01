# Hướng dẫn đưa bản cập nhật Vireon lên vireon.vn

## Tình trạng hiện tại
- Code mới (trang Tuyển dụng, Liên hệ, menu điều hướng mới, footer mới, sắp lại trang chủ) **đã có sẵn** trên server tại `/home/pauldigi/apps/vireon-portal/app` và `/lib` — không cần upload lại.
- `next.config.ts` trên server cũng đã được sửa đúng.
- Vướng mắc duy nhất còn lại: bản build (`.next`) đang chạy vẫn là bản CŨ (1/8), vì các lần build thử đều lỗi hết tài nguyên (Turbopack). Cần đổi sang chế độ build "webpack" (ít tốn tài nguyên hơn, đã test chạy tốt) rồi build lại.

## Có cần chạy SQL / migrate database không?
**Không.** Toàn bộ thay đổi lần này chỉ là giao diện (trang, menu, footer) — không đổi cấu trúc database, không cần chạy file `mysql-schema.sql` hay bất kỳ câu SQL nào.

(Ghi chú cho lần sau nếu có thay đổi database: file `mysql-schema.sql` đã có sẵn trong `/home/pauldigi/apps/vireon-portal/mysql-schema.sql`. Cách chạy nếu cần: vào cPanel → phpMyAdmin → chọn database `vireon_portal` (hoặc tên đang dùng) → tab SQL → dán nội dung file → Go. Bản `app.cjs` hiện tại trên server đã được tối ưu để **không** tự chạy lại schema mỗi lần khởi động nữa, nên nếu cần migrate phải làm thủ công qua phpMyAdmin.)

## Bước 1 — Sửa `deploy.sh`
1. Đăng nhập cPanel → **File Manager** → vào `/home/pauldigi/apps/vireon-portal`.
2. Chọn file `deploy.sh` → bấm **Edit**.
3. Chọn hết nội dung cũ (Ctrl+A), xoá, rồi dán đè nội dung sau vào:

```bash
#!/bin/bash
set -e

LIVE="/home/pauldigi/apps/vireon-portal"
STAMP=$(date +%Y%m%d_%H%M%S)
STAGE="/home/pauldigi/apps/vireon-portal-build-$STAMP"
LOG="$LIVE/deploy-$STAMP.log"

cd "$LIVE"
source /home/pauldigi/nodevenv/apps/vireon-portal/22/bin/activate

{
  echo "=== $(date) : starting isolated build in $STAGE ==="

  chmod -R u+rwX,go+rX app lib public 2>/dev/null || true
  find app lib public -type d -exec chmod u+x,go+rx {} + 2>/dev/null || true

  mkdir -p "$STAGE"
  cp -a app "$STAGE/app"
  cp -a lib "$STAGE/lib"
  cp -a public "$STAGE/public"
  cp next.config.ts "$STAGE/next.config.ts"
  [ -f tsconfig.json ] && cp tsconfig.json "$STAGE/tsconfig.json"
  cp package.json "$STAGE/package.json"
  ln -s "$LIVE/node_modules" "$STAGE/node_modules"

  cd "$STAGE"
  echo "=== $(date) : running next build (webpack mode) ==="
  npx next build --webpack

  if [ ! -f "$STAGE/.next/standalone/server.js" ]; then
    echo "=== BUILD FAILED: no standalone server.js produced, live site untouched ==="
    exit 1
  fi

  echo "=== $(date) : build OK, applying to live (with backup) ==="
  cd "$LIVE"
  cp -f server.js "server.js.bak-$STAMP"
  mv .next ".next.bak-$STAMP"
  mkdir .next
  cp -f "$STAGE/.next/standalone/server.js" ./server.js
  cp -a "$STAGE/.next/standalone/.next/." .next/
  cp -a "$STAGE/.next/static" .next/static
  cp -a "$STAGE/public/." public/

  echo "=== $(date) : apply complete. backups: server.js.bak-$STAMP , .next.bak-$STAMP ==="
  echo "=== DEPLOY SUCCESS ==="
} > "$LOG" 2>&1

echo "See $LOG"
```

4. Bấm **Save Changes**, rồi **Close**.

(Điểm khác duy nhất so với bản cũ: dòng `npx next build` đổi thành `npx next build --webpack`.)

## Bước 2 — Chạy build
1. Vào cPanel → **Terminal**.
2. Gõ lần lượt (Enter sau mỗi dòng):
   ```bash
   cd apps/vireon-portal
   bash deploy.sh
   ```
3. Đợi khoảng 30–90 giây. Terminal quay lại dấu nhắc `$` là xong (không hiện lỗi gì trực tiếp — mọi log được ghi vào file).

## Bước 3 — Kiểm tra kết quả
1. Vào **File Manager** → `/home/pauldigi/apps/vireon-portal`.
2. Tìm file mới nhất tên `deploy-<số>.log` (theo giờ vừa chạy).
3. Mở xem (chọn file → **View**). 
   - Nếu thấy dòng cuối **`=== DEPLOY SUCCESS ===`** → build thành công, đã áp dụng lên site.
   - Nếu thấy **`BUILD FAILED`** hoặc lỗi khác → gửi lại nội dung log để xem tiếp.

## Bước 4 — Khởi động lại app
1. Vào cPanel → **Setup Node.js App**.
2. Tìm dòng ứng dụng có App URI = `vireon.vn/`.
3. Bấm nút **Restart** (biểu tượng vòng tròn mũi tên) ở cột Actions.

## Bước 5 — Kiểm tra trực tiếp
Mở `https://vireon.vn` — kiểm tra:
- Menu có đủ: Giới thiệu / Ứng dụng / Không gian số / App Portal / Tuyển dụng / Liên hệ
- Trang `/tuyen-dung` và `/lien-he` mở được
- Trang chủ: khối "Giới thiệu" nằm ngay sau phần hero, khối bài viết Paul Digital Hub hiển thị dạng danh sách gọn

## Nếu có sự cố, cách rollback (khôi phục bản cũ)
Deploy script tự động backup trước khi ghi đè. Nếu sau khi restart mà site lỗi:
1. Vào File Manager → `/home/pauldigi/apps/vireon-portal`.
2. Xoá (hoặc đổi tên) thư mục `.next` hiện tại.
3. Đổi tên thư mục `.next.bak-<timestamp>` (bản backup, cùng thời điểm vừa deploy) thành `.next`.
4. Đổi tên `server.js` hiện tại thành tên khác, rồi đổi `server.js.bak-<timestamp>` thành `server.js`.
5. Vào Setup Node.js App → Restart lại lần nữa.
