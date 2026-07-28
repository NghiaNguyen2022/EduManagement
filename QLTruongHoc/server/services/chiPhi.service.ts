import { createAuditLog } from "../db/audit.repository.js";
import {
  countDanhMucChiPhiChoDuyet,
  countDanhMucChiPhiTheoMaPrefix,
  createChiPhi,
  createDanhMucChiPhi,
  findChiPhiById,
  findDanhMucChiPhiById,
  listChiPhiAllDonVi,
  listChiPhiByDonVi,
  listDanhMucChiPhiByDonVi,
  listDanhMucChiPhiChoDuyet,
  setDanhMucChiPhiTrangThai,
  sumChiPhiAllDonViTrongKhoang,
  sumChiPhiTrongKhoang,
  updateChiPhiQuyetDinh,
  updateDanhMucChiPhiQuyetDinh,
} from "../db/chiPhi.repository.js";
import { getCauHinhTaiChinhDonVi } from "../db/taiChinh.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";
import { notifyNguoiDung, notifyTheoQuyen } from "./thongBaoSuKien.service.js";

type LoaiChiPhi = "luong" | "mat_bang" | "dien_nuoc" | "vat_tu" | "marketing" | "khac";
const LOAI_CHI_PHI_HOP_LE: LoaiChiPhi[] = [
  "luong",
  "mat_bang",
  "dien_nuoc",
  "vat_tu",
  "marketing",
  "khac",
];

export async function listDanhMucChiPhi(donViId: number) {
  return listDanhMucChiPhiByDonVi(donViId);
}

// Mã do hệ thống tự sinh (CP<số thứ tự>) — người dùng không nhập tay, tránh
// trùng/đặt mã tuỳ tiện. Xem docs/analysis/MA_TU_SINH.md.
async function sinhMaChiPhi(donViId: number) {
  const total = await countDanhMucChiPhiTheoMaPrefix(donViId, "CP");
  return `CP${String(total + 1).padStart(3, "0")}`;
}

export async function createDanhMucChiPhiMoi(input: {
  donViId: number;
  tenChiPhi: string;
  loaiChiPhi: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const tenChiPhi = input.tenChiPhi.trim();

  if (!tenChiPhi) {
    throw new Error("Vui lòng nhập tên chi phí.");
  }

  if (!LOAI_CHI_PHI_HOP_LE.includes(input.loaiChiPhi as LoaiChiPhi)) {
    throw new Error("Loại chi phí không hợp lệ.");
  }

  const maChiPhi = await sinhMaChiPhi(input.donViId);

  // Đơn vị có thể cấu hình bỏ qua duyệt danh mục (CauHinhTaiChinhDonVi) —
  // xem docs/analysis/CHI_PHI_CAU_HINH_DUYET.md.
  const cauHinh = await getCauHinhTaiChinhDonVi(input.donViId);
  const trangThaiDuyet = cauHinh.duyetDanhMucChiPhi ? "cho_duyet" : "khong_can_duyet";

  const created = await createDanhMucChiPhi({
    donViId: input.donViId,
    maChiPhi,
    tenChiPhi,
    loaiChiPhi: input.loaiChiPhi as LoaiChiPhi,
    trangThaiDuyet,
    nguoiTaoId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể tạo danh mục chi phí.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "danh_muc_chi_phi.create",
    objectType: "DanhMucChiPhi",
    objectId: String(created.id),
    content: `Tạo danh mục chi phí ${created.maChiPhi} — ${created.tenChiPhi}${
      trangThaiDuyet === "cho_duyet" ? " — chờ quản lý đơn vị duyệt" : ""
    }.`,
    ipAddress: input.ipAddress,
  });

  if (trangThaiDuyet === "cho_duyet") {
    await notifyTheoQuyen({
      donViId: input.donViId,
      maQuyen: "tai_chinh.duyet",
      loaiTruNguoiDungId: input.actorUserId,
      loaiSuKien: "danh_muc_chi_phi.cho_duyet",
      tieuDe: "Danh mục chi phí chờ duyệt",
      noiDung: `Danh mục chi phí ${created.maChiPhi} — ${created.tenChiPhi} vừa được tạo, đang chờ bạn duyệt.`,
      duongDan: "/finance/chi-phi",
    });
  }

  return created;
}

/**
 * Duyệt/từ chối một danh mục chi phí mới — chỉ cần khi đơn vị bật cấu hình
 * `duyetDanhMucChiPhi`. Người duyệt bắt buộc khác người lập, mirror
 * `duyetChiPhi`.
 */
export async function duyetDanhMucChiPhi(input: {
  donViId: number;
  id: number;
  quyetDinh: "duyet" | "tu_choi";
  ghiChuDuyet?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findDanhMucChiPhiById(input.donViId, input.id);

  if (!found) {
    throw new Error("Không tìm thấy danh mục chi phí.");
  }

  if (found.trangThaiDuyet !== "cho_duyet") {
    throw new Error("Danh mục này đã được xử lý hoặc không cần duyệt.");
  }

  if (found.nguoiTaoId === input.actorUserId) {
    throw new Error("Người duyệt phải khác người lập danh mục.");
  }

  const updated = await updateDanhMucChiPhiQuyetDinh({
    id: input.id,
    trangThaiDuyet: input.quyetDinh === "duyet" ? "da_duyet" : "tu_choi",
    nguoiDuyetId: input.actorUserId,
    ghiChuDuyet: input.ghiChuDuyet?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật danh mục chi phí.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: input.quyetDinh === "duyet" ? "danh_muc_chi_phi.approve" : "danh_muc_chi_phi.reject",
    objectType: "DanhMucChiPhi",
    objectId: String(input.id),
    content: `${input.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"} danh mục chi phí ${found.maChiPhi}.`,
    ipAddress: input.ipAddress,
  });

  if (found.nguoiTaoId) {
    await notifyNguoiDung({
      donViId: input.donViId,
      nguoiNhanId: found.nguoiTaoId,
      loaiSuKien: input.quyetDinh === "duyet" ? "danh_muc_chi_phi.da_duyet" : "danh_muc_chi_phi.tu_choi",
      tieuDe: input.quyetDinh === "duyet" ? "Danh mục chi phí đã được duyệt" : "Danh mục chi phí bị từ chối",
      noiDung: `Danh mục chi phí ${found.maChiPhi} đã ${input.quyetDinh === "duyet" ? "được duyệt" : "bị từ chối"}.`,
      duongDan: "/finance/chi-phi",
    });
  }

  return updated;
}

export async function getDanhMucChiPhiChoDuyet(donViId: number) {
  return listDanhMucChiPhiChoDuyet(donViId);
}

export async function getCountDanhMucChiPhiChoDuyet(donViId: number) {
  return countDanhMucChiPhiChoDuyet(donViId);
}

export async function setDanhMucChiPhiStatus(input: {
  donViId: number;
  id: number;
  trangThai: "hoat_dong" | "ngung_ap_dung";
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findDanhMucChiPhiById(input.donViId, input.id);

  if (!found) {
    throw new Error("Không tìm thấy danh mục chi phí.");
  }

  const updated = await setDanhMucChiPhiTrangThai({
    id: input.id,
    donViId: input.donViId,
    trangThai: input.trangThai,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "danh_muc_chi_phi.update_status",
    objectType: "DanhMucChiPhi",
    objectId: String(input.id),
    content: `Đổi trạng thái danh mục chi phí ${found.maChiPhi} sang ${input.trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

/**
 * Tạo một đề xuất chi — chờ duyệt (`tai_chinh.duyet`, một actor KHÁC người
 * lập) trước khi tính vào "Tổng chi"/"Lãi lỗ ròng". Trước 2026-07-27 hàm này
 * ghi nhận chi phí trực tiếp (không duyệt) — đảo lại theo phản hồi người
 * dùng: chi phí là tiền CHI RA (dịch vụ, mua sắm...) nên cần duyệt TRƯỚC,
 * không phải sau — xem docs/analysis/QUAN_LY_DON_VI_UX_VONG_2.md mục 3.2.
 */
export async function ghiNhanChiPhi(input: {
  donViId: number;
  danhMucChiPhiId: number;
  soTien: number;
  ngayChi: string;
  moTa?: string | null;
  loaiDeXuat?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const danhMuc = await findDanhMucChiPhiById(input.donViId, input.danhMucChiPhiId);

  if (!danhMuc) {
    throw new Error("Không tìm thấy danh mục chi phí.");
  }

  if (!Number.isFinite(input.soTien) || input.soTien <= 0) {
    throw new Error("Số tiền chi phải lớn hơn 0.");
  }

  if (!input.ngayChi) {
    throw new Error("Vui lòng chọn ngày chi.");
  }

  const loaiDeXuat = input.loaiDeXuat === "dot_xuat" ? "dot_xuat" : "dinh_ky";

  // Đơn vị có thể cấu hình bỏ qua duyệt riêng cho từng loại đề xuất
  // (CauHinhTaiChinhDonVi.duyetChiDinhKy/duyetChiDotXuat) — xem
  // docs/analysis/CHI_PHI_CAU_HINH_DUYET.md.
  const cauHinh = await getCauHinhTaiChinhDonVi(input.donViId);
  const canDuyet =
    loaiDeXuat === "dot_xuat" ? cauHinh.duyetChiDotXuat : cauHinh.duyetChiDinhKy;
  const trangThai = canDuyet ? "cho_duyet" : "da_duyet";

  const created = await createChiPhi({
    donViId: input.donViId,
    danhMucChiPhiId: input.danhMucChiPhiId,
    soTien: input.soTien.toFixed(2),
    ngayChi: input.ngayChi,
    moTa: input.moTa?.trim() || null,
    loaiDeXuat,
    trangThai,
    nguoiTaoId: input.actorUserId,
  });

  if (!created) {
    throw new Error("Không thể tạo đề xuất chi.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "chi_phi.create",
    objectType: "ChiPhi",
    objectId: String(created.id),
    content: `Tạo đề xuất chi ${loaiDeXuat === "dot_xuat" ? "đột xuất" : "định kỳ"} ${danhMuc.tenChiPhi}: ${created.soTien} ngày ${created.ngayChi}${
      trangThai === "cho_duyet" ? " — chờ duyệt" : " — đơn vị không yêu cầu duyệt"
    }.`,
    ipAddress: input.ipAddress,
  });

  if (trangThai === "cho_duyet") {
    await notifyTheoQuyen({
      donViId: input.donViId,
      maQuyen: "tai_chinh.duyet",
      loaiTruNguoiDungId: input.actorUserId,
      loaiSuKien: "chi_phi.cho_duyet",
      tieuDe: "Đề xuất chi chờ duyệt",
      noiDung: `Đề xuất chi ${loaiDeXuat === "dot_xuat" ? "đột xuất" : "định kỳ"} ${danhMuc.tenChiPhi} (${created.soTien}) đang chờ bạn duyệt.`,
      duongDan: "/finance/chi-phi",
    });
  }

  return created;
}

/**
 * Duyệt/từ chối một đề xuất chi. Người duyệt bắt buộc khác người lập —
 * mirror đúng quy tắc `duyetDieuChinh` (H08).
 */
export async function duyetChiPhi(input: {
  donViId: number;
  chiPhiId: number;
  quyetDinh: "duyet" | "tu_choi";
  ghiChuDuyet?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findChiPhiById(input.donViId, input.chiPhiId);

  if (!found) {
    throw new Error("Không tìm thấy đề xuất chi.");
  }

  if (found.trangThai !== "cho_duyet") {
    throw new Error("Đề xuất chi này đã được xử lý.");
  }

  if (found.nguoiTaoId === input.actorUserId) {
    throw new Error("Người duyệt phải khác người lập đề xuất.");
  }

  const updated = await updateChiPhiQuyetDinh({
    id: input.chiPhiId,
    trangThai: input.quyetDinh === "duyet" ? "da_duyet" : "tu_choi",
    nguoiDuyetId: input.actorUserId,
    ghiChuDuyet: input.ghiChuDuyet?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật đề xuất chi.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: input.quyetDinh === "duyet" ? "chi_phi.approve" : "chi_phi.reject",
    objectType: "ChiPhi",
    objectId: String(input.chiPhiId),
    content: `${input.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"} đề xuất chi #${input.chiPhiId}: ${found.soTien} ngày ${found.ngayChi}.`,
    ipAddress: input.ipAddress,
  });

  await notifyNguoiDung({
    donViId: input.donViId,
    nguoiNhanId: found.nguoiTaoId,
    loaiSuKien: input.quyetDinh === "duyet" ? "chi_phi.da_duyet" : "chi_phi.tu_choi",
    tieuDe: input.quyetDinh === "duyet" ? "Đề xuất chi đã được duyệt" : "Đề xuất chi bị từ chối",
    noiDung: `Đề xuất chi #${input.chiPhiId} (${found.soTien}, ngày ${found.ngayChi}) đã ${input.quyetDinh === "duyet" ? "được duyệt" : "bị từ chối"}.`,
    duongDan: "/finance/chi-phi",
  });

  return updated;
}

/**
 * Danh sách chi phí — đơn vị hệ thống (kế toán tổng) xem gộp toàn hệ thống,
 * giống các màn "xem gộp" khác (kỳ thu, công nợ...).
 */
export async function listChiPhi(input: {
  donViId: number;
  loaiDonVi?: string;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: "cho_duyet" | "da_duyet" | "tu_choi";
}) {
  return input.loaiDonVi === "he_thong"
    ? listChiPhiAllDonVi({ tuNgay: input.tuNgay, denNgay: input.denNgay, trangThai: input.trangThai })
    : listChiPhiByDonVi({
        donViId: input.donViId,
        tuNgay: input.tuNgay,
        denNgay: input.denNgay,
        trangThai: input.trangThai,
      });
}

/** Tổng chi trong khoảng ngày — dùng cho báo cáo tài chính (lãi/lỗ ròng). */
export async function sumChiPhi(input: {
  donViId: number;
  loaiDonVi?: string;
  tuNgay: string;
  denNgay: string;
}) {
  return input.loaiDonVi === "he_thong"
    ? sumChiPhiAllDonViTrongKhoang(input.tuNgay, input.denNgay)
    : sumChiPhiTrongKhoang(input.donViId, input.tuNgay, input.denNgay);
}
