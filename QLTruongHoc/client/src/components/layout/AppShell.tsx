import { useState } from "react";

import { useAuth } from "../../features/auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
  activeItem: string;
  onNavigate: (itemId: string, label: string) => void;
};

export function AppShell({
  children,
  activeItem,
  onNavigate,
}: AppShellProps) {
  const { auth, logout, selectOrganization } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onNavigate={onNavigate}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="app-shell__main">
        <Topbar
          organizations={(auth?.organizations ?? []).map((item) => ({
            id: item.id,
            code: item.maDonVi,
            name: item.tenDonVi,
            type: item.loaiHinhDaoTao ?? item.loaiDonVi,
          }))}
          selectedOrganizationId={
            auth?.currentOrganization?.id ?? 0
          }
          userName={auth?.user.hoTen ?? ""}
          userRole={
            auth?.currentOrganization?.vaiTro.join(", ") ?? ""
          }
          sidebarCollapsed={sidebarCollapsed}
          onOrganizationChange={(organizationId) =>
            void selectOrganization(organizationId)
          }
          onToggleSidebar={() =>
            setSidebarCollapsed((current) => !current)
          }
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={() => void logout()}
        />

        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
