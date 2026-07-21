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

function toApiInput(input: ChuongTrinhFormInput) {
  return {
    maChuongTrinh: input.maChuongTrinh,
    tenChuongTrinh: input.tenChuongTrinh,
    capDo: input.capDo,
    tongSoBuoi: input.tongSoBuoi,
    tongSoGio:
      input.tongSoGio !== null ? String(input.tongSoGio) : null,
    moTa: input.moTa,
  };
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

export function updateChuongTrinhApi(
  id: number,
  input: Omit<ChuongTrinhFormInput, "maChuongTrinh">,
) {
  return request<ChuongTrinhItem>(`/api/chuong-trinh/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toApiInput({ ...input, maChuongTrinh: "" })),
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
