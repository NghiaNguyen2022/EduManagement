import {
  useMemo,
} from "react";
import {
  NavLink,
} from "react-router-dom";

import {
  useAuth,
} from "../../features/auth/AuthContext";
import {
  appRoutes,
} from "../../routes/appRoutes";
import {
  sidebarIcons,
} from "./sidebarIcons";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { auth } = useAuth();

  const permissions =
    auth?.currentOrganization?.quyen ?? [];

  const isSystemAdmin =
    permissions.includes(
      "he_thong.quan_tri",
    );

  const loaiHinhDaoTaoHienTai =
    auth?.currentOrganization?.loaiHinhDaoTao ??
    null;

  const isHeThong =
    auth?.currentOrganization?.loaiDonVi ===
    "he_thong";

  const visibleGroups = useMemo(() => {
    const groupMap = new Map<
      string,
      typeof appRoutes
    >();

    for (const route of appRoutes) {
      const coQuyen =
        !route.permissions ||
        isSystemAdmin ||
        route.permissions.some(
          (permission) =>
            permissions.includes(
              permission,
            ),
        );

      // Menu không khai báo loaiHinhDaoTao là menu dùng chung, hiện ở mọi
      // đơn vị. Áp dụng cho tất cả người dùng, kể cả quản trị hệ thống, vì
      // menu phải phản ánh đúng nghiệp vụ của đơn vị đang chọn.
      const dungLoaiHinh =
        !route.loaiHinhDaoTao ||
        route.loaiHinhDaoTao.includes(
          (loaiHinhDaoTaoHienTai ??
            "khac") as (typeof route.loaiHinhDaoTao)[number],
        );

      if (
        !coQuyen ||
        !dungLoaiHinh ||
        (route.hideAtHeThong && isHeThong) ||
        (route.onlyAtHeThong && !isHeThong)
      ) {
        continue;
      }

      const current =
        groupMap.get(route.group) ?? [];

      current.push(route);
      groupMap.set(route.group, current);
    }

    return Array.from(
      groupMap.entries(),
    );
  }, [
    isSystemAdmin,
    isHeThong,
    loaiHinhDaoTaoHienTai,
    permissions,
  ]);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Đóng menu"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={[
          "sidebar",
          collapsed
            ? "sidebar--collapsed"
            : "",
          mobileOpen
            ? "sidebar--mobile-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">
            ED
          </span>

          {!collapsed ? (
            <span className="sidebar__brand-text">
              <strong>
                QL Trường học
              </strong>
              <small>
                Education Center
              </small>
            </span>
          ) : null}
        </div>

        <nav className="sidebar__nav">
          {visibleGroups.map(
            ([groupName, routes]) => (
              <section
                className="sidebar-group"
                key={groupName}
              >
                {!collapsed ? (
                  <div className="sidebar-group__label">
                    {groupName}
                  </div>
                ) : null}

                <div className="sidebar-group__items">
                  {routes.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      title={
                        route.comingSoon
                          ? `${route.label} (đang xây dựng)`
                          : collapsed
                            ? route.label
                            : undefined
                      }
                      className={({
                        isActive,
                      }) =>
                        [
                          "sidebar-item",
                          isActive
                            ? "sidebar-item--active"
                            : "",
                          route.comingSoon
                            ? "sidebar-item--coming-soon"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      }
                      onClick={
                        onCloseMobile
                      }
                    >
                      <span className="sidebar-item__icon">
                        {sidebarIcons[route.id] ??
                          sidebarIcons.default}
                      </span>

                      {!collapsed ? (
                        <span className="sidebar-item__label">
                          {route.label}
                        </span>
                      ) : null}
                    </NavLink>
                  ))}
                </div>
              </section>
            ),
          )}
        </nav>
      </aside>
    </>
  );
}
