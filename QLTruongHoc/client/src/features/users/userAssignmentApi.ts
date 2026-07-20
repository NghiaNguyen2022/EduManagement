import type {
  AuthOrganization,
} from "../auth/authTypes";
import type {
  UserAssignmentItem,
} from "./userAssignmentTypes";

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
      "Content-Type":
        "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const text =
    await response.text();

  const payload = text
    ? (JSON.parse(
        text,
      ) as ApiResponse<T>)
    : {
        ok: false,
        error:
          `HTTP ${response.status}`,
      };

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

export function listAssignmentsApi(
  userId: number,
) {
  return request<
    UserAssignmentItem[]
  >(
    `/api/users/${userId}/assignments`,
  );
}

export function addAssignmentApi(
  userId: number,
  input: {
    roleId: number;
    organizationId: number;
  },
) {
  return request<
    UserAssignmentItem
  >(
    `/api/users/${userId}/assignments`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function removeAssignmentApi(
  userId: number,
  assignmentId: number,
) {
  const response = await fetch(
    `/api/users/${userId}/assignments/${assignmentId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const text =
    await response.text();

  const payload = text
    ? (JSON.parse(
        text,
      ) as ApiResponse<unknown>)
    : {
        ok: response.ok,
      };

  if (
    !response.ok ||
    !payload.ok
  ) {
    throw new Error(
      payload.error ||
        "Không thể xóa phân công.",
    );
  }
}

export function listAvailableOrganizationsApi() {
  return request<
    AuthOrganization[]
  >(
    "/api/organizations/available",
  );
}
