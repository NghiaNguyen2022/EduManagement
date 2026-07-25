import {
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../features/auth/AuthContext";
import {
  findRouteByPath,
} from "../../routes/appRoutes";
import {
  Sidebar,
} from "./Sidebar";
import {
  Topbar,
} from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({
  children,
}: AppShellProps) {
  const {
    auth,
    logout,
    selectOrganization,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const quyenDonViHienTai =
    auth?.currentOrganization?.quyen ?? [];

  // Quản trị hệ thống được cấp `he_thong.quan_tri` ở MỌI đơn vị (xem
  // `auth.repository.ts#getOrganizationsForUser`) — khi đang đứng ở một đơn
  // vị con (không phải hệ thống), họ có toàn quyền thao tác dữ liệu vận hành
  // ở đó như một quản lý đơn vị thật. Hiện badge để tự người quản trị cũng
  // biết mình đang sửa dữ liệu thật, không phải chỉ xem gộp.
  const isSystemAdminActingInUnit =
    quyenDonViHienTai.includes("he_thong.quan_tri") &&
    auth?.currentOrganization?.loaiDonVi !== "he_thong";

  useEffect(() => {
    // Nhiều tab mở nhiều đơn vị khác nhau (qua "mở tab mới") — đặt tiêu đề
    // theo trang + đơn vị đang đứng của TỪNG tab, để phân biệt được trên
    // thanh tab (VD: "Tuyển sinh - Trung tâm Ngoại ngữ Quận 8").
    const pageLabel = findRouteByPath(location.pathname).label;

    document.title = auth?.currentOrganization
      ? `${pageLabel} - ${auth.currentOrganization.tenDonVi}`
      : "Quản lý Trường học";
  }, [auth?.currentOrganization?.tenDonVi, location.pathname]);

  return (
    <div
      className={`app-shell ${
        sidebarCollapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      <Sidebar
        collapsed={
          sidebarCollapsed
        }
        mobileOpen={
          mobileMenuOpen
        }
        onCloseMobile={() =>
          setMobileMenuOpen(false)
        }
      />

      <div className="app-shell__main">
        <Topbar
          organizations={(
            auth?.organizations ?? []
          ).map((item) => ({
            id: item.id,
            code: item.maDonVi,
            name: item.tenDonVi,
            type:
              item.loaiHinhDaoTao ??
              item.loaiDonVi,
          }))}
          selectedOrganizationId={
            auth
              ?.currentOrganization
              ?.id ?? 0
          }
          userName={
            auth?.user.hoTen ?? ""
          }
          userRole={
            auth?.currentOrganization
              ?.vaiTro.join(", ") ?? ""
          }
          userAvatarUrl={
            auth?.user.hinhAnhUrl ?? null
          }
          isSystemAdminActingInUnit={
            isSystemAdminActingInUnit
          }
          sidebarCollapsed={
            sidebarCollapsed
          }
          onOrganizationChange={(
            organizationId,
          ) =>
            void selectOrganization(
              organizationId,
            ).then(() =>
              // Trang detail đang mở (VD: /classes/1) có thể không thuộc
              // đơn vị mới chọn — về dashboard cho chắc, thay vì để trang
              // gọi lại API và nhận lỗi "không tìm thấy" ngay tại chỗ.
              navigate("/dashboard"),
            )
          }
          onToggleSidebar={() =>
            setSidebarCollapsed(
              (current) =>
                !current,
            )
          }
          onOpenMobileMenu={() =>
            setMobileMenuOpen(true)
          }
          onLogout={() =>
            void logout()
          }
        />

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
