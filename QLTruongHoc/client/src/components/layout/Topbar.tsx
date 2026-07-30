import { Link } from "react-router-dom";
import { appUrl } from "../../utils/appUrl";

import { NotificationBell } from "./NotificationBell";
import {
  OrganizationSelector,
  type OrganizationOption,
} from "./OrganizationSelector";

type TopbarProps = {
  organizations: OrganizationOption[];
  selectedOrganizationId: number;
  userName: string;
  userRole: string;
  userAvatarUrl: string | null;
  isSystemAdminActingInUnit: boolean;
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
  userAvatarUrl,
  isSystemAdminActingInUnit,
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

        {isSystemAdminActingInUnit ? (
          <span
            className="topbar-badge topbar-badge--warning"
            title="Bạn đang thao tác trực tiếp trên dữ liệu của đơn vị này bằng quyền quản trị hệ thống."
          >
            Đang thao tác tại đơn vị (quyền hệ thống)
          </span>
        ) : null}
      </div>

      <div className="topbar__right">
        <NotificationBell />

        <div className="user-menu">
          <Link
            to="/thong-tin-ca-nhan"
            className="user-menu__profile-link"
            title="Thông tin cá nhân"
          >
            {userAvatarUrl ? (
              <img
                src={appUrl(userAvatarUrl)}
                alt=""
                className="user-menu__avatar user-menu__avatar--image"
              />
            ) : (
              <span className="user-menu__avatar">
                {initials || "US"}
              </span>
            )}

            <span className="user-menu__text">
              <strong>{userName}</strong>
              <small>{userRole || "Người dùng"}</small>
            </span>
          </Link>

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
