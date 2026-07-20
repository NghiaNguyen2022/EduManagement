import {
  useMemo,
} from "react";

import {
  useAuth,
} from "../../features/auth/AuthContext";

type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  permissions?: string[];
};

type SidebarGroup = {
  id: string;
  label: string;
  items: SidebarItem[];
};

type SidebarProps = {
  activeItem: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: (
    itemId: string,
    label: string,
  ) => void;
  onCloseMobile: () => void;
};

const sidebarGroups: SidebarGroup[] = [
  {
    id: "overview",
    label: "Tổng quan",
    items: [
      {
        id: "dashboard",
        label: "Bảng điều hành",
        icon: "⌂",
      },
    ],
  },
  {
    id: "admissions",
    label: "Tuyển sinh",
    items: [
      {
        id: "admissions",
        label: "Hồ sơ tuyển sinh",
        icon: "◎",
        permissions: [
          "tuyen_sinh.xem",
          "tuyen_sinh.quan_ly",
        ],
      },
      {
        id: "consulting",
        label: "Tư vấn tuyển sinh",
        icon: "◇",
        permissions: [
          "tuyen_sinh.xem",
          "tuyen_sinh.quan_ly",
        ],
      },
    ],
  },
  {
    id: "academic",
    label: "Đào tạo",
    items: [
      {
        id: "students",
        label: "Học sinh · Học viên",
        icon: "◉",
        permissions: [
          "hoc_sinh.xem",
          "hoc_sinh.quan_ly",
        ],
      },
      {
        id: "classes",
        label: "Lớp học",
        icon: "▦",
        permissions: [
          "lop_hoc.xem",
          "lop_hoc.quan_ly",
        ],
      },
      {
        id: "schedule",
        label: "Lịch học",
        icon: "◫",
        permissions: [
          "lop_hoc.xem",
          "lop_hoc.quan_ly",
        ],
      },
      {
        id: "attendance",
        label: "Điểm danh",
        icon: "✓",
        permissions: [
          "diem_danh.xem",
          "diem_danh.thuc_hien",
        ],
      },
    ],
  },
  {
    id: "finance",
    label: "Tài chính",
    items: [
      {
        id: "finance",
        label: "Học phí · Công nợ",
        icon: "₫",
        permissions: [
          "tai_chinh.xem",
          "tai_chinh.quan_ly",
        ],
      },
    ],
  },
  {
    id: "system",
    label: "Hệ thống",
    items: [
      {
        id: "users",
        label: "Quản lý người dùng",
        icon: "♙",
        permissions: [
          "nguoi_dung.xem",
          "nguoi_dung.quan_ly",
        ],
      },
      {
        id: "roles",
        label: "Vai trò · Phân quyền",
        icon: "⚿",
        permissions: [
          "phan_quyen.xem",
          "phan_quyen.quan_ly",
        ],
      },
      {
        id: "audit-logs",
        label: "Nhật ký hệ thống",
        icon: "≡",
        permissions: [
          "phan_quyen.xem",
          "phan_quyen.quan_ly",
        ],
      },
      {
        id: "settings",
        label: "Cấu hình hệ thống",
        icon: "⚙",
        permissions: [
          "he_thong.quan_tri",
          "don_vi.quan_ly",
        ],
      },
    ],
  },
];

export function Sidebar({
  activeItem,
  collapsed,
  mobileOpen,
  onNavigate,
  onCloseMobile,
}: SidebarProps) {
  const { auth } = useAuth();

  const permissions =
    auth?.currentOrganization?.quyen ?? [];

  const isSystemAdmin =
    permissions.includes(
      "he_thong.quan_tri",
    );

  const visibleGroups = useMemo(
    () =>
      sidebarGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              !item.permissions ||
              isSystemAdmin ||
              item.permissions.some(
                (permission) =>
                  permissions.includes(
                    permission,
                  ),
              ),
          ),
        }))
        .filter(
          (group) =>
            group.items.length > 0,
        ),
    [isSystemAdmin, permissions],
  );

  function handleNavigate(
    itemId: string,
    label: string,
  ) {
    onNavigate(itemId, label);
    onCloseMobile();
  }

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
            (group) => (
              <section
                className="sidebar-group"
                key={group.id}
              >
                {!collapsed ? (
                  <div className="sidebar-group__label">
                    {group.label}
                  </div>
                ) : null}

                <div className="sidebar-group__items">
                  {group.items.map(
                    (item) => {
                      const active =
                        item.id ===
                        activeItem;

                      return (
                        <button
                          type="button"
                          key={item.id}
                          title={
                            collapsed
                              ? item.label
                              : undefined
                          }
                          className={[
                            "sidebar-item",
                            active
                              ? "sidebar-item--active"
                              : "",
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(" ")}
                          onClick={() =>
                            handleNavigate(
                              item.id,
                              item.label,
                            )
                          }
                        >
                          <span className="sidebar-item__icon">
                            {item.icon}
                          </span>

                          {!collapsed ? (
                            <span className="sidebar-item__label">
                              {item.label}
                            </span>
                          ) : null}
                        </button>
                      );
                    },
                  )}
                </div>
              </section>
            ),
          )}
        </nav>
      </aside>
    </>
  );
}
