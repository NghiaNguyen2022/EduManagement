import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createDanhMucKhoanThu,
  createKhoanPhaiThu,
  createKyThu,
  createPhieuThu,
  countPhieuThuTheoPrefix,
  findDanhMucKhoanThuById,
  findDanhMucKhoanThuByMa,
  findKhoanPhaiThuByKyThuHocSinh,
  findKhoanPhaiThuById,
  findKyThuById,
  findKyThuByMa,
  listCongNoByDonVi,
  listDanhMucKhoanThuAllDonVi,
  listDanhMucKhoanThuByDonVi,
  listHocSinhDangHocTrongLop,
  listKhoanPhaiThuByKyThu,
  listKyThuAllDonVi,
  listKyThuBaoCaoAllDonVi,
  listKyThuBaoCaoByDonVi,
  listKyThuByDonVi,
  listKyThuKhoanThu,
  listPhieuThuByKhoanPhaiThu,
  replaceKyThuKhoanThu,
  setDanhMucKhoanThuTrangThai,
  setKyThuTrangThai,
  sumCongNoByDonVi,
  sumPhieuThuTrongKhoang,
  updateDanhMucKhoanThu,
  updateKhoanPhaiThuDaThu,
  updateKhoanPhaiThuGiamTru,
  updateKyThu,
} from "../db/taiChinh.repository.js";
import { findLopHocById } from "../db/lopHoc.repository.js";
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

// ---------------------------------------------------------------
// Khoản phải thu, thu tiền, công nợ
// ---------------------------------------------------------------

type TrangThaiKhoanPhaiThu = "chua_thu" | "thu_mot_phan" | "da_thu_du";

function tinhTrangThaiKhoanPhaiThu(
  tongTien: number,
  giamTru: number,
  daThu: number,
): TrangThaiKhoanPhaiThu {
  if (daThu <= 0) return "chua_thu";

  const conLai = tongTien - giamTru - daThu;

  return conLai <= 0 ? "da_thu_du" : "thu_mot_phan";
}

function toKhoanPhaiThuView(row: {
  khoanPhaiThu: {
    id: number;
    kyThuId: number;
    hocSinhId: number;
    tongTien: string;
    giamTru: string;
    daThu: string;
    trangThai: string;
  };
  hocSinh: { id: number; maHocSinh: string; hoTen: string };
}) {
  const tongTien = Number(row.khoanPhaiThu.tongTien);
  const giamTru = Number(row.khoanPhaiThu.giamTru);
  const daThu = Number(row.khoanPhaiThu.daThu);

  return {
    id: row.khoanPhaiThu.id,
    kyThuId: row.khoanPhaiThu.kyThuId,
    hocSinh: {
      id: row.hocSinh.id,
      maHocSinh: row.hocSinh.maHocSinh,
      hoTen: row.hocSinh.hoTen,
    },
    tongTien: row.khoanPhaiThu.tongTien,
    giamTru: row.khoanPhaiThu.giamTru,
    daThu: row.khoanPhaiThu.daThu,
    conLai: (tongTien - giamTru - daThu).toFixed(2),
    trangThai: row.khoanPhaiThu.trangThai,
  };
}

export async function sinhKhoanPhaiThuChoLop(input: {
  donViId: number;
  kyThuId: number;
  lopHocId: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const kyThuFound = await requireKyThu(input.donViId, input.kyThuId);

  if (kyThuFound.trangThai !== "da_mo") {
    throw new Error(
      "Chỉ có thể sinh khoản phải thu cho kỳ thu đang mở.",
    );
  }

  const lopHoc = await findLopHocById(input.donViId, input.lopHocId);

  if (!lopHoc) {
    throw new Error("Không tìm thấy lớp học trong đơn vị hiện tại.");
  }

  const khoanApDung = await listKyThuKhoanThu(input.kyThuId);

  if (khoanApDung.length === 0) {
    throw new Error("Kỳ thu chưa có khoản thu áp dụng nào.");
  }

  const tongTienKy = khoanApDung
    .reduce((sum, item) => sum + Number(item.apDung.soTien), 0)
    .toFixed(2);

  const chiTiet = khoanApDung.map((item) => ({
    danhMucKhoanThuId: item.apDung.danhMucKhoanThuId,
    soTien: item.apDung.soTien,
  }));

  const roster = await listHocSinhDangHocTrongLop(input.lopHocId);

  let daTao = 0;
  let boQua = 0;

  for (const row of roster) {
    const existing = await findKhoanPhaiThuByKyThuHocSinh(
      input.kyThuId,
      row.hocSinh.id,
    );

    if (existing) {
      boQua += 1;
      continue;
    }

    await createKhoanPhaiThu({
      donViId: input.donViId,
      kyThuId: input.kyThuId,
      hocSinhId: row.hocSinh.id,
      tongTien: tongTienKy,
      chiTiet,
    });

    daTao += 1;
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "khoan_phai_thu.sinh_theo_lop",
    objectType: "KyThu",
    objectId: String(input.kyThuId),
    content: `Sinh khoản phải thu cho lớp ${lopHoc.tenLop} — kỳ thu ${kyThuFound.tenKyThu}: tạo mới ${daTao}, bỏ qua ${boQua} (đã có sẵn).`,
    ipAddress: input.ipAddress,
  });

  return { daTao, boQua, tongSoHocSinh: roster.length };
}

export async function listKhoanPhaiThuTheoKyThu(
  donViId: number,
  kyThuId: number,
) {
  await requireKyThu(donViId, kyThuId);

  const rows = await listKhoanPhaiThuByKyThu(kyThuId);

  return rows.map(toKhoanPhaiThuView);
}

async function requireKhoanPhaiThuTrongKyDangMo(
  donViId: number,
  khoanPhaiThuId: number,
) {
  const khoanPhaiThuFound = await findKhoanPhaiThuById(
    donViId,
    khoanPhaiThuId,
  );

  if (!khoanPhaiThuFound) {
    throw new Error("Không tìm thấy khoản phải thu.");
  }

  const kyThuFound = await requireKyThu(donViId, khoanPhaiThuFound.kyThuId);

  if (kyThuFound.trangThai !== "da_mo") {
    throw new Error(
      "Kỳ thu không còn mở, không thể miễn giảm hoặc thu tiền.",
    );
  }

  return khoanPhaiThuFound;
}

export async function capNhatGiamTru(input: {
  donViId: number;
  khoanPhaiThuId: number;
  giamTru: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const khoanPhaiThuFound = await requireKhoanPhaiThuTrongKyDangMo(
    input.donViId,
    input.khoanPhaiThuId,
  );

  const giamTru = chuanHoaSoTien(input.giamTru) ?? "0.00";
  const tongTien = Number(khoanPhaiThuFound.tongTien);
  const daThu = Number(khoanPhaiThuFound.daThu);

  if (Number(giamTru) + daThu > tongTien) {
    throw new Error(
      "Giảm trừ cộng với số đã thu không được vượt quá tổng tiền.",
    );
  }

  const trangThai = tinhTrangThaiKhoanPhaiThu(
    tongTien,
    Number(giamTru),
    daThu,
  );

  const updated = await updateKhoanPhaiThuGiamTru({
    id: input.khoanPhaiThuId,
    giamTru,
    trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật giảm trừ.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "khoan_phai_thu.mien_giam",
    objectType: "KhoanPhaiThu",
    objectId: String(updated.id),
    content: `Cập nhật giảm trừ khoản phải thu #${updated.id} thành ${giamTru}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

type PhuongThucThu = "tien_mat" | "chuyen_khoan" | "the" | "khac";
const PHUONG_THUC_HOP_LE: PhuongThucThu[] = [
  "tien_mat",
  "chuyen_khoan",
  "the",
  "khac",
];

async function sinhSoPhieuThu(donViId: number) {
  const nam = new Date().getFullYear();
  const prefix = `PT${nam}`;
  const total = await countPhieuThuTheoPrefix(donViId, prefix);

  return `${prefix}${String(total + 1).padStart(5, "0")}`;
}

export async function ghiNhanThuTien(input: {
  donViId: number;
  khoanPhaiThuId: number;
  soTien: number;
  phuongThuc: string;
  ghiChu?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const khoanPhaiThuFound = await requireKhoanPhaiThuTrongKyDangMo(
    input.donViId,
    input.khoanPhaiThuId,
  );

  if (!PHUONG_THUC_HOP_LE.includes(input.phuongThuc as PhuongThucThu)) {
    throw new Error("Phương thức thu tiền không hợp lệ.");
  }

  if (!Number.isFinite(input.soTien) || input.soTien <= 0) {
    throw new Error("Số tiền thu phải lớn hơn 0.");
  }

  const tongTien = Number(khoanPhaiThuFound.tongTien);
  const giamTru = Number(khoanPhaiThuFound.giamTru);
  const daThuHienTai = Number(khoanPhaiThuFound.daThu);
  const conLai = tongTien - giamTru - daThuHienTai;

  if (input.soTien > conLai) {
    throw new Error("Số tiền thu vượt quá số tiền còn phải thu.");
  }

  const daThuMoi = (daThuHienTai + input.soTien).toFixed(2);
  const trangThai = tinhTrangThaiKhoanPhaiThu(
    tongTien,
    giamTru,
    Number(daThuMoi),
  );

  const soPhieu = await sinhSoPhieuThu(input.donViId);

  const phieu = await createPhieuThu({
    donViId: input.donViId,
    khoanPhaiThuId: input.khoanPhaiThuId,
    hocSinhId: khoanPhaiThuFound.hocSinhId,
    soPhieu,
    soTien: input.soTien.toFixed(2),
    phuongThuc: input.phuongThuc as PhuongThucThu,
    ghiChu: input.ghiChu?.trim() || null,
    nguoiThuId: input.actorUserId,
  });

  if (!phieu) {
    throw new Error("Không thể tạo phiếu thu.");
  }

  const updatedKhoanPhaiThu = await updateKhoanPhaiThuDaThu({
    id: input.khoanPhaiThuId,
    daThu: daThuMoi,
    trangThai,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "phieu_thu.create",
    objectType: "PhieuThu",
    objectId: String(phieu.id),
    content: `Thu ${phieu.soTien} cho khoản phải thu #${input.khoanPhaiThuId} — phiếu ${phieu.soPhieu}.`,
    ipAddress: input.ipAddress,
  });

  return { phieuThu: phieu, khoanPhaiThu: updatedKhoanPhaiThu };
}

export async function listPhieuThuTheoKhoanPhaiThu(
  donViId: number,
  khoanPhaiThuId: number,
) {
  const khoanPhaiThuFound = await findKhoanPhaiThuById(
    donViId,
    khoanPhaiThuId,
  );

  if (!khoanPhaiThuFound) {
    throw new Error("Không tìm thấy khoản phải thu.");
  }

  return listPhieuThuByKhoanPhaiThu(khoanPhaiThuId);
}

export async function listCongNoToanDonVi(donViId: number) {
  const rows = await listCongNoByDonVi(donViId);

  return rows.map((row) => ({
    ...toKhoanPhaiThuView(row),
    kyThu: {
      id: row.kyThu.id,
      maKyThu: row.kyThu.maKyThu,
      tenKyThu: row.kyThu.tenKyThu,
    },
  }));
}

// ---------------------------------------------------------------
// Báo cáo tài chính
// ---------------------------------------------------------------

export async function getBaoCaoTaiChinh(input: {
  donViId: number;
  loaiDonVi?: string;
  tuNgay: string;
  denNgay: string;
}) {
  validateKhoangNgay(input.tuNgay, input.denNgay);

  const [tongThu, tongCongNo, theoKyThuRaw] = await Promise.all([
    sumPhieuThuTrongKhoang(input.donViId, input.tuNgay, input.denNgay),
    sumCongNoByDonVi(input.donViId),
    input.loaiDonVi === "he_thong"
      ? listKyThuBaoCaoAllDonVi()
      : listKyThuBaoCaoByDonVi(input.donViId),
  ]);

  const theoKyThu = theoKyThuRaw.map((row) => {
    const phaiThu = Number(row.phaiThu);
    const daThu = Number(row.daThu);

    return {
      kyThu: {
        id: row.kyThu.id,
        maKyThu: row.kyThu.maKyThu,
        tenKyThu: row.kyThu.tenKyThu,
        trangThai: row.kyThu.trangThai,
      },
      donVi: "donVi" in row ? row.donVi : undefined,
      phaiThu: phaiThu.toFixed(2),
      daThu: daThu.toFixed(2),
      conLai: (phaiThu - daThu).toFixed(2),
    };
  });

  return {
    tongThu: tongThu.tongThu,
    soPhieuThu: tongThu.soPhieuThu,
    tongCongNo: tongCongNo.tongCongNo,
    theoKyThu,
  };
}
