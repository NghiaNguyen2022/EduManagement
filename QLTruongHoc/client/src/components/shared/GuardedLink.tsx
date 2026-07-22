import type { MouseEvent, ReactNode } from "react";

import { useGuardedNavigate } from "../../features/navigation/UnsavedChangesContext";

type GuardedLinkProps = {
  to: string;
  className?: string;
  title?: string;
  children: ReactNode;
};

/**
 * Link điều hướng cùng tab, tự hỏi xác nhận nếu trang hiện tại đang có thay
 * đổi chưa lưu (`useUnsavedChangesGuard`). Vẫn là thẻ `<a>` thật nên
 * click-giữa/Ctrl+click/chuột phải "Mở trong tab mới" hoạt động bình thường
 * (bỏ qua guard vì không rời tab hiện tại).
 */
export function GuardedLink({
  to,
  className,
  title,
  children,
}: GuardedLinkProps) {
  const guardedNavigate = useGuardedNavigate();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    guardedNavigate(to);
  }

  return (
    <a href={to} className={className} title={title} onClick={handleClick}>
      {children}
    </a>
  );
}
