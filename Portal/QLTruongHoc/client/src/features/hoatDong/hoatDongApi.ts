import { fetchApp } from "../../utils/appUrl";
import type { HoatDongFormInput, HoatDongItem } from "./hoatDongTypes";

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

export function listHoatDongByLopHocApi(lopHocId: number) {
  return request<HoatDongItem[]>(`/api/hoat-dong?lopHocId=${lopHocId}`);
}

export function listHoatDongForGuardianApi(hocSinhId: number) {
  return request<HoatDongItem[]>(`/api/hoat-dong?hocSinhId=${hocSinhId}`);
}

export function addHoatDongApi(input: HoatDongFormInput) {
  return request<HoatDongItem>("/api/hoat-dong", {
    method: "POST",
    body: JSON.stringify({ ...input, lopHocId: Number(input.lopHocId) }),
  });
}

export async function removeHoatDongApi(id: number) {
  const response = await fetchApp(`/api/hoat-dong/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Không thể xoá hoạt động.");
  }
}
