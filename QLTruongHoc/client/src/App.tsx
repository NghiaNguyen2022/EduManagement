import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { getDefaultLandingPath, getDefaultPortalPath } from "./config/portal";
import { useAuth } from "./features/auth/AuthContext";
import { AttendancePage } from "./pages/AttendancePage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { ClassDetailPage } from "./pages/ClassDetailPage";
import { ClassesPage } from "./pages/ClassesPage";
import { ChuongTrinhDetailPage } from "./pages/ChuongTrinhDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DonViDetailPage } from "./pages/DonViDetailPage";
import { GiaoVienDetailPage } from "./pages/GiaoVienDetailPage";
import { FinancePage } from "./pages/FinancePage";
import { FinanceReportPage } from "./pages/FinanceReportPage";
import { TraoDoiPage } from "./pages/TraoDoiPage";
import { ThongBaoPage } from "./pages/ThongBaoPage";
import { KyThuDetailPage } from "./pages/KyThuDetailPage";
import { PhieuThuDetailPage } from "./pages/PhieuThuDetailPage";
import { LeadDetailPage } from "./pages/LeadDetailPage";
import { LeadsPage } from "./pages/LeadsPage";
import { LeaveRequestsPage } from "./pages/LeaveRequestsPage";
import { LoginPage } from "./pages/LoginPage";
import { OpenInOrganizationPage } from "./pages/OpenInOrganizationPage";
import { OrganizationTreePage } from "./pages/OrganizationTreePage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { PortalLandingPage } from "./pages/PortalLandingPage";
import { RolePermissionPage } from "./pages/RolePermissionPage";
import { SchedulePage } from "./pages/SchedulePage";
import { SelectOrganizationPage } from "./pages/SelectOrganizationPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { SystemAuditLogPage } from "./pages/SystemAuditLogPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserManagementPage } from "./pages/UserManagementPage";

function ProtectedApp() {
  const { auth, loading } = useAuth();

  if (loading) {
    return <main className="loading-page">Đang tải phiên đăng nhập...</main>;
  }

  if (!auth) {
    return <LoginPage />;
  }

  if (auth.user.batBuocDoiMatKhau) {
    return <ChangePasswordPage />;
  }

  if (!auth.currentOrganization) {
    return <SelectOrganizationPage />;
  }

  const defaultPortalPath = getDefaultPortalPath(auth.currentOrganization.vaiTro);

  const defaultLandingPath = getDefaultLandingPath(auth.currentOrganization.vaiTro);

  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage databaseConnected={true} />} />

        <Route path="/users" element={<UserManagementPage />} />

        <Route path="/users/:id" element={<UserDetailPage />} />

        <Route path="/roles" element={<RolePermissionPage />} />

        <Route path="/audit-logs" element={<SystemAuditLogPage />} />

        <Route path="/organizations" element={<OrganizationTreePage />} />

        <Route path="/organizations/:id" element={<DonViDetailPage />} />

        <Route path="/admissions" element={<LeadsPage />} />

        <Route path="/admissions/:id" element={<LeadDetailPage />} />

        <Route path="/students" element={<StudentsPage />} />

        <Route path="/students/:id" element={<StudentDetailPage />} />

        <Route path="/teachers" element={<TeachersPage />} />

        <Route path="/teachers/:id" element={<GiaoVienDetailPage />} />

        <Route path="/classes" element={<ClassesPage />} />

        <Route path="/classes/:id" element={<ClassDetailPage />} />

        <Route path="/chuong-trinh/:id" element={<ChuongTrinhDetailPage />} />

        <Route path="/schedule" element={<SchedulePage />} />

        <Route path="/attendance" element={<AttendancePage />} />

        <Route path="/attendance/xin-phep" element={<LeaveRequestsPage />} />

        <Route path="/finance" element={<FinancePage />} />

        <Route path="/notifications" element={<ThongBaoPage />} />

        <Route path="/communications" element={<TraoDoiPage />} />

        <Route path="/thong-bao" element={<Navigate to="/notifications" replace />} />

        <Route path="/finance/ky-thu/:id" element={<KyThuDetailPage />} />

        <Route path="/finance/bao-cao" element={<FinanceReportPage />} />

        <Route path="/finance/phieu-thu/:id" element={<PhieuThuDetailPage />} />

        <Route path="/mo-don-vi" element={<OpenInOrganizationPage />} />

        <Route path="/settings" element={<PlaceholderPage title="Cấu hình hệ thống" />} />

        <Route path="/portal" element={<Navigate to={defaultPortalPath} replace />} />

        <Route path="/portal/phu-huynh" element={<Navigate to="/portal/parent" replace />} />

        <Route path="/portal/:roleSlug" element={<PortalLandingPage />} />

        <Route path="/" element={<Navigate to={defaultLandingPath} replace />} />

        <Route path="*" element={<Navigate to={defaultLandingPath} replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return <ProtectedApp />;
}
