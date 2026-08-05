import { fetchApp } from "../../utils/appUrl";
import type { TinNhanItem, TinNhanThreadItem } from "./tinNhanTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetchApp(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Yêu cầu thất bại.");
  }

  return payload.data as T;
}

export function listTinNhanApi(hocSinhId: number) {
  return request<TinNhanItem[]>(`/api/tin-nhan?hocSinhId=${hocSinhId}`);
}

export function listTinNhanThreadsApi() {
  return request<TinNhanThreadItem[]>("/api/tin-nhan/threads");
}

export function sendTinNhanApi(input: { hocSinhId: number; noiDung: string; lopHocId?: number | null }) {
  return request<TinNhanItem>("/api/tin-nhan", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
