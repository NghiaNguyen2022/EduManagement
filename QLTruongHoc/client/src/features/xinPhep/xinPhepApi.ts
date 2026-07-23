import type { DonXinPhepDetail, DonXinPhepFormInput, DonXinPhepRow } from "./xinPhepTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
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

export function createDonXinPhepApi(input: DonXinPhepFormInput) {
  return request<DonXinPhepDetail>("/api/xin-phep", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listDonXinPhepStaffApi(trangThai?: string) {
  const query = trangThai ? `?trangThai=${encodeURIComponent(trangThai)}` : "";
  return request<DonXinPhepRow[]>(`/api/xin-phep${query}`);
}

export function duyetDonXinPhepApi(
  id: number,
  input: { chapNhan: boolean; ghiChuDuyet?: string },
) {
  return request<DonXinPhepDetail>(`/api/xin-phep/${id}/duyet`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
