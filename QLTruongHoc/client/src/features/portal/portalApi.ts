import { fetchApp } from "../../utils/appUrl";
import type { ParentPortalOverview } from "./portalTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(url: string): Promise<T> {
  const response = await fetchApp(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || "Yêu cầu thất bại.");
  }

  return payload.data;
}

export function loadParentPortalOverviewApi() {
  return request<ParentPortalOverview>("/api/portal/parent");
}

export function loadTeacherPortalOverviewApi() {
  return request<import("./portalTypes").TeacherPortalOverview>("/api/portal/teacher");
}
