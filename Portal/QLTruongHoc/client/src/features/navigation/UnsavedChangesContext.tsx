import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

type UnsavedChangesContextValue = {
  setDirty: (dirty: boolean) => void;
  guardedAction: (action: () => void) => void;
};

const UnsavedChangesContext =
  createContext<UnsavedChangesContextValue | null>(null);

/**
 * Bọc toàn app. Trang nào có form đang sửa gọi `useUnsavedChangesGuard(true)`
 * — mọi điều hướng trong cùng tab qua `GuardedLink`/`useGuardedNavigate` sau
 * đó sẽ hỏi xác nhận trước khi rời trang; đóng/tải lại tab cũng được chặn
 * qua `beforeunload`. Không áp dụng cho link mở tab mới (tab hiện tại không
 * mất gì nên không cần hỏi).
 */
export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const guardedAction = useCallback(
    (action: () => void) => {
      if (isDirty) {
        setPendingAction(() => action);
        return;
      }

      action();
    },
    [isDirty],
  );

  return (
    <UnsavedChangesContext.Provider
      value={{ setDirty: setIsDirty, guardedAction }}
    >
      {children}

      <ConfirmDialog
        open={pendingAction !== null}
        title="Rời trang khi chưa lưu"
        message="Bạn đang có thay đổi chưa lưu. Rời trang bây giờ sẽ mất các thay đổi này. Tiếp tục?"
        confirmLabel="Rời trang"
        rejectLabel="Ở lại"
        danger
        onConfirm={() => {
          const action = pendingAction;
          setPendingAction(null);
          setIsDirty(false);
          action?.();
        }}
        onCancel={() => setPendingAction(null)}
      />
    </UnsavedChangesContext.Provider>
  );
}

function useUnsavedChangesContext() {
  const context = useContext(UnsavedChangesContext);

  if (!context) {
    throw new Error(
      "useUnsavedChangesGuard/useGuardedNavigate phải dùng trong UnsavedChangesProvider.",
    );
  }

  return context;
}

/** Trang gọi hook này với `true` khi đang có thay đổi chưa lưu, `false` khi đã lưu/rời form. */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const { setDirty } = useUnsavedChangesContext();

  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);
}

/** Trả về hàm điều hướng cùng tab, tự hỏi xác nhận nếu trang đang dirty. */
export function useGuardedNavigate() {
  const { guardedAction } = useUnsavedChangesContext();
  const navigate = useNavigate();

  return useCallback(
    (to: string) => {
      guardedAction(() => navigate(to));
    },
    [guardedAction, navigate],
  );
}
