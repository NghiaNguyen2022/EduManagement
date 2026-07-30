import type { CauHinhMauIn, CauHinhMauInFormInput } from "./mauInTypes";

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

export function getCauHinhMauInApi() {
  return request<CauHinhMauIn>("/api/cau-hinh-mau-in");
}

export function updateCauHinhMauInApi(input: CauHinhMauInFormInput) {
  return request<CauHinhMauIn>("/api/cau-hinh-mau-in", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
