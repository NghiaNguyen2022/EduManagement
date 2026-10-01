# Patch `client/src/App.tsx`

Thêm import:

```ts
import { UserManagementPage } from "./pages/UserManagementPage";
```

Thay phần render nội dung bằng:

```tsx
{activeItem === "dashboard" ? (
  <DashboardPage
    databaseConnected={databaseConnected}
  />
) : activeItem === "users" ? (
  <UserManagementPage />
) : (
  <PlaceholderPage title={activeLabel} />
)}
```

Nếu `Sidebar` đang dùng id khác cho mục người dùng, đổi `"users"` cho khớp id hiện tại.
