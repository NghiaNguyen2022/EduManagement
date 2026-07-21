import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AppShell,
} from "./components/layout/AppShell";
import {
  useAuth,
} from "./features/auth/AuthContext";
import {
  ChangePasswordPage,
} from "./pages/ChangePasswordPage";
import {
  DashboardPage,
} from "./pages/DashboardPage";
import {
  LoginPage,
} from "./pages/LoginPage";
import {
  OrganizationTreePage,
} from "./pages/OrganizationTreePage";
import {
  PlaceholderPage,
} from "./pages/PlaceholderPage";
import {
  RolePermissionPage,
} from "./pages/RolePermissionPage";
import {
  SelectOrganizationPage,
} from "./pages/SelectOrganizationPage";
import {
  SystemAuditLogPage,
} from "./pages/SystemAuditLogPage";
import {
  UserManagementPage,
} from "./pages/UserManagementPage";

function ProtectedApp() {
  const {
    auth,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <main className="loading-page">
        Đang tải phiên đăng nhập...
      </main>
    );
  }

  if (!auth) {
    return <LoginPage />;
  }

  if (
    auth.user
      .batBuocDoiMatKhau
  ) {
    return (
      <ChangePasswordPage />
    );
  }

  if (
    !auth.currentOrganization
  ) {
    return (
      <SelectOrganizationPage />
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              databaseConnected={
                true
              }
            />
          }
        />

        <Route
          path="/users"
          element={
            <UserManagementPage />
          }
        />

        <Route
          path="/roles"
          element={
            <RolePermissionPage />
          }
        />

        <Route
          path="/audit-logs"
          element={
            <SystemAuditLogPage />
          }
        />

        <Route
          path="/organizations"
          element={
            <OrganizationTreePage />
          }
        />

        <Route
          path="/admissions"
          element={
            <PlaceholderPage
              title="Hồ sơ tuyển sinh"
            />
          }
        />

        <Route
          path="/consulting"
          element={
            <PlaceholderPage
              title="Tư vấn tuyển sinh"
            />
          }
        />

        <Route
          path="/students"
          element={
            <PlaceholderPage
              title="Học sinh · Học viên"
            />
          }
        />

        <Route
          path="/classes"
          element={
            <PlaceholderPage
              title="Lớp học"
            />
          }
        />

        <Route
          path="/schedule"
          element={
            <PlaceholderPage
              title="Lịch học"
            />
          }
        />

        <Route
          path="/attendance"
          element={
            <PlaceholderPage
              title="Điểm danh"
            />
          }
        />

        <Route
          path="/finance"
          element={
            <PlaceholderPage
              title="Học phí · Công nợ"
            />
          }
        />

        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Cấu hình hệ thống"
            />
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return <ProtectedApp />;
}
