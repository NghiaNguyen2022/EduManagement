import type {
  RoleOption,
  UserDetail,
  UserListItem,
} from "./userTypes";

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

  const payload =
    (await response.json()) as ApiResponse<T>;

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

export function listUsersApi() {
  return request<UserListItem[]>("/api/users");
}

export function getUserDetailApi(id: number) {
  return request<UserDetail>(`/api/users/${id}`);
}

export function listRolesApi() {
  return request<RoleOption[]>(
    "/api/users/roles",
  );
}

export function createUserApi(input: {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
}) {
  return request<{
    user: UserListItem;
    temporaryPassword: string;
  }>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUserStatusApi(
  userId: number,
  status: "hoat_dong" | "tam_khoa",
) {
  const response = await fetch(
    `/api/users/${userId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  const payload =
    (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.error ||
        "Không thể cập nhật trạng thái.",
    );
  }
}

export function resetPasswordApi(
  userId: number,
) {
  return request<{
    temporaryPassword: string;
  }>(
    `/api/users/${userId}/reset-password`,
    {
      method: "POST",
    },
  );
}
