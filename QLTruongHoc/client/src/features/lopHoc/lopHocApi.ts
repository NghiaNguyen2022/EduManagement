import type {
  LopHocDetail,
  LopHocFormInput,
  LopHocItem,
  TrangThaiLopHoc,
  VaiTroGiaoVienLop,
} from "./lopHocTypes";

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

export function listLopHocApi() {
  return request<LopHocItem[]>("/api/lop-hoc");
}

export function createLopHocApi(input: LopHocFormInput) {
  return request<LopHocItem>("/api/lop-hoc", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getLopHocDetailApi(id: number) {
  return request<LopHocDetail>(`/api/lop-hoc/${id}`);
}

export function updateLopHocApi(
  id: number,
  input: LopHocFormInput,
) {
  return request<LopHocItem>(`/api/lop-hoc/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setLopHocStatusApi(
  id: number,
  trangThai: TrangThaiLopHoc,
) {
  return request<LopHocItem>(`/api/lop-hoc/${id}/trang-thai`, {
    method: "PATCH",
    body: JSON.stringify({ trangThai }),
  });
}

export function assignGiaoVienApi(
  lopHocId: number,
  input: {
    giaoVienId: number;
    vaiTro: VaiTroGiaoVienLop;
    tuNgay: string;
  },
) {
  return request(`/api/lop-hoc/${lopHocId}/giao-vien`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function endGiaoVienAssignmentApi(
  lopHocId: number,
  phanCongId: number,
  denNgay: string,
) {
  return request(
    `/api/lop-hoc/${lopHocId}/giao-vien/${phanCongId}/ket-thuc`,
    {
      method: "PATCH",
      body: JSON.stringify({ denNgay }),
    },
  );
}

export function xepHocSinhVaoLopApi(
  lopHocId: number,
  input: { hocSinhId: number; ngayVaoLop: string },
) {
  return request(`/api/lop-hoc/${lopHocId}/hoc-sinh`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function chuyenLopApi(
  enrollmentId: number,
  input: {
    lopHocIdMoi: number;
    ngayChuyen: string;
    lyDo?: string;
  },
) {
  return request(
    `/api/lop-hoc/hoc-sinh/${enrollmentId}/chuyen-lop`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function ketThucXepLopApi(
  enrollmentId: number,
  input: {
    ngayRoiLop: string;
    lyDoRoiLop?: string;
    trangThai: "ngung_hoc" | "hoan_thanh";
  },
) {
  return request(`/api/lop-hoc/hoc-sinh/${enrollmentId}/ket-thuc`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
