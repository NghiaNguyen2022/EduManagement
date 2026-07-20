import type {
  AuthContextData,
} from "./authTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function readJsonSafely<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      response.ok
        ? "Máy chủ không trả dữ liệu."
        : `Máy chủ lỗi HTTP ${response.status}.`,
    );
  }

  try {
    return JSON.parse(
      text,
    ) as ApiResponse<T>;
  } catch {
    throw new Error(
      `Phản hồi từ máy chủ không hợp lệ (HTTP ${response.status}).`,
    );
  }
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type":
          "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      "Không kết nối được tới máy chủ API. Hãy kiểm tra backend port 3100.",
    );
  }

  const payload =
    await readJsonSafely<T>(
      response,
    );

  if (
    !response.ok ||
    !payload.ok ||
    payload.data === undefined
  ) {
    throw new Error(
      payload.error ||
        "Yêu cầu thất bại.",
    );
  }

  return payload.data;
}

export function loginApi(
  username: string,
  password: string,
) {
  return request<AuthContextData>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );
}

export function getMeApi() {
  return request<AuthContextData>(
    "/api/auth/me",
  );
}

export async function logoutApi() {
  let response: Response;

  try {
    response = await fetch(
      "/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      },
    );
  } catch {
    throw new Error(
      "Không kết nối được tới máy chủ API.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "Đăng xuất thất bại.",
    );
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
