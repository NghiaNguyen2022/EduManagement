import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  changePasswordApi,
  getMeApi,
  loginApi,
  logoutApi,
  selectOrganizationApi,
} from "./authApi";
import type { AuthContextData } from "./authTypes";

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AuthContextValue = {
  auth: AuthContextData | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  selectOrganization: (
    organizationId: number,
  ) => Promise<void>;
  changePassword: (
    input: ChangePasswordInput,
  ) => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] =
    useState<AuthContextData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then(setAuth)
      .catch(() => setAuth(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      loading,

      async login(username, password) {
        const result = await loginApi(
          username,
          password,
        );
        setAuth(result);
      },

      async logout() {
        await logoutApi();
        setAuth(null);
      },

      async selectOrganization(organizationId) {
        const result = await selectOrganizationApi(
          organizationId,
        );
        setAuth(result);
      },

      async changePassword(input) {
        const result = await changePasswordApi(input);
        setAuth(result);
      },
    }),
    [auth, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được dùng trong AuthProvider.",
    );
  }

  return context;
}
