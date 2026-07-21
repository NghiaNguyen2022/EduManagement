import type {
  DiemDanhRoster,
  TrangThaiDiemDanh,
} from "./diemDanhTypes";

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

export function getDiemDanhRosterApi(buoiHocId: number) {
  return request<DiemDanhRoster>(
    `/api/diem-danh/buoi-hoc/${buoiHocId}`,
  );
}

export function luuDiemDanhApi(
  buoiHocId: number,
  danhSach: {
    hocSinhId: number;
    trangThai: TrangThaiDiemDanh;
    ghiChu?: string;
    nhanXet?: string;
  }[],
) {
  return request<DiemDanhRoster>(
    `/api/diem-danh/buoi-hoc/${buoiHocId}`,
    {
      method: "POST",
      body: JSON.stringify({ danhSach }),
    },
  );
}
