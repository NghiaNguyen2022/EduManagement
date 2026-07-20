import {
  useEffect,
  useState,
} from "react";

import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./features/auth/AuthContext";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { SelectOrganizationPage } from "./pages/SelectOrganizationPage";
import { UserManagementPage } from "./pages/UserManagementPage";

type HealthResponse = {
  ok: boolean;
};

export function App() {
  const { auth, loading } = useAuth();

  const [activeItem, setActiveItem] =
    useState("dashboard");
  const [activeLabel, setActiveLabel] =
    useState("Bảng điều hành");
  const [
    databaseConnected,
    setDatabaseConnected,
  ] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(async (response) => {
        const payload =
          (await response.json()) as HealthResponse;

        setDatabaseConnected(
          Boolean(response.ok && payload.ok),
        );
      })
      .catch(() => {
        setDatabaseConnected(false);
      });
  }, []);

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

  if (auth.user.batBuocDoiMatKhau) {
    return <ChangePasswordPage />;
  }

  if (!auth.currentOrganization) {
    return <SelectOrganizationPage />;
  }

  return (
    <AppShell
      activeItem={activeItem}
      onNavigate={(itemId, label) => {
        setActiveItem(itemId);
        setActiveLabel(label);
      }}
    >
      {activeItem === "dashboard" ? (
        <DashboardPage
          databaseConnected={databaseConnected}
        />
      ) : activeItem === "users" ? (
        <UserManagementPage />
      ) : (
        <PlaceholderPage title={activeLabel} />
      )}
    </AppShell>
  );
}
