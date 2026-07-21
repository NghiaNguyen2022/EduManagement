import type {
  BuoiHocItem,
  LichHocFormInput,
  LichHocItem,
  ThoiKhoaBieuItem,
  TrangThaiBuoiHoc,
} from "./lichHocTypes";

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

export function listLichHocApi(lopHocId: number) {
  return request<LichHocItem[]>(`/api/lop-hoc/${lopHocId}/lich-hoc`);
}

export function createLichHocApi(
  lopHocId: number,
  input: LichHocFormInput,
) {
  return request<LichHocItem[]>(`/api/lop-hoc/${lopHocId}/lich-hoc`, {
    method: "POST",
    body: JSON.stringify({
      ...input,
      giaoVienId: input.giaoVienId || null,
      ngayApDungDen: input.ngayApDungDen || null,
    }),
  });
}

export function ngungLichHocApi(lichHocId: number) {
  return request<LichHocItem>(
    `/api/lop-hoc/lich-hoc/${lichHocId}/ngung`,
    { method: "PATCH" },
  );
}

export function sinhBuoiHocApi(lichHocId: number, denNgay: string) {
  return request<{ created: number; ngayHocList?: string[] }>(
    `/api/lop-hoc/lich-hoc/${lichHocId}/sinh-buoi-hoc`,
    {
      method: "POST",
      body: JSON.stringify({ denNgay }),
    },
  );
}

export function listBuoiHocApi(
  lopHocId: number,
  params?: { tuNgay?: string; denNgay?: string },
) {
  const query = new URLSearchParams();

  if (params?.tuNgay) query.set("tuNgay", params.tuNgay);
  if (params?.denNgay) query.set("denNgay", params.denNgay);

  const qs = query.toString();

  return request<BuoiHocItem[]>(
    `/api/lop-hoc/${lopHocId}/buoi-hoc${qs ? `?${qs}` : ""}`,
  );
}

export function taoBuoiHocBuApi(
  lopHocId: number,
  input: {
    ngayHoc: string;
    gioBatDau: string;
    gioKetThuc: string;
    phongHoc: string;
    giaoVienId: number | null;
    ghiChu: string;
  },
) {
  return request<void>(`/api/lop-hoc/${lopHocId}/buoi-hoc/bu`, {
    method: "POST",
    body: JSON.stringify({
      ...input,
      phongHoc: input.phongHoc || null,
      giaoVienId: input.giaoVienId || null,
      ghiChu: input.ghiChu || null,
    }),
  });
}

export function setBuoiHocTrangThaiApi(
  buoiHocId: number,
  trangThai: TrangThaiBuoiHoc,
  ghiChu?: string,
) {
  return request<BuoiHocItem>(
    `/api/lop-hoc/buoi-hoc/${buoiHocId}/trang-thai`,
    {
      method: "PATCH",
      body: JSON.stringify({ trangThai, ghiChu: ghiChu || null }),
    },
  );
}

export function listThoiKhoaBieuApi(params: {
  tuNgay: string;
  denNgay: string;
  giaoVienId?: number;
}) {
  const query = new URLSearchParams({
    tuNgay: params.tuNgay,
    denNgay: params.denNgay,
  });

  if (params.giaoVienId) {
    query.set("giaoVienId", String(params.giaoVienId));
  }

  return request<ThoiKhoaBieuItem[]>(
    `/api/thoi-khoa-bieu?${query.toString()}`,
  );
}
