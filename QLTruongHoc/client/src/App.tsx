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
  AttendancePage,
} from "./pages/AttendancePage";
import {
  ChangePasswordPage,
} from "./pages/ChangePasswordPage";
import {
  ClassDetailPage,
} from "./pages/ClassDetailPage";
import {
  ClassesPage,
} from "./pages/ClassesPage";
import {
  ChuongTrinhDetailPage,
} from "./pages/ChuongTrinhDetailPage";
import {
  DashboardPage,
} from "./pages/DashboardPage";
import {
  GiaoVienDetailPage,
} from "./pages/GiaoVienDetailPage";
import {
  FinancePage,
} from "./pages/FinancePage";
import {
  FinanceReportPage,
} from "./pages/FinanceReportPage";
import {
  KyThuDetailPage,
} from "./pages/KyThuDetailPage";
import {
  LeadDetailPage,
} from "./pages/LeadDetailPage";
import {
  LeadsPage,
} from "./pages/LeadsPage";
import {
  LoginPage,
} from "./pages/LoginPage";
import {
  OpenInOrganizationPage,
} from "./pages/OpenInOrganizationPage";
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
  SchedulePage,
} from "./pages/SchedulePage";
import {
  SelectOrganizationPage,
} from "./pages/SelectOrganizationPage";
import {
  StudentDetailPage,
} from "./pages/StudentDetailPage";
import {
  StudentsPage,
} from "./pages/StudentsPage";
import {
  TeachersPage,
} from "./pages/TeachersPage";
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
            <LeadsPage />
          }
        />

        <Route
          path="/admissions/:id"
          element={
            <LeadDetailPage />
          }
        />

        <Route
          path="/students"
          element={
            <StudentsPage />
          }
        />

        <Route
          path="/students/:id"
          element={
            <StudentDetailPage />
          }
        />

        <Route
          path="/teachers"
          element={
            <TeachersPage />
          }
        />

        <Route
          path="/teachers/:id"
          element={
            <GiaoVienDetailPage />
          }
        />

        <Route
          path="/classes"
          element={
            <ClassesPage />
          }
        />

        <Route
          path="/classes/:id"
          element={
            <ClassDetailPage />
          }
        />

        <Route
          path="/chuong-trinh/:id"
          element={
            <ChuongTrinhDetailPage />
          }
        />

        <Route
          path="/schedule"
          element={<SchedulePage />}
        />

        <Route
          path="/attendance"
          element={<AttendancePage />}
        />

        <Route
          path="/finance"
          element={<FinancePage />}
        />

        <Route
          path="/finance/ky-thu/:id"
          element={<KyThuDetailPage />}
        />

        <Route
          path="/finance/bao-cao"
          element={<FinanceReportPage />}
        />

        <Route
          path="/mo-don-vi"
          element={
            <OpenInOrganizationPage />
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
