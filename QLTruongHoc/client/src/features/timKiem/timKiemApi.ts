import type { GiaoVienItem } from "../giaoVien/giaoVienTypes";
import type { HocSinhItem } from "../hocSinh/hocSinhTypes";
import type { LopHocItem } from "../lopHoc/lopHocTypes";

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

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || "Yêu cầu thất bại.");
  }

  return payload.data;
}

type DonViRef = { id: number; maDonVi: string; tenDonVi: string };

export type TimKiemResult = {
  hocSinh: HocSinhItem[];
  giaoVien: GiaoVienItem[];
  lopHoc: LopHocItem[];
};

export async function searchAllDonViApi(keyword: string): Promise<TimKiemResult> {
  const raw = await request<{
    hocSinh: { hocSinh: HocSinhItem; donVi: DonViRef }[];
    giaoVien: { giaoVien: GiaoVienItem; donVi: DonViRef }[];
    lopHoc: { lopHoc: LopHocItem; donVi: DonViRef }[];
  }>(`/api/tim-kiem?q=${encodeURIComponent(keyword)}`);

  return {
    hocSinh: raw.hocSinh.map((row) => ({ ...row.hocSinh, donVi: row.donVi })),
    giaoVien: raw.giaoVien.map((row) => ({ ...row.giaoVien, donVi: row.donVi })),
    lopHoc: raw.lopHoc.map((row) => ({ ...row.lopHoc, donVi: row.donVi })),
  };
}
