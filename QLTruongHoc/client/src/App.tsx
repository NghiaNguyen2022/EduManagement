import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { getDefaultLandingPath, getDefaultPortalPath } from "./config/portal";
import { findRouteAccessByPath } from "./routes/appRoutes";
import { useAuth } from "./features/auth/AuthContext";
import { AttendancePage } from "./pages/AttendancePage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { ClassDetailPage } from "./pages/ClassDetailPage";
import { ClassesPage } from "./pages/ClassesPage";
import { ChuongTrinhDetailPage } from "./pages/ChuongTrinhDetailPage";
import { ChiPhiPage } from "./pages/ChiPhiPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DieuChinhListPage } from "./pages/DieuChinhListPage";
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
import { MyProfilePage } from "./pages/MyProfilePage";
import { OpenInOrganizationPage } from "./pages/OpenInOrganizationPage";
import { OrganizationTreePage } from "./pages/OrganizationTreePage";
import { PhieuNhapHocDetailPage } from "./pages/PhieuNhapHocDetailPage";
import { PhieuXepLopDetailPage } from "./pages/PhieuXepLopDetailPage";
import { PortalLandingPage } from "./pages/PortalLandingPage";
import { RolePermissionPage } from "./pages/RolePermissionPage";
import { SchedulePage } from "./pages/SchedulePage";
import { SelectOrganizationPage } from "./pages/SelectOrganizationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { SystemAuditLogPage } from "./pages/SystemAuditLogPage";
import { TimKiemPage } from "./pages/TimKiemPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserManagementPage } from "./pages/UserManagementPage";

function ProtectedApp() {
  const { auth, loading } = useAuth();
  const location = useLocation();

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

  const routeAccess = findRouteAccessByPath(location.pathname);
  const permissions = auth.currentOrganization.quyen;
  const roles = auth.currentOrganization.vaiTro;
  const isSystemAdmin = permissions.includes("he_thong.quan_tri");
  const allowedByPermission =
    !routeAccess?.permissions ||
    isSystemAdmin ||
    routeAccess.permissions.some((permission) => permissions.includes(permission));
  const allowedByRole =
    !routeAccess?.roles || routeAccess.roles.some((role) => roles.includes(role));
  const allowedByOrganization =
    (!routeAccess?.onlyAtHeThong || auth.currentOrganization.loaiDonVi === "he_thong") &&
    (!routeAccess?.hideAtHeThong || auth.currentOrganization.loaiDonVi !== "he_thong");

  if (!allowedByPermission || !allowedByRole || !allowedByOrganization) {
    return (
      <AppShell>
        <Navigate to={defaultLandingPath} replace />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/users" element={<UserManagementPage />} />

        <Route path="/users/:id" element={<UserDetailPage />} />

        <Route path="/roles" element={<RolePermissionPage />} />

        <Route path="/audit-logs" element={<SystemAuditLogPage />} />

        <Route path="/organizations" element={<OrganizationTreePage />} />

        <Route path="/organizations/:id" element={<DonViDetailPage />} />

        <Route path="/tim-kiem" element={<TimKiemPage />} />

        <Route path="/admissions" element={<LeadsPage />} />

        <Route path="/admissions/:id" element={<LeadDetailPage />} />

        <Route path="/students" element={<StudentsPage />} />

        <Route path="/students/:id" element={<StudentDetailPage />} />

        <Route path="/students/phieu-nhap-hoc/:id" element={<PhieuNhapHocDetailPage />} />

        <Route path="/teachers" element={<TeachersPage />} />

        <Route path="/teachers/:id" element={<GiaoVienDetailPage />} />

        <Route path="/classes" element={<ClassesPage />} />

        <Route path="/classes/:id" element={<ClassDetailPage />} />

        <Route path="/classes/phieu-xep-lop/:id" element={<PhieuXepLopDetailPage />} />

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

        <Route path="/finance/dieu-chinh" element={<DieuChinhListPage />} />

        <Route path="/finance/chi-phi" element={<ChiPhiPage />} />

        <Route path="/finance/phieu-thu/:id" element={<PhieuThuDetailPage />} />

        <Route path="/mo-don-vi" element={<OpenInOrganizationPage />} />

        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/thong-tin-ca-nhan" element={<MyProfilePage />} />

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
