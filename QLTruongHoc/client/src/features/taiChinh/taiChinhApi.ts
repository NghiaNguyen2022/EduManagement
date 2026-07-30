import { fetchApp } from "../../utils/appUrl";
import type {
  BaoCaoTaiChinh,
  CauHinhTaiChinhDonVi,
  ChiPhiItem,
  DanhMucChiPhiItem,
  DanhMucKhoanThuFormInput,
  DanhMucKhoanThuItem,
  DieuChinhFormInput,
  DieuChinhItem,
  DieuChinhListItem,
  KhoanPhaiThuItem,
  KyThuDetail,
  KyThuFormInput,
  KyThuItem,
  LoaiDeXuatChi,
  PhieuThuDetail,
  PhieuThuItem,
  SinhKhoanPhaiThuResult,
  TrangThaiChiPhi,
  TrangThaiDieuChinh,
} from "./taiChinhTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetchApp(url, {
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
    (DanhMucKhoanThuItem | { khoanThu: DanhMucKhoanThuItem; donVi: DanhMucKhoanThuItem["donVi"] })[]
  >("/api/tai-chinh/khoan-thu");

  return rows.map((row) => ("khoanThu" in row ? { ...row.khoanThu, donVi: row.donVi } : row));
}

export function createDanhMucKhoanThuApi(input: DanhMucKhoanThuFormInput) {
  return request<DanhMucKhoanThuItem>("/api/tai-chinh/khoan-thu", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDanhMucKhoanThuApi(id: number, input: DanhMucKhoanThuFormInput) {
  return request<DanhMucKhoanThuItem>(`/api/tai-chinh/khoan-thu/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setDanhMucKhoanThuStatusApi(id: number, trangThai: "hoat_dong" | "ngung_ap_dung") {
  return request<DanhMucKhoanThuItem>(`/api/tai-chinh/khoan-thu/${id}/trang-thai`, {
    method: "PATCH",
    body: JSON.stringify({ trangThai }),
  });
}

// ---------------------------------------------------------------
// Kỳ thu
// ---------------------------------------------------------------

export async function listKyThuApi() {
  const rows =
    await request<(KyThuItem | { kyThu: KyThuItem; donVi: KyThuItem["donVi"] })[]>(
      "/api/tai-chinh/ky-thu",
    );

  return rows.map((row) => ("kyThu" in row ? { ...row.kyThu, donVi: row.donVi } : row));
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

export function updateKyThuApi(id: number, input: KyThuFormInput) {
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

// ---------------------------------------------------------------
// Khoản phải thu, thu tiền, công nợ
// ---------------------------------------------------------------

export function sinhKhoanPhaiThuApi(kyThuId: number, lopHocId: number) {
  return request<SinhKhoanPhaiThuResult>(`/api/tai-chinh/ky-thu/${kyThuId}/sinh-khoan-phai-thu`, {
    method: "POST",
    body: JSON.stringify({ lopHocId }),
  });
}

export function listKhoanPhaiThuApi(kyThuId: number) {
  return request<KhoanPhaiThuItem[]>(`/api/tai-chinh/ky-thu/${kyThuId}/khoan-phai-thu`);
}

export function capNhatGiamTruApi(khoanPhaiThuId: number, giamTru: number) {
  return request<KhoanPhaiThuItem>(`/api/tai-chinh/khoan-phai-thu/${khoanPhaiThuId}/giam-tru`, {
    method: "PATCH",
    body: JSON.stringify({ giamTru }),
  });
}

export function thuTienApi(
  khoanPhaiThuId: number,
  input: { soTien: number; phuongThuc: string; ghiChu?: string; ngayThu?: string },
) {
  return request<{ phieuThu: PhieuThuItem; khoanPhaiThu: KhoanPhaiThuItem }>(
    `/api/tai-chinh/khoan-phai-thu/${khoanPhaiThuId}/thu-tien`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function listPhieuThuApi(khoanPhaiThuId: number) {
  return request<PhieuThuItem[]>(`/api/tai-chinh/khoan-phai-thu/${khoanPhaiThuId}/phieu-thu`);
}

export function listCongNoApi() {
  return request<KhoanPhaiThuItem[]>("/api/tai-chinh/cong-no");
}

export function getBaoCaoTaiChinhApi(tuNgay: string, denNgay: string) {
  const params = new URLSearchParams({ tuNgay, denNgay });
  return request<BaoCaoTaiChinh>(`/api/tai-chinh/bao-cao?${params}`);
}

export function getPhieuThuDetailApi(id: number) {
  return request<PhieuThuDetail>(`/api/tai-chinh/phieu-thu/${id}`);
}

export function taoYeuCauDieuChinhApi(khoanPhaiThuId: number, input: DieuChinhFormInput) {
  return request<DieuChinhItem>(`/api/tai-chinh/khoan-phai-thu/${khoanPhaiThuId}/dieu-chinh`, {
    method: "POST",
    body: JSON.stringify({
      loaiDieuChinh: input.loaiDieuChinh,
      khoanPhaiThuDichId: input.khoanPhaiThuDichId ? Number(input.khoanPhaiThuDichId) : null,
      soTien: input.soTien,
      lyDo: input.lyDo,
    }),
  });
}

export function listDieuChinhApi(khoanPhaiThuId: number) {
  return request<DieuChinhItem[]>(`/api/tai-chinh/khoan-phai-thu/${khoanPhaiThuId}/dieu-chinh`);
}

export function listYeuCauDieuChinhApi(trangThai?: TrangThaiDieuChinh) {
  const params = trangThai ? `?trangThai=${trangThai}` : "";
  return request<DieuChinhListItem[]>(`/api/tai-chinh/dieu-chinh${params}`);
}

// ---------------------------------------------------------------
// Chi phí
// ---------------------------------------------------------------

export function listDanhMucChiPhiApi() {
  return request<DanhMucChiPhiItem[]>("/api/tai-chinh/danh-muc-chi-phi");
}

export function createDanhMucChiPhiApi(input: {
  tenChiPhi: string;
  loaiChiPhi: string;
}) {
  return request<DanhMucChiPhiItem>("/api/tai-chinh/danh-muc-chi-phi", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function setDanhMucChiPhiStatusApi(id: number, trangThai: "hoat_dong" | "ngung_ap_dung") {
  return request<DanhMucChiPhiItem>(`/api/tai-chinh/danh-muc-chi-phi/${id}/trang-thai`, {
    method: "POST",
    body: JSON.stringify({ trangThai }),
  });
}

export function listDanhMucChiPhiChoDuyetApi() {
  return request<DanhMucChiPhiItem[]>("/api/tai-chinh/danh-muc-chi-phi/cho-duyet");
}

export function duyetDanhMucChiPhiApi(
  id: number,
  input: { quyetDinh: "duyet" | "tu_choi"; ghiChuDuyet?: string },
) {
  return request<DanhMucChiPhiItem>(`/api/tai-chinh/danh-muc-chi-phi/${id}/duyet`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCauHinhTaiChinhDonViApi() {
  return request<CauHinhTaiChinhDonVi>("/api/tai-chinh/cau-hinh-don-vi");
}

export function updateCauHinhTaiChinhDonViApi(input: {
  duyetDanhMucChiPhi: boolean;
  duyetChiDinhKy: boolean;
  duyetChiDotXuat: boolean;
}) {
  return request<CauHinhTaiChinhDonVi>("/api/tai-chinh/cau-hinh-don-vi", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listChiPhiApi(params?: {
  tuNgay?: string;
  denNgay?: string;
  trangThai?: TrangThaiChiPhi;
}) {
  const query = new URLSearchParams();
  if (params?.tuNgay) query.set("tuNgay", params.tuNgay);
  if (params?.denNgay) query.set("denNgay", params.denNgay);
  if (params?.trangThai) query.set("trangThai", params.trangThai);
  const qs = query.toString();

  return request<ChiPhiItem[]>(`/api/tai-chinh/chi-phi${qs ? `?${qs}` : ""}`);
}

export function createChiPhiApi(input: {
  danhMucChiPhiId: number;
  soTien: number;
  ngayChi: string;
  moTa?: string;
  loaiDeXuat?: LoaiDeXuatChi;
}) {
  return request<Omit<ChiPhiItem, "danhMuc" | "donVi" | "nguoiTao" | "nguoiDuyet">>(
    "/api/tai-chinh/chi-phi",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function duyetChiPhiApi(
  chiPhiId: number,
  input: { quyetDinh: "duyet" | "tu_choi"; ghiChuDuyet?: string },
) {
  return request<Omit<ChiPhiItem, "danhMuc" | "donVi" | "nguoiTao" | "nguoiDuyet">>(
    `/api/tai-chinh/chi-phi/${chiPhiId}/duyet`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function duyetDieuChinhApi(
  dieuChinhId: number,
  input: { quyetDinh: "duyet" | "tu_choi"; ghiChuDuyet?: string },
) {
  return request<DieuChinhItem>(`/api/tai-chinh/dieu-chinh/${dieuChinhId}/duyet`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
