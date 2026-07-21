import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createDanhMucKhoanThu,
  createKyThu,
  findDanhMucKhoanThuById,
  findDanhMucKhoanThuByMa,
  findKyThuById,
  findKyThuByMa,
  listDanhMucKhoanThuAllDonVi,
  listDanhMucKhoanThuByDonVi,
  listKyThuAllDonVi,
  listKyThuByDonVi,
  listKyThuKhoanThu,
  replaceKyThuKhoanThu,
  setDanhMucKhoanThuTrangThai,
  setKyThuTrangThai,
  updateDanhMucKhoanThu,
  updateKyThu,
} from "../db/taiChinh.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";

type LoaiKhoanThu = "hoc_phi" | "tien_an" | "dich_vu" | "tai_lieu" | "khac";
const LOAI_KHOAN_THU_HOP_LE: LoaiKhoanThu[] = [
  "hoc_phi",
  "tien_an",
  "dich_vu",
  "tai_lieu",
  "khac",
];

type LoaiKy = "thang" | "khoa_hoc" | "hoc_ky" | "dot";
const LOAI_KY_HOP_LE: LoaiKy[] = ["thang", "khoa_hoc", "hoc_ky", "dot"];

function chuanHoaSoTien(value: number | null): string | null {
  if (value === null || value === undefined) return null;

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Số tiền không hợp lệ.");
  }

  return value.toFixed(2);
}

// ---------------------------------------------------------------
// Danh mục khoản thu
// ---------------------------------------------------------------

export async function listDanhMucKhoanThu(
  donViId: number,
  loaiDonVi?: string,
) {
  if (loaiDonVi === "he_thong") {
    return listDanhMucKhoanThuAllDonVi();
  }

  return listDanhMucKhoanThuByDonVi(donViId);
}

export async function createDanhMucKhoanThuMoi(input: {
  donViId: number;
  maKhoanThu: string;
  tenKhoanThu: string;
  loaiKhoanThu: string;
  soTienMacDinh: number | null;
  batBuoc: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const maKhoanThu = input.maKhoanThu.trim().toUpperCase();
  const tenKhoanThu = input.tenKhoanThu.trim();

  if (!maKhoanThu) {
    throw new Error("Vui lòng nhập mã khoản thu.");
  }

  if (!tenKhoanThu) {
    throw new Error("Vui lòng nhập tên khoản thu.");
  }

  if (
    !LOAI_KHOAN_THU_HOP_LE.includes(input.loaiKhoanThu as LoaiKhoanThu)
  ) {
    throw new Error("Loại khoản thu không hợp lệ.");
  }

  const existed = await findDanhMucKhoanThuByMa(
    input.donViId,
    maKhoanThu,
  );

  if (existed) {
    throw new Error("Mã khoản thu đã tồn tại.");
  }

  const created = await createDanhMucKhoanThu({
    donViId: input.donViId,
    maKhoanThu,
    tenKhoanThu,
    loaiKhoanThu: input.loaiKhoanThu as LoaiKhoanThu,
    soTienMacDinh: chuanHoaSoTien(input.soTienMacDinh),
    batBuoc: input.batBuoc ? "co" : "khong",
  });

  if (!created) {
    throw new Error("Không thể tạo khoản thu.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "khoan_thu.create",
    objectType: "DanhMucKhoanThu",
    objectId: String(created.id),
    content: `Tạo khoản thu ${created.tenKhoanThu} (${created.maKhoanThu}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function updateDanhMucKhoanThuThongTin(input: {
  donViId: number;
  id: number;
  tenKhoanThu: string;
  loaiKhoanThu: string;
  soTienMacDinh: number | null;
  batBuoc: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findDanhMucKhoanThuById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy khoản thu.");
  }

  const tenKhoanThu = input.tenKhoanThu.trim();

  if (!tenKhoanThu) {
    throw new Error("Vui lòng nhập tên khoản thu.");
  }

  if (
    !LOAI_KHOAN_THU_HOP_LE.includes(input.loaiKhoanThu as LoaiKhoanThu)
  ) {
    throw new Error("Loại khoản thu không hợp lệ.");
  }

  const updated = await updateDanhMucKhoanThu({
    id: input.id,
    tenKhoanThu,
    loaiKhoanThu: input.loaiKhoanThu as LoaiKhoanThu,
    soTienMacDinh: chuanHoaSoTien(input.soTienMacDinh),
    batBuoc: input.batBuoc ? "co" : "khong",
  });

  if (!updated) {
    throw new Error("Không thể cập nhật khoản thu.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "khoan_thu.update",
    objectType: "DanhMucKhoanThu",
    objectId: String(updated.id),
    content: `Cập nhật khoản thu ${updated.tenKhoanThu} (${updated.maKhoanThu}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function setDanhMucKhoanThuStatus(input: {
  donViId: number;
  id: number;
  trangThai: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findDanhMucKhoanThuById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy khoản thu.");
  }

  if (
    input.trangThai !== "hoat_dong" &&
    input.trangThai !== "ngung_ap_dung"
  ) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  const updated = await setDanhMucKhoanThuTrangThai({
    id: input.id,
    trangThai: input.trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật trạng thái.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "khoan_thu.set_status",
    objectType: "DanhMucKhoanThu",
    objectId: String(updated.id),
    content: `Đổi trạng thái khoản thu ${updated.tenKhoanThu} sang ${input.trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

// ---------------------------------------------------------------
// Kỳ thu
// ---------------------------------------------------------------

export async function listKyThu(donViId: number, loaiDonVi?: string) {
  if (loaiDonVi === "he_thong") {
    return listKyThuAllDonVi();
  }

  return listKyThuByDonVi(donViId);
}

async function requireKyThu(donViId: number, id: number) {
  const found = await findKyThuById(donViId, id);

  if (!found) {
    throw new Error("Không tìm thấy kỳ thu.");
  }

  return found;
}

export async function getKyThuDetail(donViId: number, id: number) {
  const found = await requireKyThu(donViId, id);
  const khoanApDung = await listKyThuKhoanThu(id);

  return {
    kyThu: found,
    khoanApDung: khoanApDung.map((row) => ({
      danhMucKhoanThuId: row.apDung.danhMucKhoanThuId,
      tenKhoanThu: row.khoanThu.tenKhoanThu,
      maKhoanThu: row.khoanThu.maKhoanThu,
      loaiKhoanThu: row.khoanThu.loaiKhoanThu,
      soTien: row.apDung.soTien,
      ghiChu: row.apDung.ghiChu,
    })),
  };
}

function validateKhoangNgay(tuNgay: string, denNgay: string) {
  if (!tuNgay || !denNgay) {
    throw new Error("Vui lòng nhập đầy đủ từ ngày và đến ngày.");
  }

  if (tuNgay > denNgay) {
    throw new Error("Từ ngày phải trước hoặc bằng đến ngày.");
  }
}

export async function createKyThuMoi(input: {
  donViId: number;
  maKyThu: string;
  tenKyThu: string;
  loaiKy: string;
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const maKyThu = input.maKyThu.trim().toUpperCase();
  const tenKyThu = input.tenKyThu.trim();

  if (!maKyThu) {
    throw new Error("Vui lòng nhập mã kỳ thu.");
  }

  if (!tenKyThu) {
    throw new Error("Vui lòng nhập tên kỳ thu.");
  }

  if (!LOAI_KY_HOP_LE.includes(input.loaiKy as LoaiKy)) {
    throw new Error("Loại kỳ thu không hợp lệ.");
  }

  validateKhoangNgay(input.tuNgay, input.denNgay);

  const existed = await findKyThuByMa(input.donViId, maKyThu);

  if (existed) {
    throw new Error("Mã kỳ thu đã tồn tại.");
  }

  const created = await createKyThu({
    donViId: input.donViId,
    maKyThu,
    tenKyThu,
    loaiKy: input.loaiKy as LoaiKy,
    tuNgay: input.tuNgay,
    denNgay: input.denNgay,
    hanThanhToan: input.hanThanhToan || null,
  });

  if (!created) {
    throw new Error("Không thể tạo kỳ thu.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "ky_thu.create",
    objectType: "KyThu",
    objectId: String(created.id),
    content: `Tạo kỳ thu ${created.tenKyThu} (${created.maKyThu}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

function requireKyThuDangNhap(kyThuRow: { trangThai: string; maKyThu: string }) {
  if (kyThuRow.trangThai !== "nhap") {
    throw new Error(
      "Kỳ thu đã mở hoặc đã đóng, không thể sửa thông tin/khoản thu áp dụng.",
    );
  }
}

export async function updateKyThuThongTin(input: {
  donViId: number;
  id: number;
  tenKyThu: string;
  loaiKy: string;
  tuNgay: string;
  denNgay: string;
  hanThanhToan: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await requireKyThu(input.donViId, input.id);
  requireKyThuDangNhap(existing);

  const tenKyThu = input.tenKyThu.trim();

  if (!tenKyThu) {
    throw new Error("Vui lòng nhập tên kỳ thu.");
  }

  if (!LOAI_KY_HOP_LE.includes(input.loaiKy as LoaiKy)) {
    throw new Error("Loại kỳ thu không hợp lệ.");
  }

  validateKhoangNgay(input.tuNgay, input.denNgay);

  const updated = await updateKyThu({
    id: input.id,
    tenKyThu,
    loaiKy: input.loaiKy as LoaiKy,
    tuNgay: input.tuNgay,
    denNgay: input.denNgay,
    hanThanhToan: input.hanThanhToan || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật kỳ thu.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "ky_thu.update",
    objectType: "KyThu",
    objectId: String(updated.id),
    content: `Cập nhật kỳ thu ${updated.tenKyThu} (${updated.maKyThu}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function capNhatKhoanApDungKyThu(input: {
  donViId: number;
  id: number;
  danhSach: {
    danhMucKhoanThuId: number;
    soTien: number;
    ghiChu?: string | null;
  }[];
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await requireKyThu(input.donViId, input.id);
  requireKyThuDangNhap(existing);

  if (input.danhSach.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một khoản thu áp dụng.");
  }

  const seen = new Set<number>();

  for (const item of input.danhSach) {
    if (seen.has(item.danhMucKhoanThuId)) {
      throw new Error("Không được chọn trùng khoản thu.");
    }
    seen.add(item.danhMucKhoanThuId);

    const khoanThu = await findDanhMucKhoanThuById(
      input.donViId,
      item.danhMucKhoanThuId,
    );

    if (!khoanThu) {
      throw new Error("Có khoản thu không thuộc đơn vị hiện tại.");
    }

    if (khoanThu.trangThai !== "hoat_dong") {
      throw new Error(
        `Khoản thu "${khoanThu.tenKhoanThu}" đã ngừng áp dụng, không thể gán vào kỳ thu.`,
      );
    }
  }

  const danhSach = input.danhSach.map((item) => ({
    danhMucKhoanThuId: item.danhMucKhoanThuId,
    soTien: chuanHoaSoTien(item.soTien) ?? "0.00",
    ghiChu: item.ghiChu?.trim() || null,
  }));

  await replaceKyThuKhoanThu({
    kyThuId: input.id,
    danhSach,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "ky_thu.set_khoan_ap_dung",
    objectType: "KyThu",
    objectId: String(input.id),
    content: `Cập nhật ${danhSach.length} khoản thu áp dụng cho kỳ thu ${existing.tenKyThu}.`,
    ipAddress: input.ipAddress,
  });

  return getKyThuDetail(input.donViId, input.id);
}

export async function moKyThu(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await requireKyThu(input.donViId, input.id);
  requireKyThuDangNhap(existing);

  const khoanApDung = await listKyThuKhoanThu(input.id);

  if (khoanApDung.length === 0) {
    throw new Error(
      "Kỳ thu chưa có khoản thu áp dụng nào, không thể mở.",
    );
  }

  const updated = await setKyThuTrangThai({
    id: input.id,
    trangThai: "da_mo",
  });

  if (!updated) {
    throw new Error("Không thể mở kỳ thu.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "ky_thu.mo",
    objectType: "KyThu",
    objectId: String(updated.id),
    content: `Mở kỳ thu ${updated.tenKyThu} (${updated.maKyThu}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function dongKyThu(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await requireKyThu(input.donViId, input.id);

  if (existing.trangThai !== "da_mo") {
    throw new Error("Chỉ có thể đóng kỳ thu đang mở.");
  }

  const updated = await setKyThuTrangThai({
    id: input.id,
    trangThai: "da_dong",
  });

  if (!updated) {
    throw new Error("Không thể đóng kỳ thu.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "ky_thu.dong",
    objectType: "KyThu",
    objectId: String(updated.id),
    content: `Đóng kỳ thu ${updated.tenKyThu} (${updated.maKyThu}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}
