import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../auth/AuthContext";
import {
  danhDauDaDocApi,
  danhDauTatCaDaDocApi,
  listThongBaoSuKienApi,
  listThongBaoSuKienMoiApi,
} from "./thongBaoSuKienApi";
import type { ThongBaoSuKienItem } from "./thongBaoSuKienTypes";

const POLL_INTERVAL_MS = 20_000;

type NotificationContextValue = {
  items: ThongBaoSuKienItem[];
  soChuaDoc: number;
  toasts: ThongBaoSuKienItem[];
  markRead: (id: number) => void;
  markAllRead: () => void;
  dismissToast: (id: number) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * Bọc toàn app (trong `AppShell`) — poll `/api/thong-bao-su-kien/moi` mỗi
 * 20s để lấy sự kiện chưa hiện popup (server tự đánh dấu `daHienThi` ngay
 * khi trả về, nên mỗi sự kiện chỉ pop-up đúng 1 lần dù poll lặp lại). Fetch
 * ngay khi mount/đổi đơn vị — nên vừa đăng nhập lại cũng thấy toast dồn từ
 * lúc vắng mặt, không cần cơ chế riêng cho "đang dùng" vs "vừa đăng nhập".
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const donViId = auth?.currentOrganization?.id ?? null;

  const [items, setItems] = useState<ThongBaoSuKienItem[]>([]);
  const [soChuaDoc, setSoChuaDoc] = useState(0);
  const [toasts, setToasts] = useState<ThongBaoSuKienItem[]>([]);

  const donViIdRef = useRef(donViId);
  donViIdRef.current = donViId;

  const refreshList = useCallback(async () => {
    if (!donViIdRef.current) return;

    try {
      const result = await listThongBaoSuKienApi();
      setItems(result.items);
      setSoChuaDoc(result.soChuaDoc);
    } catch {
      // Bỏ qua lỗi mạng tạm thời — lần poll sau sẽ thử lại.
    }
  }, []);

  const pollNew = useCallback(async () => {
    if (!donViIdRef.current) return;

    try {
      const moi = await listThongBaoSuKienMoiApi();

      if (moi.length > 0) {
        setToasts((current) => [...current, ...moi]);
      }

      await refreshList();
    } catch {
      // Bỏ qua lỗi mạng tạm thời — lần poll sau sẽ thử lại.
    }
  }, [refreshList]);

  useEffect(() => {
    if (!donViId) {
      setItems([]);
      setSoChuaDoc(0);
      setToasts([]);
      return;
    }

    void pollNew();

    const timer = window.setInterval(() => {
      void pollNew();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [donViId, pollNew]);

  const markRead = useCallback((id: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, daDoc: true } : item)),
    );
    setSoChuaDoc((current) => Math.max(0, current - 1));
    void danhDauDaDocApi(id);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, daDoc: true })));
    setSoChuaDoc(0);
    void danhDauTatCaDaDocApi();
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ items, soChuaDoc, toasts, markRead, markAllRead, dismissToast }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications phải dùng trong NotificationProvider.");
  }

  return context;
}
