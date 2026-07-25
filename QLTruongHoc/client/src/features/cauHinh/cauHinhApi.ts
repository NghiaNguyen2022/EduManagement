import type {
  CauHinhHeThongFormInput,
  CauHinhHeThongItem,
} from "./cauHinhTypes";

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

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || "Yêu cầu thất bại.");
  }

  return payload.data;
}

export function getCauHinhHeThongApi() {
  return request<CauHinhHeThongItem>("/api/cau-hinh-he-thong");
}

export function updateCauHinhHeThongApi(input: CauHinhHeThongFormInput) {
  return request<CauHinhHeThongItem>("/api/cau-hinh-he-thong", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
