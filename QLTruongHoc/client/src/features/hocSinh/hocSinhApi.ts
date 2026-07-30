import type {
  DanhGiaFormInput,
  DanhGiaItem,
  GhiDanhTrucTiepFormInput,
  GuardianFormInput,
  GuardianLinkItem,
  HocSinhDetail,
  HocSinhFormInput,
  HocSinhItem,
  PhieuNhapHocDetail,
  PhieuNhapHocItem,
  PhuHuynhItem,
  ThanhTichFormInput,
  ThanhTichItem,
  TrangThaiHocSinh,
} from "./hocSinhTypes";

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

export async function listHocSinhApi() {
  const rows =
    await request<(HocSinhItem | { hocSinh: HocSinhItem; donVi: HocSinhItem["donVi"] })[]>(
      "/api/hoc-sinh",
    );

  return rows.map((row) => ("hocSinh" in row ? { ...row.hocSinh, donVi: row.donVi } : row));
}

export function createHocSinhApi(input: HocSinhFormInput) {
  return request<HocSinhItem>("/api/hoc-sinh", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getHocSinhDetailApi(id: number) {
  return request<HocSinhDetail>(`/api/hoc-sinh/${id}`);
}

export function listHocSinhChoXepLopApi() {
  return request<HocSinhItem[]>("/api/hoc-sinh/cho-xep-lop");
}

export function ghiDanhTrucTiepApi(input: GhiDanhTrucTiepFormInput) {
  return request<HocSinhItem>("/api/hoc-sinh/ghi-danh", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function ghiNhanKetQuaTestDauVaoApi(
  id: number,
  ketQuaTestDauVao: string,
) {
  return request<HocSinhItem>(`/api/hoc-sinh/${id}/ket-qua-test`, {
    method: "PATCH",
    body: JSON.stringify({ ketQuaTestDauVao }),
  });
}

export function updateHocSinhApi(id: number, input: HocSinhFormInput) {
  return request<HocSinhItem>(`/api/hoc-sinh/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...input,
      chieuCaoCm: input.chieuCaoCm !== null ? String(input.chieuCaoCm) : null,
      canNangKg: input.canNangKg !== null ? String(input.canNangKg) : null,
    }),
  });
}

export function setHocSinhTrangThaiApi(
  id: number,
  input: {
    trangThai: TrangThaiHocSinh;
    lyDo?: string;
    ngayHieuLuc?: string;
  },
) {
  return request<HocSinhItem>(`/api/hoc-sinh/${id}/trang-thai`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export type CrossOrgGuardianInfo = {
  hoTen: string;
  maPhuHuynh: string;
  donVi: { id: number; maDonVi: string; tenDonVi: string };
};

export class CrossOrgGuardianConfirmError extends Error {
  guardianInfo: CrossOrgGuardianInfo;

  constructor(message: string, guardianInfo: CrossOrgGuardianInfo) {
    super(message);
    this.guardianInfo = guardianInfo;
  }
}

export async function addGuardianApi(
  hocSinhId: number,
  input: GuardianFormInput & { confirmCrossOrgReuse?: boolean },
) {
  const response = await fetch(`/api/hoc-sinh/${hocSinhId}/phu-huynh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<{
    link: GuardianLinkItem;
    guardian: PhuHuynhItem;
  }> & {
    needsConfirmation?: boolean;
    guardianInfo?: CrossOrgGuardianInfo;
  };

  if (!response.ok || !payload.ok) {
    if (payload.needsConfirmation && payload.guardianInfo) {
      throw new CrossOrgGuardianConfirmError(
        payload.error || "Cần xác nhận trước khi dùng chung hồ sơ.",
        payload.guardianInfo,
      );
    }

    throw new Error(payload.error || "Không thể thêm phụ huynh.");
  }

  return payload.data as { link: GuardianLinkItem; guardian: PhuHuynhItem };
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
  return request(`/api/hoc-sinh/${hocSinhId}/phu-huynh/${linkId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function createGuardianAccountApi(hocSinhId: number, linkId: number) {
  return request<{
    created: boolean;
    nguoiDungId: number;
    tenDangNhap: string | null;
    temporaryPassword: string | null;
  }>(`/api/hoc-sinh/${hocSinhId}/phu-huynh/${linkId}/tai-khoan`, { method: "POST" });
}

export function listThanhTichApi(hocSinhId: number) {
  return request<ThanhTichItem[]>(`/api/hoc-sinh/${hocSinhId}/thanh-tich`);
}

export function addThanhTichApi(hocSinhId: number, input: ThanhTichFormInput) {
  return request<ThanhTichItem>(`/api/hoc-sinh/${hocSinhId}/thanh-tich`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function removeThanhTichApi(thanhTichId: number) {
  const response = await fetch(`/api/hoc-sinh/thanh-tich/${thanhTichId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Không thể xoá thành tích.");
  }
}

export async function listDanhGiaApi(hocSinhId: number) {
  const rows = await request<
    {
      danhGia: Omit<DanhGiaItem, "lopHoc">;
      enrollmentId: number;
      lopHoc: DanhGiaItem["lopHoc"];
    }[]
  >(`/api/hoc-sinh/${hocSinhId}/danh-gia`);

  return rows.map((row) => ({ ...row.danhGia, lopHoc: row.lopHoc }));
}

export function addDanhGiaApi(hocSinhId: number, input: DanhGiaFormInput) {
  return request<DanhGiaItem>(`/api/hoc-sinh/${hocSinhId}/danh-gia`, {
    method: "POST",
    body: JSON.stringify({
      ...input,
      diemSo: input.diemSo !== null ? String(input.diemSo) : null,
    }),
  });
}

export async function removeDanhGiaApi(danhGiaId: number) {
  const response = await fetch(`/api/hoc-sinh/danh-gia/${danhGiaId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Không thể xoá kết quả học tập.");
  }
}

export function lapPhieuNhapHocApi(
  hocSinhId: number,
  input: { ngayNhapHoc: string; ghiChu?: string },
) {
  return request<PhieuNhapHocItem>(`/api/hoc-sinh/${hocSinhId}/phieu-nhap-hoc`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPhieuNhapHocDetailApi(id: number) {
  return request<PhieuNhapHocDetail>(`/api/hoc-sinh/phieu-nhap-hoc/${id}`);
}

export function listPhieuNhapHocApi(hocSinhId: number) {
  return request<PhieuNhapHocItem[]>(`/api/hoc-sinh/${hocSinhId}/phieu-nhap-hoc`);
}

export async function removeGuardianApi(hocSinhId: number, linkId: number) {
  const response = await fetch(`/api/hoc-sinh/${hocSinhId}/phu-huynh/${linkId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Không thể gỡ liên kết.");
  }
}
