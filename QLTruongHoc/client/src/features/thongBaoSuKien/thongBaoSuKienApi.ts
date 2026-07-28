import type {
  ThongBaoSuKienDanhSach,
  ThongBaoSuKienItem,
} from "./thongBaoSuKienTypes";

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

export function listThongBaoSuKienApi() {
  return request<ThongBaoSuKienDanhSach>("/api/thong-bao-su-kien");
}

export function listThongBaoSuKienMoiApi() {
  return request<ThongBaoSuKienItem[]>("/api/thong-bao-su-kien/moi");
}

export function danhDauDaDocApi(id: number) {
  return request(`/api/thong-bao-su-kien/${id}/danh-dau-da-doc`, {
    method: "POST",
  });
}

export function danhDauTatCaDaDocApi() {
  return request("/api/thong-bao-su-kien/danh-dau-tat-ca-da-doc", {
    method: "POST",
  });
}
