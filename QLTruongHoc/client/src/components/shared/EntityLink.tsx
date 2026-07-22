import type { ReactNode } from "react";

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

  return `/mo-don-vi?${params.toString()}`;
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
  if (!donVi) return <>—</>;

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
