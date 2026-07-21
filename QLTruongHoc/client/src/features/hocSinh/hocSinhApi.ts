import type {
  GuardianFormInput,
  GuardianLinkItem,
  HocSinhDetail,
  HocSinhFormInput,
  HocSinhItem,
  PhuHuynhItem,
  TrangThaiHocSinh,
} from "./hocSinhTypes";

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

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.error || "Yêu cầu thất bại.",
    );
  }

  return payload.data as T;
}

export async function listHocSinhApi() {
  const rows = await request<
    (HocSinhItem | { hocSinh: HocSinhItem; donVi: HocSinhItem["donVi"] })[]
  >("/api/hoc-sinh");

  return rows.map((row) =>
    "hocSinh" in row ? { ...row.hocSinh, donVi: row.donVi } : row,
  );
}

export function createHocSinhApi(
  input: HocSinhFormInput,
) {
  return request<HocSinhItem>("/api/hoc-sinh", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getHocSinhDetailApi(id: number) {
  return request<HocSinhDetail>(
    `/api/hoc-sinh/${id}`,
  );
}

export function updateHocSinhApi(
  id: number,
  input: HocSinhFormInput,
) {
  return request<HocSinhItem>(
    `/api/hoc-sinh/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function setHocSinhTrangThaiApi(
  id: number,
  input: {
    trangThai: TrangThaiHocSinh;
    lyDo?: string;
    ngayHieuLuc?: string;
  },
) {
  return request<HocSinhItem>(
    `/api/hoc-sinh/${id}/trang-thai`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function addGuardianApi(
  hocSinhId: number,
  input: GuardianFormInput,
) {
  return request<{
    link: GuardianLinkItem;
    guardian: PhuHuynhItem;
  }>(`/api/hoc-sinh/${hocSinhId}/phu-huynh`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateGuardianApi(
  hocSinhId: number,
  linkId: number,
  input: {
    moiQuanHe: string;
    laLienHeChinh: boolean;
    duocDonTre: boolean;
    nhanThongBao: boolean;
    nhanThongTinHocPhi: boolean;
  },
) {
  return request(
    `/api/hoc-sinh/${hocSinhId}/phu-huynh/${linkId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function createGuardianAccountApi(
  hocSinhId: number,
  linkId: number,
) {
  return request<{
    created: boolean;
    nguoiDungId: number;
    tenDangNhap: string | null;
    temporaryPassword: string | null;
  }>(
    `/api/hoc-sinh/${hocSinhId}/phu-huynh/${linkId}/tai-khoan`,
    { method: "POST" },
  );
}

export async function removeGuardianApi(
  hocSinhId: number,
  linkId: number,
) {
  const response = await fetch(
    `/api/hoc-sinh/${hocSinhId}/phu-huynh/${linkId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const payload =
    (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.error || "Không thể gỡ liên kết.",
    );
  }
}
