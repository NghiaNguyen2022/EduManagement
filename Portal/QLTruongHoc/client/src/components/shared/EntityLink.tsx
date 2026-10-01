import type { ReactNode } from "react";
import { appUrl } from "../../utils/appUrl";

import { useAuth } from "../../features/auth/AuthContext";
import { GuardedLink } from "./GuardedLink";

export type DonViRef = {
  id: number;
  maDonVi: string;
  tenDonVi: string;
};

function buildOrgTabHref(donViId: number, to: string) {
  const params = new URLSearchParams({
    donViId: String(donViId),
    to,
  });

  return appUrl(`/mo-don-vi?${params.toString()}`);
}

/**
 * `quyền` lan xuống mọi đơn vị con cho quản trị hệ thống (xem
 * `getOrganizationsForUser`), nhưng KHÔNG lan cho các vai trò khác (VD kế
 * toán tổng chỉ có vaiTro/quyền đúng tại đơn vị được gán) — nên
 * `auth.organizations` (danh sách đơn vị user thực sự truy cập được) là nơi
 * duy nhất biết chắc link chéo đơn vị có mở được hay không, tránh việc dẫn
 * link rồi vào tới nơi mới báo "không có quyền truy cập".
 */
function useCoTheTruyCap(donViId: number | undefined) {
  const { auth } = useAuth();

  if (donViId === undefined) return true;

  return auth?.organizations.some((item) => item.id === donViId) ?? false;
}

type EntityLinkProps = {
  to: string;
  /**
   * Có giá trị khi dòng dữ liệu đến từ đơn vị khác đơn vị đang đứng (màn
   * xem gộp ở đơn vị hệ thống). Khi đó mở tab mới + tự chuyển đơn vị trước
   * khi vào trang chi tiết, vì trang chi tiết luôn khoá theo đơn vị đang
   * chọn. Không truyền `donVi` (hoặc `undefined`) nghĩa là cùng đơn vị đang
   * đứng — điều hướng thẳng trong cùng tab.
   */
  donVi?: DonViRef;
  className?: string;
  children: ReactNode;
};

/** Link tới trang chi tiết một thực thể — tự chọn cùng tab hay tab mới theo đơn vị. */
export function EntityLink({
  to,
  donVi,
  className = "text-button",
  children,
}: EntityLinkProps) {
  const coTheTruyCap = useCoTheTruyCap(donVi?.id);

  if (donVi && !coTheTruyCap) {
    return (
      <span
        className={className}
        title={`Không có quyền truy cập đơn vị ${donVi.tenDonVi}`}
      >
        {children}
      </span>
    );
  }

  if (donVi) {
    return (
      <a
        href={buildOrgTabHref(donVi.id, to)}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={`Mở trong tab mới — đơn vị ${donVi.tenDonVi}`}
      >
        {children}
      </a>
    );
  }

  return (
    <GuardedLink to={to} className={className}>
      {children}
    </GuardedLink>
  );
}

type OrgLinkProps = {
  donVi?: DonViRef;
  /** Trang đích trong đơn vị đó sau khi chuyển — mặc định bảng điều hành. */
  to?: string;
};

/** Ô "Đơn vị" trong bảng xem gộp — mở tab mới và chuyển hẳn sang đơn vị đó. */
export function OrgLink({ donVi, to = "/dashboard" }: OrgLinkProps) {
  const coTheTruyCap = useCoTheTruyCap(donVi?.id);

  if (!donVi) return <>—</>;

  if (!coTheTruyCap) {
    return <span title="Không có quyền truy cập đơn vị này">{donVi.tenDonVi}</span>;
  }

  return (
    <a
      href={buildOrgTabHref(donVi.id, to)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-button"
      title={`Mở "${donVi.tenDonVi}" trong tab mới`}
    >
      {donVi.tenDonVi}
    </a>
  );
}
