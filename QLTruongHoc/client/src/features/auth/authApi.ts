import type { AuthContextData } from "./authTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (
    !response.ok ||
    !payload.ok ||
    payload.data === undefined
  ) {
    throw new Error(
      payload.error || "Yêu cầu thất bại.",
    );
  }

  return payload.data;
}

export function loginApi(
  username: string,
  password: string,
) {
  return request<AuthContextData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export function getMeApi() {
  return request<AuthContextData>("/api/auth/me");
}

export async function logoutApi() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Đăng xuất thất bại.");
  }
}

export function selectOrganizationApi(
  organizationId: number,
) {
  return request<AuthContextData>(
    "/api/organizations/select",
    {
      method: "POST",
      body: JSON.stringify({
        organizationId,
      }),
    },
  );
}

export function changePasswordApi(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return request<AuthContextData>(
    "/api/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
