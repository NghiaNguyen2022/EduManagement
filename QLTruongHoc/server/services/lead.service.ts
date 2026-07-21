import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  assignTuVanVien,
  convertLeadToHocSinh,
  countLeadTheoMaPrefix,
  createLead,
  createLeadHoatDong,
  findLeadById,
  listLeadByDonVi,
  listLeadHoatDong,
  updateLeadInfo,
  updateLeadTrangThai,
} from "../db/lead.repository.js";
import { createHocSinhMoi } from "./hocSinh.service.js";
import { addGuardianToStudent } from "./phuHuynh.service.js";

type NguonLead =
  | "gioi_thieu"
  | "facebook"
  | "website"
  | "walk_in"
  | "khac";

type TrangThaiLead =
  | "moi"
  | "dang_cham_soc"
  | "da_hen_lich"
  | "da_hoc_thu"
  | "da_dang_ky"
  | "khong_tiep_tuc";

type LoaiHoatDong =
  | "goi_dien"
  | "gap_truc_tiep"
  | "nhan_tin"
  | "hen_lich"
  | "hoc_thu"
  | "khac";

const NGUON_HOP_LE: NguonLead[] = [
  "gioi_thieu",
  "facebook",
  "website",
  "walk_in",
  "khac",
];

const TRANG_THAI_QUA_HOAT_DONG: TrangThaiLead[] = [
  "moi",
  "dang_cham_soc",
  "da_hen_lich",
  "da_hoc_thu",
  "khong_tiep_tuc",
];

const LOAI_HOAT_DONG_HOP_LE: LoaiHoatDong[] = [
  "goi_dien",
  "gap_truc_tiep",
  "nhan_tin",
  "hen_lich",
  "hoc_thu",
  "khac",
];

const MOI_QUAN_HE_HOP_LE = [
  "cha",
  "me",
  "ong",
  "ba",
  "nguoi_giam_ho",
  "khac",
];

function nowDateTime() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function sinhMaLead(donViId: number) {
  const nam = new Date().getFullYear();
  const prefix = `LD${nam}`;
  const total = await countLeadTheoMaPrefix(donViId, prefix);
  return `${prefix}${String(total + 1).padStart(4, "0")}`;
}

export async function listLead(donViId: number) {
  return listLeadByDonVi(donViId);
}

export async function getLeadDetail(
  donViId: number,
  leadId: number,
) {
  const found = await findLeadById(donViId, leadId);

  if (!found) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  const hoatDong = await listLeadHoatDong(leadId);

  return { lead: found, hoatDong };
}

export async function createLeadMoi(input: {
  donViId: number;
  hoTen: string;
  soDienThoai: string;
  email?: string | null;
  nguon?: string;
  doTuoiHoacTrinhDo?: string | null;
  nhuCau?: string | null;
  tuVanVienId?: number | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const hoTen = input.hoTen.trim();
  const soDienThoai = input.soDienThoai.trim();

  if (!hoTen) {
    throw new Error("Vui lòng nhập họ tên người liên hệ.");
  }

  if (!soDienThoai) {
    throw new Error("Vui lòng nhập số điện thoại.");
  }

  const nguon = (input.nguon || "khac") as NguonLead;

  if (!NGUON_HOP_LE.includes(nguon)) {
    throw new Error("Nguồn lead không hợp lệ.");
  }

  const maLead = await sinhMaLead(input.donViId);

  const created = await createLead({
    donViId: input.donViId,
    maLead,
    hoTen,
    soDienThoai,
    email: input.email?.trim() || null,
    nguon,
    doTuoiHoacTrinhDo: input.doTuoiHoacTrinhDo?.trim() || null,
    nhuCau: input.nhuCau?.trim() || null,
    tuVanVienId: input.tuVanVienId ?? null,
  });

  if (!created) {
    throw new Error("Không thể tạo lead.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.create",
    objectType: "Lead",
    objectId: String(created.id),
    content: `Tạo lead ${created.hoTen} (${created.maLead}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function updateLeadThongTin(input: {
  donViId: number;
  id: number;
  hoTen: string;
  soDienThoai: string;
  email?: string | null;
  nguon?: string;
  doTuoiHoacTrinhDo?: string | null;
  nhuCau?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLeadById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  if (existing.trangThai === "da_dang_ky") {
    throw new Error(
      "Lead đã xác nhận đăng ký, không thể sửa thông tin.",
    );
  }

  const hoTen = input.hoTen.trim();
  const soDienThoai = input.soDienThoai.trim();

  if (!hoTen) {
    throw new Error("Vui lòng nhập họ tên người liên hệ.");
  }

  if (!soDienThoai) {
    throw new Error("Vui lòng nhập số điện thoại.");
  }

  const nguon = (input.nguon || "khac") as NguonLead;

  if (!NGUON_HOP_LE.includes(nguon)) {
    throw new Error("Nguồn lead không hợp lệ.");
  }

  const updated = await updateLeadInfo({
    id: input.id,
    hoTen,
    soDienThoai,
    email: input.email?.trim() || null,
    nguon,
    doTuoiHoacTrinhDo: input.doTuoiHoacTrinhDo?.trim() || null,
    nhuCau: input.nhuCau?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật lead.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.update",
    objectType: "Lead",
    objectId: String(updated.id),
    content: `Cập nhật thông tin lead ${updated.hoTen} (${updated.maLead}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function assignLeadTuVanVien(input: {
  donViId: number;
  id: number;
  tuVanVienId: number | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLeadById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  const updated = await assignTuVanVien({
    id: input.id,
    tuVanVienId: input.tuVanVienId,
  });

  if (!updated) {
    throw new Error("Không thể phân công tư vấn viên.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.assign",
    objectType: "Lead",
    objectId: String(updated.id),
    content: `Phân công tư vấn viên cho lead ${updated.hoTen} (${updated.maLead}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function addLeadHoatDongMoi(input: {
  donViId: number;
  leadId: number;
  loaiHoatDong: string;
  noiDung: string;
  ketQua?: string | null;
  thoiGian?: string | null;
  trangThaiMoi?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLeadById(input.donViId, input.leadId);

  if (!existing) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  if (
    existing.trangThai === "da_dang_ky" ||
    existing.trangThai === "khong_tiep_tuc"
  ) {
    throw new Error(
      "Lead đã đóng (đã đăng ký hoặc không tiếp tục), không thể ghi thêm hoạt động. Hãy mở lại trạng thái trước.",
    );
  }

  if (
    !LOAI_HOAT_DONG_HOP_LE.includes(
      input.loaiHoatDong as LoaiHoatDong,
    )
  ) {
    throw new Error("Loại hoạt động không hợp lệ.");
  }

  const noiDung = input.noiDung.trim();

  if (!noiDung) {
    throw new Error("Vui lòng nhập nội dung hoạt động.");
  }

  const activity = await createLeadHoatDong({
    leadId: input.leadId,
    loaiHoatDong: input.loaiHoatDong as LoaiHoatDong,
    noiDung,
    ketQua: input.ketQua?.trim() || null,
    nguoiThucHienId: input.actorUserId,
    thoiGian: input.thoiGian || nowDateTime(),
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.add_activity",
    objectType: "LeadHoatDong",
    objectId: activity ? String(activity.id) : null,
    content: `Ghi nhận hoạt động chăm sóc lead ${existing.hoTen} (${existing.maLead}).`,
    ipAddress: input.ipAddress,
  });

  if (
    input.trangThaiMoi &&
    input.trangThaiMoi !== existing.trangThai
  ) {
    if (
      !TRANG_THAI_QUA_HOAT_DONG.includes(
        input.trangThaiMoi as TrangThaiLead,
      )
    ) {
      throw new Error(
        "Không thể chuyển sang trạng thái này qua ghi nhận hoạt động. Trạng thái đã đăng ký chỉ được đặt qua xác nhận đăng ký.",
      );
    }

    if (input.trangThaiMoi === "khong_tiep_tuc") {
      throw new Error(
        "Vui lòng dùng chức năng đánh dấu không tiếp tục để nhập lý do.",
      );
    }

    const updated = await updateLeadTrangThai({
      id: input.leadId,
      trangThai: input.trangThaiMoi as TrangThaiLead,
      lyDoKhongTiepTuc: null,
    });

    await createAuditLog({
      userId: input.actorUserId,
      organizationId: input.donViId,
      action: "lead.change_status",
      objectType: "Lead",
      objectId: String(input.leadId),
      content: `Đổi trạng thái lead sang ${input.trangThaiMoi}.`,
      ipAddress: input.ipAddress,
    });

    return { activity, lead: updated };
  }

  return { activity, lead: existing };
}

export async function markLeadKhongTiepTuc(input: {
  donViId: number;
  id: number;
  lyDo: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLeadById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  if (existing.trangThai === "da_dang_ky") {
    throw new Error("Lead đã đăng ký, không thể đánh dấu không tiếp tục.");
  }

  const lyDo = input.lyDo.trim();

  if (!lyDo) {
    throw new Error("Vui lòng nhập lý do không tiếp tục.");
  }

  const updated = await updateLeadTrangThai({
    id: input.id,
    trangThai: "khong_tiep_tuc",
    lyDoKhongTiepTuc: lyDo,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.mark_not_continuing",
    objectType: "Lead",
    objectId: String(input.id),
    content: `Đánh dấu lead ${existing.hoTen} (${existing.maLead}) không tiếp tục: ${lyDo}`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function reopenLead(input: {
  donViId: number;
  id: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLeadById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  if (existing.trangThai !== "khong_tiep_tuc") {
    throw new Error("Chỉ mở lại được lead đang ở trạng thái không tiếp tục.");
  }

  const updated = await updateLeadTrangThai({
    id: input.id,
    trangThai: "dang_cham_soc",
    lyDoKhongTiepTuc: null,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.reopen",
    objectType: "Lead",
    objectId: String(input.id),
    content: `Mở lại lead ${existing.hoTen} (${existing.maLead}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function confirmLeadRegistration(input: {
  donViId: number;
  leadId: number;
  hoTenHocVien: string;
  ngaySinh: string;
  gioiTinh?: string | null;
  diaChiHocVien?: string | null;
  ngayNhapHoc?: string | null;
  moiQuanHe: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findLeadById(input.donViId, input.leadId);

  if (!existing) {
    throw new Error("Không tìm thấy lead trong đơn vị hiện tại.");
  }

  if (existing.trangThai === "da_dang_ky") {
    throw new Error("Lead này đã xác nhận đăng ký trước đó.");
  }

  if (existing.trangThai === "khong_tiep_tuc") {
    throw new Error(
      "Lead đang ở trạng thái không tiếp tục. Vui lòng mở lại trước khi xác nhận đăng ký.",
    );
  }

  if (!MOI_QUAN_HE_HOP_LE.includes(input.moiQuanHe)) {
    throw new Error("Mối quan hệ không hợp lệ.");
  }

  const hocSinhMoi = await createHocSinhMoi({
    donViId: input.donViId,
    hoTen: input.hoTenHocVien,
    ngaySinh: input.ngaySinh,
    gioiTinh: input.gioiTinh ?? null,
    diaChi: input.diaChiHocVien ?? null,
    ngayNhapHoc: input.ngayNhapHoc ?? null,
    actorUserId: input.actorUserId,
    ipAddress: input.ipAddress,
  });

  await addGuardianToStudent({
    donViId: input.donViId,
    hocSinhId: hocSinhMoi.id,
    dienThoai: existing.soDienThoai,
    hoTen: existing.hoTen,
    email: existing.email,
    moiQuanHe: input.moiQuanHe,
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId: input.actorUserId,
    ipAddress: input.ipAddress,
  });

  const updatedLead = await convertLeadToHocSinh({
    id: input.leadId,
    hocSinhId: hocSinhMoi.id,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "lead.confirm_registration",
    objectType: "Lead",
    objectId: String(input.leadId),
    content: `Xác nhận đăng ký lead ${existing.hoTen} (${existing.maLead}) thành học sinh ${hocSinhMoi.hoTen} (${hocSinhMoi.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  return { lead: updatedLead, hocSinh: hocSinhMoi };
}
