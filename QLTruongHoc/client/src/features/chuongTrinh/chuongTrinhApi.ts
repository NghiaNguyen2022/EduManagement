import { fetchApp } from "../../utils/appUrl";
import type {
  ChuongTrinhFormInput,
  ChuongTrinhItem,
} from "./chuongTrinhTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
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

function toApiInput(input: ChuongTrinhFormInput) {
  return {
    tenChuongTrinh: input.tenChuongTrinh,
    capDo: input.capDo,
    tongSoBuoi: input.tongSoBuoi,
    tongSoGio:
      input.tongSoGio !== null ? String(input.tongSoGio) : null,
    moTa: input.moTa,
    coTestDauVao: input.coTestDauVao,
  };
}

export function getChuongTrinhDetailApi(id: number) {
  return request<ChuongTrinhItem>(`/api/chuong-trinh/${id}`);
}

export async function listChuongTrinhApi() {
  const rows = await request<
    (
      | ChuongTrinhItem
      | { chuongTrinh: ChuongTrinhItem; donVi: ChuongTrinhItem["donVi"] }
    )[]
  >("/api/chuong-trinh");

  return rows.map((row) =>
    "chuongTrinh" in row
      ? { ...row.chuongTrinh, donVi: row.donVi }
      : row,
  );
}

export function createChuongTrinhApi(input: ChuongTrinhFormInput) {
  return request<ChuongTrinhItem>("/api/chuong-trinh", {
    method: "POST",
    body: JSON.stringify(toApiInput(input)),
  });
}

export function updateChuongTrinhApi(id: number, input: ChuongTrinhFormInput) {
  return request<ChuongTrinhItem>(`/api/chuong-trinh/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toApiInput(input)),
  });
}

export function setChuongTrinhStatusApi(
  id: number,
  trangThai: "hoat_dong" | "ngung_hoat_dong",
) {
  return request<ChuongTrinhItem>(
    `/api/chuong-trinh/${id}/trang-thai`,
    {
      method: "PATCH",
      body: JSON.stringify({ trangThai }),
    },
  );
}
