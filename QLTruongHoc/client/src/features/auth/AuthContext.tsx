import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  changePasswordApi,
  getMeApi,
  loginApi,
  logoutApi,
  selectOrganizationApi,
  updateProfileApi,
} from "./authApi";
import type { AuthContextData } from "./authTypes";

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type UpdateProfileInput = {
  hoTen: string;
  email: string;
  soDienThoai: string;
  hinhAnhUrl: string;
};

type AuthContextValue = {
  auth: AuthContextData | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthContextData>;
  logout: () => Promise<void>;
  selectOrganization: (organizationId: number) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Đơn vị đang chọn được lưu ở SESSION phía server, dùng chung 1 cookie cho
// mọi tab — nên trước đây, đổi đơn vị ở tab này sẽ kéo TẤT CẢ các tab khác
// nhảy theo mỗi khi chúng được focus lại (resync đọc thẳng session server).
// `sessionStorage` thì ngược lại: riêng theo từng tab (không chia sẻ như
// cookie/localStorage). Dùng nó để mỗi tab nhớ "đơn vị của riêng tôi", rồi
// khi được focus lại, tab TỰ ĐÒI LẠI đơn vị đó cho session thay vì thụ động
// nhận bất kỳ đơn vị nào tab khác vừa để lại — nhờ vậy nhiều tab mở nhiều
// đơn vị khác nhau vẫn đứng yên, không nhảy theo nhau.
const TAB_ORG_STORAGE_KEY = "qlth_tab_don_vi_id";

function rememberTabOrg(organizationId: number) {
  sessionStorage.setItem(TAB_ORG_STORAGE_KEY, String(organizationId));
}

function getRememberedTabOrg(): number | null {
  const raw = sessionStorage.getItem(TAB_ORG_STORAGE_KEY);
  const parsed = raw ? Number(raw) : null;

  return parsed && Number.isInteger(parsed) ? parsed : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthContextData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Đọc phiên hiện tại, rồi nếu tab này đã từng chọn một đơn vị khác với
   * đơn vị session đang trả về (do tab khác vừa đổi), đòi lại đơn vị của
   * tab này thay vì chấp nhận. Đơn vị nhớ được không còn hợp lệ (mất quyền,
   * bị khoá...) thì bỏ qua, dùng đúng đơn vị session trả về.
   */
  async function syncAuth() {
    const context = await getMeApi();
    const rememberedOrgId = getRememberedTabOrg();

    if (
      rememberedOrgId &&
      rememberedOrgId !== context.currentOrganization?.id &&
      context.organizations.some((item) => item.id === rememberedOrgId)
    ) {
      const reclaimed = await selectOrganizationApi(rememberedOrgId);
      setAuth(reclaimed);
      return;
    }

    if (context.currentOrganization) {
      rememberTabOrg(context.currentOrganization.id);
    }

    setAuth(context);
  }

  useEffect(() => {
    syncAuth()
      .catch(() => setAuth(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function resync() {
      if (document.visibilityState !== "visible") return;

      void syncAuth().catch(() => {});
    }

    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);

    return () => {
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      loading,

      async login(username, password) {
        const result = await loginApi(username, password);
        setAuth(result);

        if (result.currentOrganization) {
          rememberTabOrg(result.currentOrganization.id);
        }

        return result;
      },

      async logout() {
        await logoutApi();
        sessionStorage.removeItem(TAB_ORG_STORAGE_KEY);
        setAuth(null);
      },

      async selectOrganization(organizationId) {
        const result = await selectOrganizationApi(organizationId);
        rememberTabOrg(organizationId);
        setAuth(result);
      },

      async changePassword(input) {
        const result = await changePasswordApi(input);
        setAuth(result);
      },

      async updateProfile(input) {
        const result = await updateProfileApi(input);
        setAuth(result);
      },
    }),
    [auth, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider.");
  }

  return context;
}
