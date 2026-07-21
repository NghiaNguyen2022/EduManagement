import type {
  DanhMucKhoanThuFormInput,
  DanhMucKhoanThuItem,
  KyThuDetail,
  KyThuFormInput,
  KyThuItem,
} from "./taiChinhTypes";

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

// ---------------------------------------------------------------
// Danh mục khoản thu
// ---------------------------------------------------------------

export async function listDanhMucKhoanThuApi() {
  const rows = await request<
    (
      | DanhMucKhoanThuItem
      | { khoanThu: DanhMucKhoanThuItem; donVi: DanhMucKhoanThuItem["donVi"] }
    )[]
  >("/api/tai-chinh/khoan-thu");

  return rows.map((row) =>
    "khoanThu" in row ? { ...row.khoanThu, donVi: row.donVi } : row,
  );
}

export function createDanhMucKhoanThuApi(
  input: DanhMucKhoanThuFormInput,
) {
  return request<DanhMucKhoanThuItem>("/api/tai-chinh/khoan-thu", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDanhMucKhoanThuApi(
  id: number,
  input: Omit<DanhMucKhoanThuFormInput, "maKhoanThu">,
) {
  return request<DanhMucKhoanThuItem>(
    `/api/tai-chinh/khoan-thu/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function setDanhMucKhoanThuStatusApi(
  id: number,
  trangThai: "hoat_dong" | "ngung_ap_dung",
) {
  return request<DanhMucKhoanThuItem>(
    `/api/tai-chinh/khoan-thu/${id}/trang-thai`,
    {
      method: "PATCH",
      body: JSON.stringify({ trangThai }),
    },
  );
}

// ---------------------------------------------------------------
// Kỳ thu
// ---------------------------------------------------------------

export async function listKyThuApi() {
  const rows = await request<
    (KyThuItem | { kyThu: KyThuItem; donVi: KyThuItem["donVi"] })[]
  >("/api/tai-chinh/ky-thu");

  return rows.map((row) =>
    "kyThu" in row ? { ...row.kyThu, donVi: row.donVi } : row,
  );
}

export function getKyThuDetailApi(id: number) {
  return request<KyThuDetail>(`/api/tai-chinh/ky-thu/${id}`);
}

export function createKyThuApi(input: KyThuFormInput) {
  return request<KyThuItem>("/api/tai-chinh/ky-thu", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      hanThanhToan: input.hanThanhToan || null,
    }),
  });
}

export function updateKyThuApi(
  id: number,
  input: Omit<KyThuFormInput, "maKyThu">,
) {
  return request<KyThuItem>(`/api/tai-chinh/ky-thu/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...input,
      hanThanhToan: input.hanThanhToan || null,
    }),
  });
}

export function setKhoanApDungKyThuApi(
  id: number,
  danhSach: { danhMucKhoanThuId: number; soTien: number; ghiChu?: string }[],
) {
  return request<KyThuDetail>(`/api/tai-chinh/ky-thu/${id}/khoan-thu`, {
    method: "PUT",
    body: JSON.stringify({ danhSach }),
  });
}

export function moKyThuApi(id: number) {
  return request<KyThuItem>(`/api/tai-chinh/ky-thu/${id}/mo`, {
    method: "PATCH",
  });
}

export function dongKyThuApi(id: number) {
  return request<KyThuItem>(`/api/tai-chinh/ky-thu/${id}/dong`, {
    method: "PATCH",
  });
}
