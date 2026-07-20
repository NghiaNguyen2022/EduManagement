import {
  OrganizationSelector,
  type OrganizationOption,
} from "./OrganizationSelector";

type TopbarProps = {
  organizations: OrganizationOption[];
  selectedOrganizationId: number;
  userName: string;
  userRole: string;
  sidebarCollapsed: boolean;
  onOrganizationChange: (organizationId: number) => void;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
};

export function Topbar({
  organizations,
  selectedOrganizationId,
  userName,
  userRole,
  sidebarCollapsed,
  onOrganizationChange,
  onToggleSidebar,
  onOpenMobileMenu,
  onLogout,
}: TopbarProps) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="icon-button desktop-only"
          aria-label={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        <button
          type="button"
          className="icon-button mobile-only"
          aria-label="Mở menu"
          onClick={onOpenMobileMenu}
        >
          ☰
        </button>

        <OrganizationSelector
          organizations={organizations}
          selectedId={selectedOrganizationId}
          onChange={onOrganizationChange}
        />
      </div>

      <div className="topbar__right">
        <button type="button" className="topbar-action">
          ◌
          <span className="topbar-action__dot" />
        </button>

        <div className="user-menu">
          <span className="user-menu__avatar">
            {initials || "US"}
          </span>

          <span className="user-menu__text">
            <strong>{userName}</strong>
            <small>{userRole || "Người dùng"}</small>
          </span>

          <button
            type="button"
            className="text-button"
            onClick={onLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
