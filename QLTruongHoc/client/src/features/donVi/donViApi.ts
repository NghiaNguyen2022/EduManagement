import type {
  DonViFormInput,
  DonViItem,
  TrangThaiDonVi,
} from "./donViTypes";

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

  const payload =
    (await response.json()) as ApiResponse<T>;

  if (
    !response.ok ||
    !payload.ok ||
    payload.data === undefined
  ) {
    throw new Error(
      payload.error || "Yêu cầu thất bại.",
    );
  }

  return payload.data;
}

export function listDonViApi() {
  return request<DonViItem[]>("/api/don-vi");
}

export function getDonViDetailApi(id: number) {
  return request<DonViItem>(`/api/don-vi/${id}`);
}

export function createDonViApi(input: DonViFormInput) {
  return request<DonViItem>("/api/don-vi", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDonViApi(
  id: number,
  input: Omit<DonViFormInput, "maDonVi">,
) {
  return request<DonViItem>(`/api/don-vi/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setDonViStatusApi(
  id: number,
  trangThai: TrangThaiDonVi,
) {
  return request<DonViItem>(
    `/api/don-vi/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ trangThai }),
    },
  );
}
