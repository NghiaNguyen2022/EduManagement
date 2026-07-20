import type {
  PermissionItem,
  RoleItem,
  RolePermissionDetail,
} from "./roleTypes";

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

export function listRolesApi() {
  return request<RoleItem[]>("/api/roles");
}

export function listPermissionsApi() {
  return request<PermissionItem[]>(
    "/api/roles/permissions",
  );
}

export function getRolePermissionsApi(
  roleId: number,
) {
  return request<RolePermissionDetail>(
    `/api/roles/${roleId}/permissions`,
  );
}

export function updateRolePermissionsApi(
  roleId: number,
  permissionIds: number[],
) {
  return request<{
    roleId: number;
    permissionIds: number[];
  }>(
    `/api/roles/${roleId}/permissions`,
    {
      method: "PUT",
      body: JSON.stringify({
        permissionIds,
      }),
    },
  );
}
