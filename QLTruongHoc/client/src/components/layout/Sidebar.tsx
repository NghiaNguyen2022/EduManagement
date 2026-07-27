import {
  useMemo,
} from "react";
import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../features/auth/AuthContext";
import {
  appRoutes,
  findRouteByPath,
  type AppRouteDefinition,
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
  const location = useLocation();

  const permissions =
    auth?.currentOrganization?.quyen ?? [];
  const roles = auth?.currentOrganization?.vaiTro ?? [];

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

  const isParent =
    auth?.currentOrganization?.vaiTro.includes("phu_huynh") ?? false;

  // `NavLink` mặc định coi `to` là active khi pathname hiện tại chỉ CHỨA nó
  // làm tiền tố (không truyền `end`), nên đứng ở "/finance/bao-cao" vẫn làm
  // "Học phí · Công nợ" (/finance) sáng cùng lúc với "Báo cáo tài chính"
  // (/finance/bao-cao) — 2 mục cùng "dính" active. Dùng lại đúng thuật toán
  // khớp tiền tố dài nhất mà `AppShell`/tiêu đề tab đã dùng
  // (`findRouteByPath`) để chỉ đúng MỘT mục khớp sâu nhất được sáng.
  const activeRouteId = findRouteByPath(location.pathname).id;

  const parentRoutes: AppRouteDefinition[] = [
    {
      id: "parent-overview",
      path: "/portal/parent#tong-quan",
      label: "Tổng quan",
      group: "Cổng phụ huynh",
    },
    {
      id: "parent-schedule",
      path: "/portal/parent#lich-hoc",
      label: "Lịch học",
      group: "Cổng phụ huynh",
    },
    {
      id: "parent-children",
      path: "/portal/parent#thong-tin-con",
      label: "Thông tin các con",
      group: "Cổng phụ huynh",
    },
    {
      id: "notifications",
      path: "/notifications",
      label: "Thông báo",
      group: "Liên lạc",
    },
    {
      id: "my-profile",
      path: "/thong-tin-ca-nhan",
      label: "Hồ sơ cá nhân",
      group: "Tài khoản",
    },
  ];

  const visibleGroups = useMemo(() => {
    const groupMap = new Map<
      string,
      typeof appRoutes
    >();

    for (const route of isParent ? parentRoutes : appRoutes) {
      const coQuyen =
        !route.permissions ||
        isSystemAdmin ||
        route.permissions.some(
          (permission) =>
            permissions.includes(
              permission,
            ),
        );
      const dungVaiTro =
        !route.roles || route.roles.some((role) => roles.includes(role));

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
        !dungVaiTro ||
        !dungLoaiHinh ||
        route.hideFromSidebar ||
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
    roles,
    isParent,
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
                      className={() =>
                        [
                          "sidebar-item",
                          (route.path.includes("#")
                            ? `${location.pathname}${
                                location.hash ||
                                (route.id === "parent-overview" ? "#tong-quan" : "")
                              }` === route.path
                            : route.id === activeRouteId)
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
