import type { TraoDoiFormInput, TraoDoiItem } from "./traoDoiTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type TraoDoiRowResponse =
  | TraoDoiItem
  | {
      traoDoi: TraoDoiItem;
      donVi?: TraoDoiItem["donVi"];
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

export async function listTraoDoiApi(input?: {
  hocSinhId?: number | null;
  lopHocId?: number | null;
}) {
  const params = new URLSearchParams();

  if (input?.hocSinhId) {
    params.set("hocSinhId", String(input.hocSinhId));
  }

  if (input?.lopHocId) {
    params.set("lopHocId", String(input.lopHocId));
  }

  const rows = await request<TraoDoiRowResponse[]>(
    `/api/trao-doi${params.toString() ? `?${params.toString()}` : ""}`,
  );

  return rows.map((row) => ("traoDoi" in row ? { ...row.traoDoi, donVi: row.donVi } : row));
}

export function createTraoDoiApi(input: TraoDoiFormInput) {
  return request<TraoDoiRowResponse>("/api/trao-doi", {
    method: "POST",
    body: JSON.stringify({
      hocSinhId: Number(input.hocSinhId),
      lopHocId: input.lopHocId ? Number(input.lopHocId) : null,
      nguoiGuiVaiTro: input.nguoiGuiVaiTro,
      kenhLienLac: input.kenhLienLac,
      noiDung: input.noiDung,
      ketQua: input.ketQua,
    }),
  }).then((row) => ("traoDoi" in row ? { ...row.traoDoi, donVi: row.donVi } : row));
}
