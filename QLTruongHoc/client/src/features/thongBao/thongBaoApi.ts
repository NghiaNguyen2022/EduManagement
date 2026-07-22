import type { ThongBaoFormInput, ThongBaoItem } from "./thongBaoTypes";

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

export async function listThongBaoApi() {
  const rows =
    await request<(ThongBaoItem | { thongBao: ThongBaoItem; donVi: ThongBaoItem["donVi"] })[]>(
      "/api/thong-bao",
    );

  return rows.map((row) => ("thongBao" in row ? { ...row.thongBao, donVi: row.donVi } : row));
}

export function createThongBaoApi(input: ThongBaoFormInput) {
  return request<ThongBaoItem>("/api/thong-bao", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function confirmThongBaoDaDocApi(id: number) {
  return request(`/api/thong-bao/${id}/da-doc`, {
    method: "POST",
  });
}
