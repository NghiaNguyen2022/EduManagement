# Audit Filter Layout Polish v0.2

Chép đè toàn bộ patch vào project.

Các file chính:

```text
client/src/pages/SystemAuditLogPage.tsx
client/src/styles/audit-filter-layout.css
client/src/main.tsx
```

Sau đó:

```powershell
pnpm typecheck
pnpm dev
```

Refresh mạnh:

```text
Ctrl + F5
```

Patch có reset các CSS bộ lọc cũ để tránh tình trạng hai hàng tiếp tục dính hoặc chồng nhau.
