import type {
  BaoGiangFormInput,
  BaoGiangItem,
} from "./baoGiangTypes";

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

export function getBaoGiangApi(buoiHocId: number) {
  return request<BaoGiangItem>(
    `/api/bao-giang/buoi-hoc/${buoiHocId}`,
  );
}

export function luuBaoGiangApi(
  buoiHocId: number,
  input: BaoGiangFormInput,
) {
  return request<BaoGiangItem>(
    `/api/bao-giang/buoi-hoc/${buoiHocId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}
