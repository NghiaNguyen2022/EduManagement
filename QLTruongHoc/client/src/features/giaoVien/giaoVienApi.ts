import type {
  GiaoVienFormInput,
  GiaoVienItem,
} from "./giaoVienTypes";

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

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Yêu cầu thất bại.");
  }

  return payload.data as T;
}

export async function listGiaoVienApi() {
  const rows = await request<
    (GiaoVienItem | { giaoVien: GiaoVienItem; donVi: GiaoVienItem["donVi"] })[]
  >("/api/giao-vien");

  return rows.map((row) =>
    "giaoVien" in row ? { ...row.giaoVien, donVi: row.donVi } : row,
  );
}

export function createGiaoVienApi(input: GiaoVienFormInput) {
  return request<GiaoVienItem>("/api/giao-vien", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateGiaoVienApi(
  id: number,
  input: GiaoVienFormInput,
) {
  return request<GiaoVienItem>(`/api/giao-vien/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setGiaoVienStatusApi(
  id: number,
  trangThai: "hoat_dong" | "ngung_hoat_dong",
) {
  return request<GiaoVienItem>(`/api/giao-vien/${id}/trang-thai`, {
    method: "PATCH",
    body: JSON.stringify({ trangThai }),
  });
}
