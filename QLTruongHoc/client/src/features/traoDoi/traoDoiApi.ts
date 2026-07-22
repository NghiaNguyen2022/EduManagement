import type { TraoDoiFormInput, TraoDoiItem } from "./traoDoiTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

/**
 * Hình dạng thật server trả về — luôn nested (`traoDoi` chỉ chứa các trường vô
 * hướng, `hocSinh`/`lopHoc`/`nguoiTao`/`donVi` là các khoá anh em), không có
 * dạng phẳng nào khác. Trước đây gộp nhầm chỉ `{...row.traoDoi, donVi}`, làm
 * mất hẳn `hocSinh`/`lopHoc`/`nguoiTao` — vỡ mọi chỗ trang dùng
 * `item.hocSinh.hoTen`.
 */
type TraoDoiRowResponse = {
  traoDoi: Omit<TraoDoiItem, "hocSinh" | "lopHoc" | "nguoiTao" | "donVi">;
  hocSinh: TraoDoiItem["hocSinh"];
  lopHoc?: TraoDoiItem["lopHoc"];
  nguoiTao: TraoDoiItem["nguoiTao"];
  donVi?: TraoDoiItem["donVi"];
};

function flattenTraoDoiRow(row: TraoDoiRowResponse): TraoDoiItem {
  return {
    ...row.traoDoi,
    hocSinh: row.hocSinh,
    lopHoc: row.lopHoc,
    nguoiTao: row.nguoiTao,
    donVi: row.donVi,
  };
}

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

  return rows.map(flattenTraoDoiRow);
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
  }).then(flattenTraoDoiRow);
}
